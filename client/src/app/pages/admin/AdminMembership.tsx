import React, { useState } from 'react';
import { Crown, Gift, Plus, Trash2, Pencil } from 'lucide-react';
import { useAdminFetch } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { formatPrice } from '@/utils/constants';
import { toast } from 'sonner';

type RewardItem = {
  _id: string;
  name: string;
  description?: string;
  pointsCost: number;
  stock: number;
  redeemedCount: number;
  totalPointsRedeemed: number;
  isActive: boolean;
};

type MembershipStats = {
  totalRedemptions: number;
  totalPointsRedeemed: number;
  totalOrders: number;
  topItems: Array<{
    _id: string;
    itemName: string;
    quantity: number;
    points: number;
  }>;
};

const EMPTY_FORM = {
  name: '',
  description: '',
  pointsCost: 100,
  stock: 0,
  isActive: true,
};

export const AdminMembership: React.FC = () => {
  const { data: rewards, loading, refetch } = useAdminFetch<RewardItem[]>(() => adminApi.getMembershipRewards(), []);
  const { data: stats, refetch: refetchStats } = useAdminFetch<MembershipStats>(() => adminApi.getMembershipStats(), []);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RewardItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: RewardItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      pointsCost: Number(item.pointsCost || 0),
      stock: Number(item.stock || 0),
      isActive: Boolean(item.isActive),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || Number(form.pointsCost || 0) <= 0) {
      toast.error('Vui lòng nhập tên quà và điểm đổi hợp lệ');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateMembershipReward(editing._id, form);
        toast.success('Cập nhật quà đổi điểm thành công');
      } else {
        await adminApi.createMembershipReward(form);
        toast.success('Tạo quà đổi điểm thành công');
      }
      setShowModal(false);
      await Promise.all([refetch(), refetchStats()]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Không thể lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ngừng kích hoạt quà đổi điểm này?')) return;
    try {
      await adminApi.deleteMembershipReward(id);
      toast.success('Đã ngừng kích hoạt quà');
      await Promise.all([refetch(), refetchStats()]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xử lý thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-wide">Membership</h1>
          <p className="text-gray-500">Quản lý quà đổi điểm và thống kê redemption</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9A24D] text-white hover:bg-[#b8923f]"
        >
          <Plus className="w-4 h-4" />
          Thêm quà đổi điểm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Tổng lượt đổi</div>
          <div className="text-2xl">{Number(stats?.totalRedemptions || 0).toLocaleString('vi-VN')}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Tổng điểm đã đổi</div>
          <div className="text-2xl text-[#C9A24D]">{Number(stats?.totalPointsRedeemed || 0).toLocaleString('vi-VN')}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Số yêu cầu đổi quà</div>
          <div className="text-2xl">{Number(stats?.totalOrders || 0).toLocaleString('vi-VN')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#C9A24D]" />
            <h3 className="text-lg">Danh sách quà đổi điểm</h3>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">Đang tải...</div>
          ) : !rewards || rewards.length === 0 ? (
            <div className="p-6 text-gray-500">Chưa có quà đổi điểm nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Tên quà</th>
                    <th className="text-left px-4 py-3">Điểm</th>
                    <th className="text-left px-4 py-3">Kho</th>
                    <th className="text-left px-4 py-3">Đã đổi</th>
                    <th className="text-left px-4 py-3">Điểm tiêu thụ</th>
                    <th className="text-center px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rewards.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description || 'Không có mô tả'}</div>
                      </td>
                      <td className="px-4 py-3">{Number(item.pointsCost || 0).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3">{item.stock > 0 ? item.stock : '∞'}</td>
                      <td className="px-4 py-3">{Number(item.redeemedCount || 0).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3">{Number(item.totalPointsRedeemed || 0).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
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

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-[#C9A24D]" />
            <h3 className="text-lg">Top quà đổi</h3>
          </div>

          {!stats?.topItems || stats.topItems.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu đổi quà.</p>
          ) : (
            <div className="space-y-3">
              {stats.topItems.map((item) => (
                <div key={item._id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm">{item.itemName}</p>
                  <p className="text-xs text-gray-500">Số lượng: {item.quantity} • Điểm: {item.points.toLocaleString('vi-VN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg">{editing ? 'Cập nhật quà đổi điểm' : 'Thêm quà đổi điểm'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm mb-1">Tên quà</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Điểm đổi</label>
                  <input
                    type="number"
                    min={1}
                    value={form.pointsCost}
                    onChange={(e) => setForm((prev) => ({ ...prev, pointsCost: Number(e.target.value || 0) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Tồn kho (0 = không giới hạn)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value || 0) }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Kích hoạt
              </label>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg border border-gray-200" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#C9A24D] text-white hover:bg-[#b8923f] disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
