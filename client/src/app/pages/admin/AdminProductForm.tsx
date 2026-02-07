import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { products, categories, brands } from '../../../data/mockData';
import { toast } from 'sonner';

export const AdminProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    material: '',
    description: '',
    featured: false,
    new: false,
  });

  useEffect(() => {
    if (isEditing && id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          price: product.price.toString(),
          category: product.category,
          brand: product.brand,
          material: product.material,
          description: product.description,
          featured: product.featured,
          new: product.new,
        });
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      toast.success('Cập nhật sản phẩm thành công!');
    } else {
      toast.success('Thêm sản phẩm mới thành công!');
    }
    navigate('/admin/products');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <h1 className="text-3xl tracking-wide">
          {isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Thông Tin Cơ Bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Tên sản phẩm <span className="text-red-500">*</span>
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
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Chất liệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    placeholder="VD: Vàng 18K, Kim cương"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Hình Ảnh Sản Phẩm</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc nhấn để chọn</p>
                <p className="text-sm text-gray-500">Hỗ trợ: JPG, PNG (Tối đa 5MB)</p>
                <button
                  type="button"
                  className="mt-4 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Chọn Ảnh
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Phân Loại</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.name}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Giá Bán</h2>
              
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Giá <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    min="0"
                    step="1000"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    VNĐ
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Trạng Thái</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#C9A24D] focus:ring-[#C9A24D]"
                  />
                  <span className="text-sm">Sản phẩm nổi bật</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="new"
                    checked={formData.new}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#C9A24D] focus:ring-[#C9A24D]"
                  />
                  <span className="text-sm">Sản phẩm mới</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
              >
                {isEditing ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm'}
              </button>
              <Link
                to="/admin/products"
                className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center"
              >
                Hủy
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
