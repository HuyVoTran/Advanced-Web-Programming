import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, AlertCircle } from 'lucide-react';
import { useAdminFetch, useAdminMutation } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { ImageUpload } from '@/app/components/admin/ImageUpload';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
}

export const AdminCategories: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  // Fetch categories
  const { data: categories = [], loading, error, refetch } = useAdminFetch<Category[]>(
    () => adminApi.getAllCategories(),
    []
  );

  // Create/Update mutation
  const { mutate: saveCategory, loading: savingLoading } = useAdminMutation<Category>(
    editingId
      ? (data) => adminApi.updateCategory(editingId, data)
      : (data) => adminApi.createCategory(data)
  );

  // Delete mutation
  const { mutate: deleteCategory, loading: deletingLoading } = useAdminMutation<any>(
    (id) => adminApi.deleteCategory(id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedCategory = await saveCategory(formData);
      const categoryId = savedCategory?._id || editingId;

      if (pendingImage && categoryId) {
        setUploadingImage(true);
        await adminApi.uploadCategoryImage(categoryId, pendingImage);
      }

      toast.success(editingId ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục mới thành công!');
      resetForm();
      refetch();
    } catch (err) {
      toast.error('Lỗi khi lưu danh mục');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (id: string, name: string, description: string, image?: string) => {
    setFormData({ name, description, image: image || '' });
    setPendingImage(null);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      try {
        await deleteCategory(id);
        toast.success('Xóa danh mục thành công!');
        refetch();
      } catch (err) {
        toast.error('Lỗi khi xóa danh mục');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '' });
    setPendingImage(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (file: File) => {
    setPendingImage(file);
    toast.info('Ảnh sẽ được lưu khi bạn bấm thêm/cập nhật danh mục');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A24D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2 tracking-wide">Quản Lý Danh Mục</h1>
          <p className="text-gray-600">Tổng số: {(categories || []).length} danh mục</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#C9A24D] text-white px-6 py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm Danh Mục Mới
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl mb-6">
            {editingId ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                  required
                  disabled={savingLoading}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                  required
                  disabled={savingLoading}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Ảnh danh mục</label>
                <p className="text-sm text-gray-500 mb-4">
                  Ảnh sẽ được lưu vào hệ thống khi bạn bấm thêm/cập nhật danh mục.
                </p>
                <ImageUpload
                  onUpload={handleImageUpload}
                  onClear={() => {
                    setPendingImage(null);
                    setFormData((prev) => ({ ...prev, image: '' }));
                  }}
                  currentImage={formData.image}
                  loading={uploadingImage}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={savingLoading}
                className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors disabled:opacity-50"
              >
                {savingLoading ? 'Đang lưu...' : editingId ? 'Cập Nhật' : 'Thêm Danh Mục'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={savingLoading}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(categories || []).length > 0 ? (
          (categories || []).map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {!category.image && (
                    <div className="w-12 h-12 bg-[#C9A24D]/10 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-[#C9A24D]" />
                    </div>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => handleEdit(category._id, category.name, category.description, category.image)}
                      className="text-[#C9A24D] hover:text-[#B8923D]"
                      title="Chỉnh sửa"
                      disabled={deletingLoading}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.name)}
                      className="text-red-600 hover:text-red-700"
                      title="Xóa"
                      disabled={deletingLoading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg mb-2 line-clamp-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{category.description}</p>
                
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">ID: {category._id}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Chưa có danh mục nào</p>
          </div>
        )}
      </div>
    </div>
  );
};
