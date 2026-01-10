import { Context } from 'hono';
import { PhotoService } from '../services/photo-service';

/**
 * POST /api/restaurants/:id/photos
 * Upload a new photo for a restaurant
 */
export async function handleUploadPhoto(c: Context) {
  try {
    const restaurantId = parseInt(c.req.param('id'));
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const isPrimary = formData.get('is_primary') === 'true';
    const displayOrder = parseInt(formData.get('display_order') as string) || 0;
    const captionValue = formData.get('caption');
    const caption = captionValue && typeof captionValue === 'string' && captionValue.trim() !== ''
      ? captionValue.trim()
      : null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    console.log('Upload photo params:', { restaurantId, userId: user.id, isPrimary, displayOrder, caption, fileName: file.name });

    // Initialize PhotoService
    const photoService = new PhotoService(
      c.get('db'),
      c.env.PHOTOS_BUCKET,
      c.env.R2_PUBLIC_URL
    );

    // Upload photo
    const photo = await photoService.uploadPhoto(
      restaurantId,
      file,
      user.id,
      isPrimary,
      displayOrder,
      caption
    );

    return c.json({ photo }, 201);
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: error.message || 'Failed to upload photo' }, 500);
  }
}

/**
 * GET /api/restaurants/:id/photos
 * Get all photos for a restaurant
 */
export async function handleGetPhotos(c: Context) {
  try {
    const restaurantId = parseInt(c.req.param('id'));

    const photoService = new PhotoService(
      c.get('db'),
      c.env.PHOTOS_BUCKET,
      c.env.R2_PUBLIC_URL
    );

    const photos = await photoService.getPhotosForRestaurant(restaurantId);

    return c.json({ photos });
  } catch (error: any) {
    console.error('Error fetching photos:', error);
    return c.json({ error: error.message || 'Failed to fetch photos' }, 500);
  }
}

/**
 * PATCH /api/restaurants/:id/photos/:photoId
 * Update photo metadata (is_primary, display_order)
 */
export async function handleUpdatePhoto(c: Context) {
  try {
    const photoId = parseInt(c.req.param('photoId'));
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Only admins can update photo metadata
    if (!user.is_admin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const body = await c.req.json();
    const updates: { is_primary?: boolean; display_order?: number } = {};

    if (body.is_primary !== undefined) {
      updates.is_primary = Boolean(body.is_primary);
    }

    if (body.display_order !== undefined) {
      updates.display_order = parseInt(body.display_order);
    }

    const photoService = new PhotoService(
      c.get('db'),
      c.env.PHOTOS_BUCKET,
      c.env.R2_PUBLIC_URL
    );

    const photo = await photoService.updatePhotoMetadata(photoId, updates);

    return c.json({ photo });
  } catch (error: any) {
    console.error('Error updating photo:', error);
    return c.json({ error: error.message || 'Failed to update photo' }, 500);
  }
}

/**
 * DELETE /api/restaurants/:id/photos/:photoId
 * Delete a photo
 */
export async function handleDeletePhoto(c: Context) {
  try {
    const photoId = parseInt(c.req.param('photoId'));
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const photoService = new PhotoService(
      c.get('db'),
      c.env.PHOTOS_BUCKET,
      c.env.R2_PUBLIC_URL
    );

    // Get photo to check ownership
    const photo = await photoService.getPhotoById(photoId);

    // Only admin or the uploader can delete
    if (!user.is_admin && photo.uploaded_by_user_id !== user.id) {
      return c.json({ error: 'You can only delete your own photos' }, 403);
    }

    await photoService.deletePhoto(photoId);

    return c.json({ message: 'Photo deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting photo:', error);
    return c.json({ error: error.message || 'Failed to delete photo' }, 500);
  }
}
