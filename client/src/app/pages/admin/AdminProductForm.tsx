import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminFetch, useAdminMutation } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { MultiImageUpload } from '@/app/components/admin/MultiImageUpload';
import { toast } from 'sonner';

interface FormData {
  name: string;
  price: string;
  category: string;
  brand: string;
  material: string;
  description: string;
  isFeatured: boolean;
  stock: string;
  images?: string[];
}

export const AdminProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    category: '',
    brand: '',
    material: '',
    description: '',
    isFeatured: false,
    stock: '0',
    images: [],
  });

  const [uploadingImages, setUploadingImages] = useState(false);

  // Fetch product if editing
  const { data: product, loading: productLoading } = useAdminFetch(
    () => isEditing && id ? adminApi.getProductById(id) : Promise.resolve(null),
    [id, isEditing]
  );

  // Fetch categories and brands
  const { data: categoriesData } = useAdminFetch(
    () => adminApi.getAllCategories(),
    []
  );

  const { data: brandsData } = useAdminFetch(
    () => adminApi.getAllBrands(),
    []
  );

  // useAdminFetch initializes `data` to null, so we cannot rely on the
  // destructuring default value (which only applies when the property is
  // undefined).  Instead convert null -> empty array here to avoid map
  // errors during the initial render.
  const categories = categoriesData || [];
  const brands = brandsData || [];

  // Save mutation
  const { mutate: saveProduct, loading: savingLoading } = useAdminMutation<any>(
    isEditing && id
      ? (data) => adminApi.updateProduct(id, data)
      : (data) => adminApi.createProduct(data)
  );

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        // product.category/brand may be populated objects or just IDs
        category: typeof product.category === 'object' ? product.category._id : product.category,
        brand: typeof product.brand === 'object' ? product.brand._id : product.brand,
        material: product.material,
        description: product.description,
        isFeatured: product.isFeatured,
        stock: product.stock?.toString() || '0',
        images: product.images || [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProduct({
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
      });
      toast.success(isEditing ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
      navigate('/admin/products');
    } catch (err) {
      toast.error('Lỗi khi lưu sản phẩm');
    }
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

  const handleImageUpload = async (files: File[]) => {
    if (!id || id === 'new') {
      toast.error('Vui lòng tạo sản phẩm trước khi upload ảnh');
      return;
    }

    setUploadingImages(true);
    try {
      const result = await adminApi.uploadProductImages(id, files);
      // Replace images with new ones from upload (don't append)
      setFormData({
        ...formData,
        images: result.paths,
      });
      toast.success('Upload ảnh thành công!');
    } catch (err) {
      toast.error('Lỗi khi upload ảnh');
      console.error(err);
    } finally {
      setUploadingImages(false);
    }
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A24D]"></div>
      </div>
    );
  }

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                    required
                    disabled={savingLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Ảnh sản phẩm (Tối đa 4 ảnh)
                  </label>
                  {!isEditing && (
                    <p className="text-sm text-gray-500 mb-4">
                      Lưu ý: Tạo sản phẩm trước, sau đó upload ảnh
                    </p>
                  )}
                  {isEditing && (
                    <MultiImageUpload
                      onUpload={handleImageUpload}
                      currentImages={formData.images || []}
                      loading={uploadingImages}
                      maxFiles={4}
                    />
                  )}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                    required
                    disabled={savingLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Chất liệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                    required
                    disabled={savingLoading}
                  >
                    <option value="">Chọn chất liệu</option>
                    <option value="gold">Vàng</option>
                    <option value="silver">Bạc</option>
                    <option value="platinum">Bạch kim</option>
                    <option value="diamond">Kim cương</option>
                    <option value="gemstone">Đá quý</option>
                    <option value="mixed">Hỗn hợp</option>
                  </select>
                </div>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                    required
                    disabled={savingLoading}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                    required
                    disabled={savingLoading}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand: any) => (
                      <option key={brand._id} value={brand._id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Giá Bán</h2>
              
              <div className="space-y-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                      min="0"
                      step="1000"
                      required
                      disabled={savingLoading}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      VNĐ
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Số lượng kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D] disabled:opacity-50"
                    min="0"
                    required
                    disabled={savingLoading}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-4">Trạng Thái</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-[#C9A24D] focus:ring-[#C9A24D]"
                    disabled={savingLoading}
                  />
                  <span className="text-sm">Sản phẩm nổi bật</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={savingLoading}
                className="w-full bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors disabled:opacity-50"
              >
                {savingLoading ? 'Đang lưu...' : isEditing ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm'}
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
