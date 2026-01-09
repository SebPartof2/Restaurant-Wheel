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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Upload Photos</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive
                ? 'border-navy-900 bg-navy-900/10'
                : 'border-gray-300 hover:border-navy-900/50 hover:bg-white/10'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="font-medium">Drop photos here...</p>
            ) : (
              <div>
                <p className="font-medium text-gray-700">Drag & drop photos here</p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (max 10MB per file)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPEG, PNG, WebP
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-700">Selected Files ({files.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white/50 rounded-lg group"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    {index === 0 && (
                      <span className="text-xs bg-navy-900 text-white px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                The first photo will be set as the primary photo
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-white/20">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} Photo${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
