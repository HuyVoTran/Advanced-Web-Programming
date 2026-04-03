import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Package, AlertCircle } from 'lucide-react';
import { useAdminFetch, useAdminMutation } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import { getPrimaryProductImage } from '@/utils/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  salePercent?: number;
  // the admin API populates category/brand objects, but other parts of the
  // codebase sometimes treat them as strings.  Accept either and we'll
  // normalize when rendering/filtering.
  category: string | { _id: string; name: string };
  brand: string | { _id: string; name: string };
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  image?: string;
  images?: string[];
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const AdminProducts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch products
  const { data: allProducts = [], loading, error, refetch } = useAdminFetch<Product[]>(
    () => adminApi.getAllProducts(1, 100),
    []
  );

  // Delete mutation
  const { mutate: deleteProduct, loading: deletingLoading } = useAdminMutation<any>(
    (id) => adminApi.deleteProduct(id)
  );

  const normalizeCategory = (cat: Product['category']): string => {
    if (!cat) return '';
    return typeof cat === 'string' ? cat : cat.name;
  };

  const normalizeBrand = (br: Product['brand']): string => {
    if (!br) return '';
    return typeof br === 'string' ? br : br.name;
  };

  const filteredProducts = (allProducts || []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const catStr = normalizeCategory(product.category);
    const matchesCategory = categoryFilter === 'all' || catStr === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (productId: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        await deleteProduct(productId);
        toast.success('Xóa sản phẩm thành công!');
        refetch();
      } catch (err) {
        toast.error('Lỗi khi xóa sản phẩm');
      }
    }
  };

  const categories = [
    'all',
    ...new Set((allProducts || []).map(p => normalizeCategory(p.category)))
  ];

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
          <h1 className="text-3xl mb-2 tracking-wide">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-600">Tổng số: {filteredProducts.length} sản phẩm</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-[#C9A24D] text-white px-6 py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm Sản Phẩm Mới
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Danh mục
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Thương hiệu
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Giá
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Kho
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {getPrimaryProductImage(product) ? (
                            <img
                              src={getPrimaryProductImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="max-w-[200px]">
                          <div className="text-sm line-clamp-2">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate">ID: {product._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {normalizeCategory(product.category)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {normalizeBrand(product.brand)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {Number(product.salePercent || 0) > 0 ? (
                        <div>
                          <div className="text-xs text-red-600 font-semibold mb-1">Sale {product.salePercent}%</div>
                          <div className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</div>
                          <div className="text-red-600">
                            {formatPrice(
                              Math.max(
                                0,
                                Math.round(product.price * (1 - Number(product.salePercent || 0) / 100))
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/products/${product._id}`}
                          className="text-[#C9A24D] hover:text-[#B8923D]"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa"
                          disabled={deletingLoading}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
