import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useAdminFetch, useAdminMutation } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  thumbnail?: string;
  author?: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export const AdminNews: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    thumbnail: '',
    author: 'Admin',
    status: 'draft' as 'draft' | 'published',
  });

  const { data: newsData = [], loading, error, refetch } = useAdminFetch<NewsItem[]>(
    () => adminApi.getAllNews(1, 100),
    []
  );

  const { mutate: saveNews, loading: savingLoading } = useAdminMutation<NewsItem>(
    editingId
      ? (data) => adminApi.updateNews(editingId, data)
      : (data) => adminApi.createNews(data)
  );

  const { mutate: deleteNews, loading: deletingLoading } = useAdminMutation<any>(
    (id) => adminApi.deleteNews(id)
  );

  const { mutate: publishNews, loading: publishLoading } = useAdminMutation<NewsItem>(
    (id) => adminApi.publishNews(id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveNews(formData);
      toast.success(editingId ? 'Cập nhật tin tức thành công!' : 'Tạo tin tức thành công!');
      resetForm();
      refetch();
    } catch (err) {
      toast.error('Lỗi khi lưu tin tức');
    }
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      content: item.content,
      thumbnail: item.thumbnail || '',
      author: item.author || 'Admin',
      status: item.status,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tin "${title}"?`)) {
      try {
        await deleteNews(id);
        toast.success('Xóa tin tức thành công!');
        refetch();
      } catch (err) {
        toast.error('Lỗi khi xóa tin tức');
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishNews(id);
      toast.success('Xuất bản tin tức thành công!');
      refetch();
    } catch (err) {
      toast.error('Lỗi khi xuất bản');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      thumbnail: '',
      author: 'Admin',
      status: 'draft',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          <h1 className="text-3xl mb-2 tracking-wide">Quản Lý Tin Tức</h1>
          <p className="text-gray-600">Tổng số: {(newsData || []).length} bài viết</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#C9A24D] text-white px-6 py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm tin tức
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl mb-6">
            {editingId ? 'Chỉnh Sửa Tin Tức' : 'Thêm Tin Tức Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                required
                disabled={savingLoading}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                required
                disabled={savingLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Ảnh thumbnail (URL)</label>
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                  disabled={savingLoading}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Tác giả</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                  disabled={savingLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                disabled={savingLoading}
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={savingLoading}
                className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors disabled:opacity-50"
              >
                {savingLoading ? 'Đang lưu...' : editingId ? 'Cập Nhật' : 'Tạo Tin'}
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

      <div className="space-y-4">
        {(newsData || []).length > 0 ? (
          (newsData || []).map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C9A24D]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#C9A24D]" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.author || 'Admin'} · {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs mt-2 ${
                      item.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.status !== 'published' && (
                  <button
                    onClick={() => handlePublish(item._id)}
                    className="text-green-600 hover:text-green-700"
                    title="Xuất bản"
                    disabled={publishLoading}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleEdit(item)}
                  className="text-[#C9A24D] hover:text-[#B8923D]"
                  title="Chỉnh sửa"
                  disabled={deletingLoading}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(item._id, item.title)}
                  className="text-red-600 hover:text-red-700"
                  title="Xóa"
                  disabled={deletingLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">Chưa có tin tức nào</div>
        )}
      </div>
    </div>
  );
};
