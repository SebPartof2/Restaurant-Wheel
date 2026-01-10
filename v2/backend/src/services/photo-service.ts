import { v4 as uuidv4 } from 'uuid';
import type { DbService } from './db';
import type { RestaurantPhoto } from '../../../shared/types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 4096;
const MIN_DIMENSION = 200;

interface PhotoMetadata {
  restaurant_id: number;
  filename: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  uploaded_by_user_id: number;
  is_primary: boolean;
  display_order: number;
}

export class PhotoService {
  constructor(
    private db: DbService,
    private bucket: R2Bucket,
    private publicUrl: string
  ) {}

  /**
   * Upload a photo for a restaurant
   */
  async uploadPhoto(
    restaurantId: number,
    file: File,
    uploadedByUserId: number,
    isPrimary: boolean = false,
    displayOrder: number = 0
  ): Promise<RestaurantPhoto> {
    // Validate file
    this.validateFile(file);

    // Generate UUID for unique filename
    const uuid = uuidv4();
    const ext = this.getExtension(file.type);
    const originalKey = `restaurants/${restaurantId}/${uuid}-original.${ext}`;

    // Get image dimensions (if available)
    const dimensions = await this.getImageDimensions(file);

    // Upload original to R2
    await this.bucket.put(originalKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // If setting as primary, unset other primary photos for this restaurant
    if (isPrimary) {
      await this.db.execute(
        'UPDATE restaurant_photos SET is_primary = 0 WHERE restaurant_id = ?',
        [restaurantId]
      );
    }

    // Save metadata to D1
    const result = await this.db.execute(
      `INSERT INTO restaurant_photos
       (restaurant_id, r2_key, filename, mime_type, file_size, width, height, is_primary, uploaded_by_user_id, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurantId,
        originalKey,
        file.name,
        file.type,
        file.size,
        dimensions.width,
        dimensions.height,
        isPrimary ? 1 : 0,
        uploadedByUserId,
        displayOrder,
      ]
    );

    const photoId = result.lastRowId;
    return this.getPhotoById(photoId);
  }

  /**
   * Get a single photo by ID
   */
  async getPhotoById(photoId: number): Promise<RestaurantPhoto> {
    const photo = await this.db.queryOne<any>(
      `SELECT p.*, u.id as uploader_id, u.name as uploader_name, u.email as uploader_email
       FROM restaurant_photos p
       LEFT JOIN users u ON p.uploaded_by_user_id = u.id
       WHERE p.id = ?`,
      [photoId]
    );

    if (!photo) {
      throw new Error('Photo not found');
    }

    return this.formatPhoto(photo);
  }

  /**
   * Get all photos for a restaurant
   */
  async getPhotosForRestaurant(restaurantId: number): Promise<RestaurantPhoto[]> {
    const photos = await this.db.queryAll<any>(
      `SELECT p.*, u.id as uploader_id, u.name as uploader_name, u.email as uploader_email
       FROM restaurant_photos p
       LEFT JOIN users u ON p.uploaded_by_user_id = u.id
       WHERE p.restaurant_id = ?
       ORDER BY p.is_primary DESC, p.display_order ASC, p.created_at ASC`,
      [restaurantId]
    );

    return photos.map(photo => this.formatPhoto(photo));
  }

  /**
   * Get primary photo for a restaurant
   */
  async getPrimaryPhoto(restaurantId: number): Promise<RestaurantPhoto | null> {
    const photo = await this.db.queryOne<any>(
      `SELECT p.*, u.id as uploader_id, u.name as uploader_name, u.email as uploader_email
       FROM restaurant_photos p
       LEFT JOIN users u ON p.uploaded_by_user_id = u.id
       WHERE p.restaurant_id = ? AND p.is_primary = 1`,
      [restaurantId]
    );

    return photo ? this.formatPhoto(photo) : null;
  }

  /**
   * Update photo metadata (is_primary, display_order)
   */
  async updatePhotoMetadata(
    photoId: number,
    updates: { is_primary?: boolean; display_order?: number }
  ): Promise<RestaurantPhoto> {
    const photo = await this.getPhotoById(photoId);

    // If setting as primary, unset other primary photos for this restaurant
    if (updates.is_primary) {
      await this.db.execute(
        'UPDATE restaurant_photos SET is_primary = 0 WHERE restaurant_id = ?',
        [photo.restaurant_id]
      );
    }

    // Build update query
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.is_primary !== undefined) {
      updateFields.push('is_primary = ?');
      params.push(updates.is_primary ? 1 : 0);
    }

    if (updates.display_order !== undefined) {
      updateFields.push('display_order = ?');
      params.push(updates.display_order);
    }

    if (updateFields.length > 0) {
      params.push(photoId);
      await this.db.execute(
        `UPDATE restaurant_photos SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
    }

    return this.getPhotoById(photoId);
  }

  /**
   * Delete a photo (removes from R2 and database)
   */
  async deletePhoto(photoId: number): Promise<void> {
    const photo = await this.getPhotoById(photoId);

    // Delete from R2
    await this.bucket.delete(photo.r2_key);

    // Also try to delete potential thumbnail/medium versions if they exist
    // (In a full implementation, we'd track these separately or use naming conventions)
    const basePath = photo.r2_key.replace('-original', '');
    const ext = photo.r2_key.split('.').pop();

    // Try to delete thumbnail and medium versions (won't error if they don't exist)
    try {
      await this.bucket.delete(basePath.replace(`.${ext}`, '-thumbnail.webp'));
      await this.bucket.delete(basePath.replace(`.${ext}`, '-medium.webp'));
    } catch (error) {
      // Ignore errors for non-existent files
      console.log('Could not delete thumbnail/medium versions:', error);
    }

    // Delete from database
    await this.db.execute('DELETE FROM restaurant_photos WHERE id = ?', [photoId]);
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    // Check mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${file.size} bytes. Maximum: ${MAX_FILE_SIZE} bytes`);
    }

    // Check filename
    if (!file.name || file.name.length > 255) {
      throw new Error('Invalid filename');
    }
  }

  /**
   * Get file extension from mime type
   */
  private getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
    };
    return map[mimeType] || 'jpg';
  }

  /**
   * Get image dimensions from file
   * Note: This is a simplified version. In production, you'd want to use
   * an image processing library or Cloudflare's Image Resizing API
   */
  private async getImageDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
    try {
      // For now, return null dimensions
      // In production, you could use:
      // 1. Browser Image API (if available in Workers)
      // 2. WASM-based image decoder
      // 3. External service
      // 4. Cloudflare Image Resizing API metadata
      return { width: null, height: null };
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return { width: null, height: null };
    }
  }

  /**
   * Format photo data for API response
   */
  private formatPhoto(photo: any): RestaurantPhoto {
    const baseUrl = this.publicUrl;
    const r2Key = photo.r2_key;

    // Generate URLs for different sizes
    // For now, we're using the original URL for all sizes
    // In production, you'd use Cloudflare's Image Resizing with URL parameters
    const originalUrl = `${baseUrl}/${r2Key}`;

    // Cloudflare Image Resizing format: /cdn-cgi/image/width=300,format=webp/path
    // Or use custom variants if configured
    const thumbnailUrl = `${baseUrl}/cdn-cgi/image/width=300,format=webp/${r2Key}`;
    const mediumUrl = `${baseUrl}/cdn-cgi/image/width=800,format=webp/${r2Key}`;

    return {
      id: photo.id,
      restaurant_id: photo.restaurant_id,
      r2_key: photo.r2_key,
      filename: photo.filename,
      mime_type: photo.mime_type,
      file_size: photo.file_size,
      width: photo.width,
      height: photo.height,
      is_primary: Boolean(photo.is_primary),
      uploaded_by_user_id: photo.uploaded_by_user_id,
      display_order: photo.display_order,
      caption: photo.caption || null,
      created_at: photo.created_at,
      thumbnail_url: thumbnailUrl,
      medium_url: mediumUrl,
      original_url: originalUrl,
      uploaded_by: photo.uploader_id
        ? {
            id: photo.uploader_id,
            name: photo.uploader_name,
            email: photo.uploader_email,
            is_admin: false,
            is_whitelisted: true,
            is_provisional: false,
            created_at: '',
          }
        : undefined,
    };
  }
}
