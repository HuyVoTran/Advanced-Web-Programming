import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { products, formatPrice } from '../../../data/mockData';
import { toast } from 'sonner';

export const AdminProducts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (_productId: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      toast.success('Xóa sản phẩm thành công!');
      // Simulate delete - in real app, would update state
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

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
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {product.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 w-fit">
                            Nổi bật
                          </span>
                        )}
                        {product.new && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 w-fit">
                            Mới
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="text-[#C9A24D] hover:text-[#B8923D]"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa"
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
