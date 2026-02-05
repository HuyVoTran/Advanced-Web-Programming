import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { categories } from '@/data/mockData';
import { toast } from 'sonner';

export const AdminCategories: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      toast.success('Cập nhật danh mục thành công!');
    } else {
      toast.success('Thêm danh mục mới thành công!');
    }
    resetForm();
  };

  const handleEdit = (id: string, name: string, description: string) => {
    setFormData({ name, description });
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      toast.success('Xóa danh mục thành công!');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2 tracking-wide">Quản Lý Danh Mục</h1>
          <p className="text-gray-600">Tổng số: {categories.length} danh mục</p>
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
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
              >
                {editingId ? 'Cập Nhật' : 'Thêm Danh Mục'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#C9A24D]/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[#C9A24D]" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category.id, category.name, category.description)}
                  className="text-[#C9A24D] hover:text-[#B8923D]"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="text-red-600 hover:text-red-700"
                  title="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h3 className="text-lg mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            
            <div className="pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">ID: {category.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
