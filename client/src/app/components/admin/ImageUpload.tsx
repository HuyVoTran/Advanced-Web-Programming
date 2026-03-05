import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  currentImage?: string;
  loading?: boolean;
  maxSize?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  currentImage,
  loading = false,
  maxSize = 5,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Ảnh không được vượt quá ${maxSize}MB`);
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Callback
    onUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
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
              PNG, JPG, WebP, GIF - Tối đa {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {preview && (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square max-w-xs">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={clearImage}
            disabled={loading}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
