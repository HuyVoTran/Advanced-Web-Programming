import React, { useState } from 'react';
import { adminApi } from '@/services/adminApi';
import { useAdminFetch } from '@/hooks/useCustomHooks';
import { formatPrice } from '@/utils/constants';
import { toast } from 'sonner';
import { Tag, Plus, Pencil, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  requiredRank?: 'all' | 'member' | 'silver' | 'gold' | 'platinum' | 'diamond';
  oneTimePerUser?: boolean;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const rankBadgeClass = (rank?: string) => {
  const key = String(rank || '').toLowerCase();
  if (key === 'diamond') return 'bg-cyan-100 text-cyan-700';
  if (key === 'platinum') return 'bg-violet-100 text-violet-700';
  if (key === 'gold') return 'bg-amber-100 text-amber-700';
  if (key === 'silver') return 'bg-slate-100 text-slate-700';
  if (key === 'member') return 'bg-gray-100 text-gray-700';
  return 'bg-gray-100 text-gray-700';
};

const EMPTY_FORM = {
  code: '',
  description: '',
  discountType: 'percent' as 'percent' | 'fixed',
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 0,
  requiredRank: 'all' as 'all' | 'member' | 'silver' | 'gold' | 'platinum' | 'diamond',
  oneTimePerUser: false,
  isActive: true,
  expiresAt: '',
};

export const AdminCoupons: React.FC = () => {
  const { data: coupons, loading, error, refetch } = useAdminFetch<Coupon[]>(
    () => adminApi.getAllCoupons(),
    []
  );

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      requiredRank: coupon.requiredRank || 'all',
      oneTimePerUser: Boolean(coupon.oneTimePerUser),
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        expiresAt: formData.expiresAt || undefined,
      };
      if (editingCoupon) {
        await adminApi.updateCoupon(editingCoupon._id, payload);
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await adminApi.createCoupon(payload);
        toast.success('Tạo mã giảm giá thành công');
      }
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteCoupon(id);
      toast.success('Đã xóa mã giảm giá');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-wide">Mã giảm giá</h1>
          <p className="text-gray-500 mt-1">Quản lý các mã coupon khuyến mãi</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#C9A24D] hover:bg-[#b8912e] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo mã mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A24D]"></div>
          </div>
        ) : !coupons || coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Tag className="w-12 h-12 mb-3 opacity-30" />
            <p>Chưa có mã giảm giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mã</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mô tả</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Loại giảm</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Giá trị</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Đơn tối thiểu</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Rank yêu cầu</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">1 lần/tài khoản</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Đã dùng</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Hết hạn</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-[#C9A24D]">{coupon.code}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{coupon.description || '—'}</td>
                    <td className="px-4 py-3">
                      {coupon.discountType === 'percent' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">Phần trăm</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">Cố định</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.discountType === 'percent'
                        ? `${coupon.discountValue}%${coupon.maxDiscount > 0 ? ` (tối đa ${formatPrice(coupon.maxDiscount)})` : ''}`
                        : formatPrice(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3">{coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : '—'}</td>
                    <td className="px-4 py-3">
                      {coupon.requiredRank && coupon.requiredRank !== 'all' ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs uppercase ${rankBadgeClass(coupon.requiredRank)}`}>
                          {coupon.requiredRank}
                        </span>
                      ) : 'Tất cả'}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.oneTimePerUser ? (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs">Có</span>
                      ) : (
                        <span className="text-gray-400">Không</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.usedCount}
                      {coupon.usageLimit > 0 && <span className="text-gray-400"> / {coupon.usageLimit}</span>}
                    </td>
                    <td className="px-4 py-3">{formatDate(coupon.expiresAt)}</td>
                    <td className="px-4 py-3">
                      {coupon.isActive ? (
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />Hoạt động</span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400"><XCircle className="w-4 h-4" />Tắt</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          disabled={deletingId === coupon._id}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-medium">{editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium mb-1">Mã giảm giá *</label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="VD: SALE20"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn về mã giảm giá"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                />
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giá trị {formData.discountType === 'percent' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    min={1}
                    max={formData.discountType === 'percent' ? 100 : undefined}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                  />
                </div>
              </div>

              {/* Min order + Max discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    min={0}
                    placeholder="0 = không giới hạn"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                  />
                </div>
                {formData.discountType === 'percent' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Giảm tối đa (VNĐ)</label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      min={0}
                      placeholder="0 = không giới hạn"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                    />
                  </div>
                )}
              </div>

              {/* Usage limit + Expires */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Giới hạn sử dụng</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    min={0}
                    placeholder="0 = không giới hạn"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hạng thành viên tối thiểu</label>
                  <select
                    name="requiredRank"
                    value={formData.requiredRank}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                  >
                    <option value="all">Tất cả hạng</option>
                    <option value="member">Member</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày hết hạn</label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/30"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#C9A24D]"
                />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Kích hoạt mã giảm giá</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="oneTimePerUser"
                  id="oneTimePerUser"
                  checked={formData.oneTimePerUser}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#C9A24D]"
                />
                <label htmlFor="oneTimePerUser" className="text-sm font-medium cursor-pointer">
                  Chỉ dùng 1 lần cho mỗi tài khoản
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#C9A24D] hover:bg-[#b8912e] text-white text-sm transition-colors disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : editingCoupon ? 'Cập nhật' : 'Tạo mã'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
