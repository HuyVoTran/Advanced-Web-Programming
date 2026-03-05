import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  onUpload: (files: File[]) => void;
  currentImages?: string[];
  loading?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  onUpload,
  currentImages = [],
  loading = false,
  maxFiles = 4,
  maxSize = 5,
}) => {
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList) => {
    const newFiles: File[] = [];

    for (let i = 0; i < Math.min(files.length, maxFiles - previews.length); i++) {
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

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }

    if (newFiles.length > 0) {
      onUpload(newFiles);
    }

    if (previews.length + newFiles.length > maxFiles) {
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

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const canAdd = previews.length < maxFiles;

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
                PNG, JPG, WebP, GIF - Tối đa {maxSize}MB ({previews.length}/{maxFiles})
              </p>
            </div>
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group"
            >
              <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
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
        </div>
      )}
    </div>
  );
};
