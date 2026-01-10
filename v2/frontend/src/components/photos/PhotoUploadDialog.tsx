import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadDialogProps {
  restaurantId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export function PhotoUploadDialog({
  restaurantId,
  open,
  onOpenChange,
  onUploadComplete
}: PhotoUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('is_primary', files.indexOf(file) === 0 ? 'true' : 'false');

        const response = await fetch(`/api/restaurants/${restaurantId}/photos`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to upload photo');
        }
      }

      setFiles([]);
      onUploadComplete();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-navy-900">Upload Photos</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-white/30 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive
                ? 'border-navy-900 bg-navy-900/10 scale-[1.02]'
                : 'border-gray-300 hover:border-navy-900 hover:bg-white/20'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDragActive ? 'text-navy-900' : 'text-gray-400'}`} />
            {isDragActive ? (
              <p className="text-lg font-semibold text-navy-900">Drop photos here...</p>
            ) : (
              <div>
                <p className="text-lg font-semibold text-navy-900 mb-2">Drag & drop photos here</p>
                <p className="text-sm text-gray-600 mb-3">
                  or click to browse your files
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 text-sm text-gray-700">
                  <span>Max 10MB per file</span>
                  <span>•</span>
                  <span>JPEG, PNG, WebP</span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy-900">
                  Selected Files
                </h3>
                <span className="px-3 py-1 rounded-full bg-navy-900 text-white text-sm font-medium">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/60 hover:bg-white/80 rounded-lg border border-gray-200 group transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-navy-900/10 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-navy-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        Primary
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
                      aria-label="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  i
                </div>
                <p className="text-sm text-blue-900">
                  The first photo will be set as the <strong>primary photo</strong> for this restaurant
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
            <button
              onClick={() => onOpenChange(false)}
              className="px-6 py-3 rounded-lg glass-button font-medium hover:bg-white/40 transition-colors disabled:opacity-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {files.length} Photo{files.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
