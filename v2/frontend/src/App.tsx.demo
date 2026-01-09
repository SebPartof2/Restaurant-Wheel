import { useState } from 'react';
import { RestaurantCard } from './components/restaurant/RestaurantCard';
import { PhotoGallery } from './components/photos/PhotoGallery';
import { PhotoUploadDialog } from './components/photos/PhotoUploadDialog';
import type { Restaurant, RestaurantPhoto } from '../../shared/types';

// Sample data for demonstration
const sampleRestaurant: Restaurant = {
  id: 1,
  name: "Giovanni's Italian Kitchen",
  address: "123 Main Street, Downtown District",
  is_fast_food: false,
  menu_link: "https://example.com/menu",
  photo_link: null,
  state: "active",
  nominated_by_user_id: 1,
  created_by_admin_id: null,
  average_rating: 8.5,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  visited_at: null,
  reservation_datetime: "2025-01-15T19:00:00Z",
  nominated_by: {
    id: 1,
    email: "user@example.com",
    name: "John Doe",
    is_admin: false,
    is_whitelisted: true,
    is_provisional: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  primary_photo: {
    id: 1,
    restaurant_id: 1,
    r2_key: "restaurants/1/abc123-original.jpg",
    filename: "storefront.jpg",
    mime_type: "image/jpeg",
    file_size: 1234567,
    width: 1920,
    height: 1080,
    is_primary: true,
    uploaded_by_user_id: 1,
    display_order: 0,
    created_at: "2025-01-01T00:00:00Z",
    thumbnail_url: "https://via.placeholder.com/300",
    medium_url: "https://via.placeholder.com/800",
    original_url: "https://via.placeholder.com/1920x1080",
  },
};

const samplePhotos: RestaurantPhoto[] = [
  {
    id: 1,
    restaurant_id: 1,
    r2_key: "restaurants/1/abc123-original.jpg",
    filename: "storefront.jpg",
    mime_type: "image/jpeg",
    file_size: 1234567,
    width: 1920,
    height: 1080,
    is_primary: true,
    uploaded_by_user_id: 1,
    display_order: 0,
    created_at: "2025-01-01T00:00:00Z",
    thumbnail_url: "https://via.placeholder.com/300/4287f5/ffffff?text=Photo+1",
    medium_url: "https://via.placeholder.com/800/4287f5/ffffff?text=Photo+1",
    original_url: "https://via.placeholder.com/1920x1080/4287f5/ffffff?text=Photo+1",
    uploaded_by: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      is_admin: false,
      is_whitelisted: true,
      is_provisional: false,
      created_at: "2025-01-01T00:00:00Z",
    },
  },
  {
    id: 2,
    restaurant_id: 1,
    r2_key: "restaurants/1/def456-original.jpg",
    filename: "interior.jpg",
    mime_type: "image/jpeg",
    file_size: 987654,
    width: 1920,
    height: 1080,
    is_primary: false,
    uploaded_by_user_id: 2,
    display_order: 1,
    created_at: "2025-01-02T00:00:00Z",
    thumbnail_url: "https://via.placeholder.com/300/f5a742/ffffff?text=Photo+2",
    medium_url: "https://via.placeholder.com/800/f5a742/ffffff?text=Photo+2",
    original_url: "https://via.placeholder.com/1920x1080/f5a742/ffffff?text=Photo+2",
    uploaded_by: {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      is_admin: true,
      is_whitelisted: true,
      is_provisional: false,
      created_at: "2025-01-01T00:00:00Z",
    },
  },
  {
    id: 3,
    restaurant_id: 1,
    r2_key: "restaurants/1/ghi789-original.jpg",
    filename: "food.jpg",
    mime_type: "image/jpeg",
    file_size: 876543,
    width: 1920,
    height: 1080,
    is_primary: false,
    uploaded_by_user_id: 1,
    display_order: 2,
    created_at: "2025-01-03T00:00:00Z",
    thumbnail_url: "https://via.placeholder.com/300/42f587/ffffff?text=Photo+3",
    medium_url: "https://via.placeholder.com/800/42f587/ffffff?text=Photo+3",
    original_url: "https://via.placeholder.com/1920x1080/42f587/ffffff?text=Photo+3",
    uploaded_by: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      is_admin: false,
      is_whitelisted: true,
      is_provisional: false,
      created_at: "2025-01-01T00:00:00Z",
    },
  },
];

function App() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-40 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-navy-900">The Wheel v2</h1>
          <nav className="flex items-center gap-4">
            <button className="glass-button px-4 py-2 rounded-lg font-medium">
              Restaurants
            </button>
            <button className="glass-button px-4 py-2 rounded-lg font-medium">
              Wheel
            </button>
            <button className="glass-button px-4 py-2 rounded-lg font-medium">
              Statistics
            </button>
            <button className="bg-navy-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors">
              Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-24">
        {/* Hero Section */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-4xl font-bold mb-4">Welcome to The Wheel v2</h2>
          <p className="text-lg text-gray-600 mb-6">
            A modern restaurant selection system with glassmorphism design and photo gallery capabilities.
          </p>
          <div className="flex gap-4">
            <button className="bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors">
              Spin the Wheel
            </button>
            <button className="glass-button px-6 py-3 rounded-lg font-medium">
              Browse Restaurants
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="text-sm text-gray-600 mb-2">Total Restaurants</div>
            <div className="text-3xl font-bold text-navy-900">150</div>
            <div className="text-xs text-gray-500 mt-2">↑ 12 this month</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-sm text-gray-600 mb-2">Average Rating</div>
            <div className="text-3xl font-bold text-navy-900">8.5</div>
            <div className="text-xs text-gray-500 mt-2">out of 10</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-sm text-gray-600 mb-2">Restaurants Visited</div>
            <div className="text-3xl font-bold text-navy-900">87</div>
            <div className="text-xs text-gray-500 mt-2">58% completion</div>
          </div>
        </div>

        {/* Restaurant Card Demo */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Restaurant Card (Glassmorphism)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RestaurantCard restaurant={sampleRestaurant} />
            <RestaurantCard
              restaurant={{ ...sampleRestaurant, state: "upcoming", is_fast_food: true, primary_photo: undefined }}
            />
            <RestaurantCard
              restaurant={{ ...sampleRestaurant, state: "visited", average_rating: 9.2 }}
            />
          </div>
        </div>

        {/* Photo Gallery Demo */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Photo Gallery</h3>
            <button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-navy-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors"
            >
              Upload Photos
            </button>
          </div>
          <PhotoGallery
            photos={samplePhotos}
            restaurantName={sampleRestaurant.name}
            canDelete={true}
            onDelete={(id) => alert(`Delete photo ${id}`)}
          />
        </div>

        {/* Feature Highlights */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-bold mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-lg mb-2">✨ Glassmorphism Design</h4>
              <p className="text-gray-600">
                Modern frosted glass effects with backdrop blur, transparency, and smooth animations.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">📸 Multi-Photo Support</h4>
              <p className="text-gray-600">
                Upload multiple photos per restaurant with attribution and gallery view.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">☁️ Cloudflare R2 Storage</h4>
              <p className="text-gray-600">
                Efficient photo storage with automatic thumbnail generation and CDN delivery.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">🔄 Data Migration</h4>
              <p className="text-gray-600">
                Seamless migration from v1 with legacy photo URL preservation.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Photo Upload Dialog */}
      <PhotoUploadDialog
        restaurantId={sampleRestaurant.id}
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={() => alert('Photos uploaded successfully!')}
      />
    </div>
  );
}

export default App;
