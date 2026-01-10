import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star, Trash2, Edit2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { RestaurantPhoto } from '../../../../shared/types';
import { useUpdatePhoto, useDeletePhoto } from '../../hooks/usePhotos';
import { useAuth } from '../../contexts/AuthContext';

interface PhotoGalleryProps {
  photos: RestaurantPhoto[];
  restaurantName: string;
  restaurantId: number;
}

export function PhotoGallery({ photos, restaurantName, restaurantId }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState('');
  const { user } = useAuth();

  const updatePhoto = useUpdatePhoto();
  const deletePhoto = useDeletePhoto();

  if (photos.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-500">No photos yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to upload a photo!</p>
      </div>
    );
  }

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setEditingCaption(false);
    setSelectedIndex(selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setEditingCaption(false);
    setSelectedIndex(selectedIndex === photos.length - 1 ? 0 : selectedIndex + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCaption) return;
    if (e.key === 'Escape') {
      setSelectedIndex(null);
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const handleDelete = (photoId: number) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deletePhoto.mutate(
        { restaurantId, photoId },
        {
          onSuccess: () => {
            if (photos.length === 1) {
              setSelectedIndex(null);
            } else if (selectedIndex !== null && selectedIndex >= photos.length - 1) {
              setSelectedIndex(photos.length - 2);
            }
          },
        }
      );
    }
  };

  const handleSetPrimary = (photoId: number) => {
    updatePhoto.mutate({ restaurantId, photoId, is_primary: true });
  };

  const handleEditCaption = (photo: RestaurantPhoto) => {
    setCaptionValue(photo.caption || '');
    setEditingCaption(true);
  };

  const handleSaveCaption = (photoId: number) => {
    updatePhoto.mutate(
      { restaurantId, photoId, caption: captionValue },
      {
        onSuccess: () => {
          setEditingCaption(false);
        },
      }
    );
  };

  const canEditPhoto = (photo: RestaurantPhoto) => {
    return !!user && (!!user.is_admin || photo.uploaded_by_user_id === user.id);
  };

  const canDeletePhoto = (photo: RestaurantPhoto) => {
    return !!user && (!!user.is_admin || photo.uploaded_by_user_id === user.id);
  };

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(index)}
            className="aspect-square rounded-xl overflow-hidden glass-card-hover group relative focus:outline-none focus:ring-2 focus:ring-navy-900"
          >
            <img
              src={photo.thumbnail_url}
              alt={`Photo ${index + 1} of ${restaurantName}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

            {photo.is_primary && (
              <div className="absolute top-2 right-2">
                <span className="bg-navy-900 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Primary
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white text-sm">
                <p className="font-medium truncate">
                  {photo.uploaded_by?.name || 'User'}
                </p>
                <p className="text-xs opacity-80">
                  {formatDistanceToNow(new Date(photo.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Full-screen carousel */}
      {selectedIndex !== null && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => {
            setSelectedIndex(null);
            setEditingCaption(false);
          }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
              setEditingCaption(false);
            }}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={photos.length === 1}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={photos.length === 1}
            aria-label="Next photo"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.original_url}
              alt={`Photo ${selectedIndex + 1} of ${restaurantName}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            <div className="glass-card mt-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-medium flex-shrink-0">
                    {selectedPhoto.uploaded_by?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {selectedPhoto.uploaded_by?.name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(selectedPhoto.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {!!user?.is_admin && !selectedPhoto.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(selectedPhoto.id)}
                      disabled={updatePhoto.isPending}
                      className="px-3 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                      title="Set as primary photo"
                    >
                      <Star className="w-4 h-4" />
                      Set Primary
                    </button>
                  )}
                  {canDeletePhoto(selectedPhoto) && (
                    <button
                      onClick={() => handleDelete(selectedPhoto.id)}
                      disabled={deletePhoto.isPending}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-1 disabled:opacity-50"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Caption Section */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                {editingCaption ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={captionValue}
                      onChange={(e) => setCaptionValue(e.target.value)}
                      placeholder="Add a caption..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          handleSaveCaption(selectedPhoto.id);
                        } else if (e.key === 'Escape') {
                          setEditingCaption(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSaveCaption(selectedPhoto.id)}
                      disabled={updatePhoto.isPending}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCaption(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-700 text-sm flex-1">
                      {selectedPhoto.caption || (
                        <span className="text-gray-400 italic">No caption</span>
                      )}
                    </p>
                    {canEditPhoto(selectedPhoto) && (
                      <button
                        onClick={() => handleEditCaption(selectedPhoto)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit caption"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Photo {selectedIndex + 1} of {photos.length}
                {selectedPhoto.is_primary && (
                  <span className="ml-2 text-navy-900 font-medium">• Primary Photo</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
