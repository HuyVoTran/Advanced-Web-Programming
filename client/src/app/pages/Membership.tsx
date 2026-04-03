import React, { useMemo, useState } from 'react';
import { Crown, Gift, Sparkles, Ticket } from 'lucide-react';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminFetch } from '@/hooks/useCustomHooks';
import { membershipAPI } from '@/services/api';
import { formatPrice } from '@/utils/constants';
import { toast } from 'sonner';

type MembershipLevel = {
  rank: string;
  label: string;
  minSpent: number;
  multiplier: number;
  perks: string[];
};

type RewardItem = {
  _id: string;
  name: string;
  description?: string;
  pointsCost: number;
  stock: number;
  isActive: boolean;
};

type RedemptionItem = {
  _id: string;
  itemNameSnapshot: string;
  pointsCostSnapshot: number;
  quantity: number;
  totalPoints: number;
  createdAt: string;
};

type MembershipOverview = {
  pointsBalance: number;
  totalSpent: number;
  totalPointsRedeemed: number;
  currentRank: MembershipLevel;
  nextRank: MembershipLevel | null;
  remainingToNext: number;
  progressPercent: number;
  levels: MembershipLevel[];
  recentRedemptions: RedemptionItem[];
};

const rankColor = (rank: string) => {
  const key = String(rank || '').toLowerCase();
  if (key === 'diamond') return 'text-cyan-600 bg-cyan-50 border-cyan-200';
  if (key === 'platinum') return 'text-violet-600 bg-violet-50 border-violet-200';
  if (key === 'gold') return 'text-amber-600 bg-amber-50 border-amber-200';
  if (key === 'silver') return 'text-slate-600 bg-slate-50 border-slate-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

export const Membership: React.FC = () => {
  const { token } = useAuth();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const { data: overview, loading: overviewLoading, error: overviewError, refetch: refetchOverview } =
    useAdminFetch<MembershipOverview>(() => membershipAPI.getOverview(token || ''), [token]);

  const { data: rewards, loading: rewardsLoading, refetch: refetchRewards } = useAdminFetch<RewardItem[]>(
    () => membershipAPI.getRewards(token || ''),
    [token]
  );

  const sortedLevels = useMemo(() => {
    return [...(overview?.levels || [])].sort((a, b) => a.minSpent - b.minSpent);
  }, [overview?.levels]);

  const handleRedeem = async (rewardId: string) => {
    if (!token) return;
    setRedeemingId(rewardId);
    try {
      await membershipAPI.redeemReward(rewardId, 1, token);
      toast.success('Đổi quà thành công');
      await Promise.all([refetchOverview(), refetchRewards()]);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể đổi quà');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <UserDashboardLayout
      title="Membership"
      subtitle="Theo dõi hạng thành viên, quyền lợi và đổi điểm"
      icon={Crown}
    >
      {overviewLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
      ) : overviewError || !overview ? (
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-red-700">{overviewError || 'Không thể tải dữ liệu membership'}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Hạng hiện tại</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${rankColor(overview.currentRank.rank)}`}>
                {overview.currentRank.label}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Điểm khả dụng</div>
              <div className="text-2xl text-[#C9A24D]">{Number(overview.pointsBalance || 0).toLocaleString('vi-VN')} điểm</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="text-sm text-gray-500 mb-1">Tổng chi tiêu tích lũy</div>
              <div className="text-xl">{formatPrice(Number(overview.totalSpent || 0))}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#C9A24D]" />
              <h3 className="text-lg">Rank Progression</h3>
            </div>

            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-[#C9A24D] to-[#b8923f]" style={{ width: `${overview.progressPercent}%` }} />
            </div>
            <div className="text-sm text-gray-600 mb-6">
              {overview.nextRank
                ? `Còn ${formatPrice(overview.remainingToNext)} để lên hạng ${overview.nextRank.label}`
                : 'Bạn đang ở hạng cao nhất'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedLevels.map((level) => {
                const active = level.rank === overview.currentRank.rank;
                return (
                  <div
                    key={level.rank}
                    className={`rounded-lg border p-4 ${active ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-base">{level.label}</div>
                      <span className="text-sm text-[#C9A24D]">x{level.multiplier.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Mốc: {formatPrice(level.minSpent)}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {(level.perks || []).map((perk, idx) => (
                        <li key={idx}>• {perk}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-[#C9A24D]" />
              <h3 className="text-lg">Đổi điểm nhận quà</h3>
            </div>

            {rewardsLoading ? (
              <p className="text-sm text-gray-500">Đang tải danh sách quà...</p>
            ) : !rewards || rewards.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có quà đổi điểm.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => {
                  const canRedeem = Number(overview.pointsBalance || 0) >= Number(reward.pointsCost || 0);
                  const outOfStock = reward.stock > 0 && reward.stock <= 0;

                  return (
                    <div key={reward._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-base">{reward.name}</p>
                          <p className="text-sm text-gray-500">{reward.description || 'Quà đổi điểm thành viên'}</p>
                        </div>
                        <div className="text-[#C9A24D] text-sm whitespace-nowrap">{reward.pointsCost.toLocaleString('vi-VN')} điểm</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{reward.stock > 0 ? `Còn ${reward.stock}` : 'Không giới hạn'}</span>
                        <button
                          onClick={() => handleRedeem(reward._id)}
                          disabled={!canRedeem || outOfStock || redeemingId === reward._id}
                          className="px-3 py-1.5 text-sm rounded-md bg-[#C9A24D] text-white hover:bg-[#b8923f] disabled:opacity-50"
                        >
                          {redeemingId === reward._id ? 'Đang đổi...' : 'Đổi ngay'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-[#C9A24D]" />
              <h3 className="text-lg">Lịch sử đổi điểm gần đây</h3>
            </div>

            {!overview.recentRedemptions || overview.recentRedemptions.length === 0 ? (
              <p className="text-sm text-gray-500">Bạn chưa đổi điểm lần nào.</p>
            ) : (
              <div className="space-y-3">
                {overview.recentRedemptions.map((item) => (
                  <div key={item._id} className="border border-gray-100 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm">{item.itemNameSnapshot}</p>
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="text-sm text-red-600">-{Number(item.totalPoints || 0).toLocaleString('vi-VN')} điểm</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
};
