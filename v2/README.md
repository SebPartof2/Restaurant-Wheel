# The Wheel v2

A modern restaurant selection and rating system with glassmorphism design and multi-photo support.

## 🎨 Key Features

### Glassmorphism Design
- Modern frosted glass effects with backdrop blur
- Smooth animations and hover effects
- Gradient backgrounds (blue → indigo → purple)
- Navy blue (#1e3a8a) primary color scheme

### Multi-Photo Support
- Upload multiple photos per restaurant
- Photo attribution (uploader name and date)
- Primary photo selection
- Full-screen gallery with carousel navigation
- Drag-and-drop upload interface

### Cloudflare R2 Storage
- Efficient photo storage with CDN delivery
- Automatic thumbnail generation (300px, 800px)
- Public bucket with custom domain support
- File validation (type, size, dimensions)

### Data Migration
- Clean v2 rebuild in separate directory
- One-time migration script from v1
- Legacy photo URL preservation
- Validation and rollback support

## 📦 Project Structure

```
v2/
├── backend/              # Cloudflare Workers API
│   ├── src/
│   │   ├── handlers/     # API route handlers
│   │   │   └── photos.ts # Photo upload/management
│   │   ├── services/
│   │   │   └── photo-service.ts # R2 integration
│   │   ├── middleware/
│   │   └── router.ts
│   ├── migrations/       # D1 database migrations
│   │   ├── 0008_add_restaurant_photos.sql
│   │   └── 0009_add_legacy_photos.sql
│   └── wrangler.toml     # R2 bucket configuration
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── photos/   # Photo components
│   │   │   │   ├── PhotoUploadDialog.tsx
│   │   │   │   └── PhotoGallery.tsx
│   │   │   └── restaurant/
│   │   │       └── RestaurantCard.tsx
│   │   └── styles/
│   │       └── index.css # Glassmorphism styles
│   └── tailwind.config.js
├── shared/               # Shared types
│   └── types.ts          # Updated with photo types
└── migration/            # Migration scripts
    ├── migrate-v1-to-v2.ts
    └── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with D1 and R2 access

### Backend Setup

```bash
cd v2/backend

# Install dependencies
npm install

# Create D1 database
wrangler d1 create restaurant-wheel-db-v2

# Update wrangler.toml with database_id

# Run migrations
wrangler d1 migrations apply restaurant-wheel-db-v2 --local

# Create R2 bucket
wrangler r2 bucket create wheel-restaurant-photos

# Run development server
npm run dev
```

### Frontend Setup

```bash
cd v2/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` to see the demo.

## 🎨 Glassmorphism Design System

### CSS Classes

```css
/* Glass card - Static */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

/* Glass card - Hoverable */
.glass-card-hover {
  /* Same as glass-card + */
  transition: all 0.3s;
}
.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
  transform: scale(1.02);
}

/* Glass navigation */
.glass-nav {
  background: rgba(255, 255, 255, 0.40);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.20);
}

/* Glass button */
.glass-button {
  background: rgba(255, 255, 255, 0.20);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.30);
}
```

### Color Palette

```javascript
// Navy (Primary)
navy-900: '#1e3a8a'
navy-800: '#253a96'
navy-700: '#2743b8'

// Gradients
background: linear-gradient(135deg,
  #f0f4fc /* blue-50 */ 0%,
  #e0e7ff /* indigo-50 */ 50%,
  #f3e8ff /* purple-50 */ 100%
)
```

## 📸 Photo API

### Upload Photo

```typescript
POST /api/restaurants/:id/photos
Content-Type: multipart/form-data

Body:
- file: File (required)
- is_primary: boolean (optional)
- display_order: number (optional)

Response:
{
  "photo": {
    "id": 1,
    "restaurant_id": 1,
    "r2_key": "restaurants/1/uuid-original.jpg",
    "filename": "photo.jpg",
    "mime_type": "image/jpeg",
    "file_size": 1234567,
    "is_primary": true,
    "uploaded_by_user_id": 1,
    "thumbnail_url": "https://photos.wheel.sebbyboe.online/...",
    "medium_url": "https://photos.wheel.sebbyboe.online/...",
    "original_url": "https://photos.wheel.sebbyboe.online/..."
  }
}
```

### Get Photos

```typescript
GET /api/restaurants/:id/photos

Response:
{
  "photos": [
    { /* photo object */ }
  ]
}
```

### Update Photo Metadata

```typescript
PATCH /api/restaurants/:id/photos/:photoId
Content-Type: application/json

Body:
{
  "is_primary": true,
  "display_order": 0
}

Authorization: Admin only
```

### Delete Photo

```typescript
DELETE /api/restaurants/:id/photos/:photoId

Authorization: Admin or uploader only
```

## 🗄️ Database Schema

### New Tables

```sql
-- Multiple photos per restaurant
CREATE TABLE restaurant_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  is_primary BOOLEAN DEFAULT 0,
  uploaded_by_user_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);

-- Legacy photo URLs from v1
CREATE TABLE legacy_photo_urls (
  restaurant_id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

## 🔄 Migration from V1

See [migration/README.md](migration/README.md) for detailed migration instructions.

Quick start:

```bash
# 1. Backup v1 database
wrangler d1 export restaurant-wheel-db --remote > v1-backup.sql

# 2. Create v2 database
wrangler d1 create restaurant-wheel-db-v2

# 3. Run migrations
cd backend
wrangler d1 migrations apply restaurant-wheel-db-v2 --remote

# 4. Run migration script (see migration/README.md)

# 5. Validate
wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="SELECT COUNT(*) FROM restaurants"
```

## 🧪 Testing

### Frontend Demo

```bash
cd v2/frontend
npm run dev
```

Visit `http://localhost:5173` to see:
- Glassmorphism styling throughout the app
- Restaurant cards with photo thumbnails
- Photo gallery with carousel
- Photo upload dialog with drag-and-drop

### Backend Testing

```bash
cd v2/backend
npm run dev

# Test photo upload (requires running backend + database)
curl -X POST http://localhost:8787/api/restaurants/1/photos \
  -F "file=@photo.jpg" \
  -F "is_primary=true" \
  -H "Cookie: wheel_session=..."
```

## 📋 Phase Implementation Status

- ✅ **Phase 1**: Directory structure and foundation setup
- ✅ **Phase 2**: Database schema migrations for photos
- ✅ **Phase 3**: Cloudflare R2 bucket configuration
- ✅ **Phase 4**: Backend photo API and PhotoService
- ✅ **Phase 5**: Glassmorphism design system
- ✅ **Phase 6**: Frontend photo components
- ✅ **Phase 7**: Data migration script
- ✅ **Phase 8**: Glassmorphism styling applied
- ✅ **Phase 9**: Testing and validation documentation

## 🚢 Deployment

### Backend (Cloudflare Workers)

```bash
cd v2/backend

# Deploy to production
wrangler deploy

# Run migrations on production database
wrangler d1 migrations apply restaurant-wheel-db-v2 --remote
```

### Frontend (Vercel/Netlify)

```bash
cd v2/frontend

# Build for production
npm run build

# Deploy (example with Vercel)
vercel --prod
```

### R2 Custom Domain

1. Go to Cloudflare Dashboard → R2
2. Select `wheel-restaurant-photos` bucket
3. Settings → Public Access → Enable
4. Custom Domains → Add `photos.wheel.sebbyboe.online`
5. Update DNS: CNAME `photos` → `<bucket-url>`

## 📝 Development Notes

### File Upload Limitations

- Max file size: 10MB
- Allowed types: JPEG, PNG, WebP
- Max dimension: 4096px
- Min dimension: 200px

### Thumbnail Generation

Currently using Cloudflare's URL-based image resizing:
```
/cdn-cgi/image/width=300,format=webp/<image-path>
```

For production, consider:
- Pre-generating thumbnails on upload
- Using Cloudflare Images variants
- External image processing service

### Legacy Photo Handling

V1 photos (external URLs) are preserved:
1. Entry in `restaurant_photos` with `r2_key='legacy/{id}'`
2. Original URL in `legacy_photo_urls` table
3. Frontend checks for `legacy/` prefix and displays external URL

## 🤝 Contributing

When adding new features:

1. Follow glassmorphism design patterns
2. Use existing CSS classes (`.glass-card`, `.glass-button`)
3. Keep navy blue (#1e3a8a) as primary color
4. Add TypeScript types in `shared/types.ts`
5. Update database migrations sequentially
6. Test on mobile (responsive design)

## 📄 License

Same as v1 - Private use for restaurant selection group.

## 🙏 Acknowledgments

- **shadcn/ui** - Component patterns and accessibility
- **Tailwind CSS** - Utility-first CSS framework
- **Cloudflare** - Workers, D1, and R2 infrastructure
- **React** - UI library
- **Vite** - Build tool

---

**Built with ❤️ for better restaurant decisions**
