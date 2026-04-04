import React, { useState } from 'react';
import { Mail, Users, Send, AlertCircle } from 'lucide-react';
import { useAdminFetch, useAdminMutation } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';
import axios from 'axios';

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
  fullName?: string;
  totalSpent?: number;
}

const getMembershipRankBySpent = (totalSpent = 0) => {
  const spent = Number(totalSpent || 0);
  if (spent >= 100_000_000) return 'diamond';
  if (spent >= 50_000_000) return 'platinum';
  if (spent >= 20_000_000) return 'gold';
  if (spent >= 5_000_000) return 'silver';
  return 'member';
};

const RANK_OPTIONS = [
  { value: 'all', label: 'Tất cả hạng' },
  { value: 'member', label: 'Member' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'diamond', label: 'Diamond' },
] as const;

export const AdminNewsletter: React.FC = () => {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    audience: 'all' as 'all' | 'users' | 'subscribers',
    membershipRank: 'all' as 'all' | 'member' | 'silver' | 'gold' | 'platinum' | 'diamond',
  });

  const { data: subscribers = [], loading: loadingSubscribers, error: errorSubscribers } = useAdminFetch<Subscriber[]>(
    () => adminApi.getNewsletterSubscribers(),
    []
  );

  const { data: users = [], loading: loadingUsers, error: errorUsers } = useAdminFetch<Subscriber[]>(
    () => adminApi.getNewsletterUsers(),
    []
  );

  const { mutate: sendNewsletter, loading: sending } = useAdminMutation<any>(
    (payload) => adminApi.sendNewsletter(payload)
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendNewsletter(formData);
      toast.success('Đã gửi thông báo thành công');
      setFormData({ ...formData, subject: '', content: '' });
    } catch (err) {
      const serverMessage = axios.isAxiosError(err)
        ? err.response?.data?.message
        : err instanceof Error
          ? err.message
          : null;
      toast.error(serverMessage || 'Gửi thông báo thất bại');
    }
  };

  const isLoading = loadingSubscribers || loadingUsers;
  const error = errorSubscribers || errorUsers;
  const safeUsers = users ?? [];
  const safeSubscribers = subscribers ?? [];
  const rankStats = safeUsers.reduce(
    (acc, user) => {
      const rank = getMembershipRankBySpent(user.totalSpent || 0);
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    },
    {
      member: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    } as Record<string, number>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2 tracking-wide">Thông Báo & Newsletter</h1>
          <p className="text-gray-600">Gửi thông báo đến người dùng và người đăng ký newsletter</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-6 h-6 text-[#C9A24D]" />
            <h2 className="text-xl">Gửi thông báo</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Tiêu đề</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                required
                disabled={sending}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Nội dung</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                required
                disabled={sending}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Đối tượng nhận</label>
              <select
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                disabled={sending}
              >
                <option value="all">Tất cả người dùng + người đăng ký</option>
                <option value="users">Người dùng</option>
                <option value="subscribers">Người đăng ký newsletter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Lọc theo hạng membership</label>
              <select
                name="membershipRank"
                value={formData.membershipRank}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                disabled={sending || formData.audience === 'subscribers'}
              >
                {RANK_OPTIONS.map((rank) => (
                  <option key={rank.value} value={rank.value}>
                    {rank.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Lọc này áp dụng cho người dùng có tài khoản (audience: users/all).
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors disabled:opacity-50"
            >
              {sending ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-[#C9A24D]" />
              <h3 className="text-lg">Người dùng</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Tổng: {isLoading ? '...' : safeUsers.length}
            </p>
            {!isLoading && (
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                <div>Member: {rankStats.member}</div>
                <div>Silver: {rankStats.silver}</div>
                <div>Gold: {rankStats.gold}</div>
                <div>Platinum: {rankStats.platinum}</div>
                <div>Diamond: {rankStats.diamond}</div>
              </div>
            )}
            <div className="space-y-2 max-h-48 overflow-auto">
              {safeUsers.slice(0, 10).map((user) => (
                <div key={user._id} className="text-xs text-gray-500">
                  {user.fullName ? `${user.fullName} - ` : ''}{user.email}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-[#C9A24D]" />
              <h3 className="text-lg">Newsletter</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Tổng: {isLoading ? '...' : safeSubscribers.length}
            </p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {safeSubscribers.slice(0, 10).map((sub) => (
                <div key={sub._id} className="text-xs text-gray-500">
                  {sub.email}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
