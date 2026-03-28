import React from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  onUpload: (files: File[]) => void;
  onRemoveExisting?: (index: number) => void;
  onRemovePending?: (index: number) => void;
  currentImages?: string[];
  pendingImages?: File[];
  loading?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  onUpload,
  onRemoveExisting,
  onRemovePending,
  currentImages = [],
  pendingImages = [],
  loading = false,
  maxFiles = 4,
  maxSize = 5,
}) => {
  const [dragActive, setDragActive] = React.useState(false);

  const resolvePreviewSrc = (src: string) => {
    if (!src) return src;
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    if (src.startsWith('/client/public/')) {
      return src.replace('/client/public', '');
    }
    return src;
  };

  const totalImages = currentImages.length + pendingImages.length;

  const handleFiles = (files: FileList) => {
    const newFiles: File[] = [];

    for (let i = 0; i < Math.min(files.length, maxFiles - totalImages); i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải file ảnh`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} vượt quá ${maxSize}MB`);
        continue;
      }

      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      onUpload(newFiles);
    }

    if (totalImages + newFiles.length > maxFiles) {
      toast.warning(`Tối đa ${maxFiles} ảnh cho một sản phẩm`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const canAdd = totalImages < maxFiles;
  const pendingPreviews = pendingImages.map((file) => URL.createObjectURL(file));

  return (
    <div className="space-y-4">
      {canAdd && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-[#C9A24D] bg-[#C9A24D]/5'
              : 'border-gray-300 hover:border-gray-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            disabled={loading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Kéo thả ảnh vào đây hoặc nhấp để chọn
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP, GIF - Tối đa {maxSize}MB ({totalImages}/{maxFiles})
              </p>
            </div>
          </div>
        </div>
      )}

      {(currentImages.length > 0 || pendingPreviews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentImages.map((preview, index) => (
            <div
              key={`existing-${preview}-${index}`}
              className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group"
            >
              <img src={resolvePreviewSrc(preview)} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button
                onClick={() => onRemoveExisting?.(index)}
                disabled={loading}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </span>
            </div>
          ))}

          {pendingPreviews.map((preview, index) => (
            <div
              key={`pending-${index}`}
              className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group"
            >
              <img src={preview} alt={`Pending ${index}`} className="w-full h-full object-cover" />
              <button
                onClick={() => onRemovePending?.(index)}
                disabled={loading}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <span className="absolute top-2 left-2 bg-[#C9A24D] text-white text-xs px-2 py-1 rounded">
                Mới
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
