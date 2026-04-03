import Order from '../models/Order.js';
import User from '../models/User.js';
import RewardItem from '../models/RewardItem.js';
import RewardRedemption from '../models/RewardRedemption.js';
import { sendError, sendPaginatedResponse, sendResponse } from '../utils/response.js';
import { validatePagination } from '../utils/validators.js';
import {
  BASE_POINTS_PER_VND,
  MEMBERSHIP_LEVELS,
  calculateMembershipProgress,
  getMembershipLevelBySpent,
} from '../utils/membership.js';

const recalculateUserTotalSpent = async (userId) => {
  const result = await Order.aggregate([
    {
      $match: {
        user: userId,
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
      },
    },
  ]);

  return Number(result?.[0]?.total || 0);
};

export const getMembershipOverview = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'Không tìm thấy người dùng');
    }

    const totalSpent = await recalculateUserTotalSpent(user._id);
    if (Number(user.totalSpent || 0) !== Number(totalSpent || 0)) {
      user.totalSpent = totalSpent;
      await user.save();
    }

    const progress = calculateMembershipProgress(totalSpent);

    const recentRedemptions = await RewardRedemption.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    return sendResponse(res, 200, 'Lấy thông tin membership thành công', {
      pointsBalance: Number(user.loyaltyPoints || 0),
      totalSpent,
      totalPointsRedeemed: Number(user.totalPointsRedeemed || 0),
      baseRule: {
        basePointsPerVnd: BASE_POINTS_PER_VND,
        explanation: 'Mặc định 1 điểm cho mỗi 10,000đ trước khi nhân hạng thành viên',
      },
      currentRank: progress.current,
      nextRank: progress.next,
      remainingToNext: progress.remainingToNext,
      progressPercent: progress.progressPercent,
      levels: MEMBERSHIP_LEVELS,
      recentRedemptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getRewardCatalog = async (req, res, next) => {
  try {
    const rewards = await RewardItem.find({
      isActive: true,
      $or: [{ stock: 0 }, { stock: { $gt: 0 } }],
    }).sort({ pointsCost: 1, createdAt: -1 });

    return sendResponse(res, 200, 'Lấy danh sách quà đổi điểm thành công', rewards);
  } catch (error) {
    next(error);
  }
};

export const redeemReward = async (req, res, next) => {
  try {
    const { rewardItemId, quantity = 1 } = req.body;
    const qty = Math.max(1, Number(quantity || 1));

    if (!rewardItemId) {
      return sendError(res, 400, 'Thiếu thông tin quà đổi điểm');
    }

    const [user, rewardItem] = await Promise.all([
      User.findById(req.user.id),
      RewardItem.findById(rewardItemId),
    ]);

    if (!user) {
      return sendError(res, 404, 'Không tìm thấy người dùng');
    }
    if (!rewardItem || !rewardItem.isActive) {
      return sendError(res, 404, 'Quà đổi điểm không tồn tại hoặc đã ngừng áp dụng');
    }
    if (rewardItem.stock > 0 && rewardItem.stock < qty) {
      return sendError(res, 400, 'Số lượng quà không đủ để đổi');
    }

    const totalPoints = Number(rewardItem.pointsCost || 0) * qty;
    const pointsBalance = Number(user.loyaltyPoints || 0);

    if (pointsBalance < totalPoints) {
      return sendError(res, 400, 'Không đủ điểm để đổi quà');
    }

    user.loyaltyPoints = pointsBalance - totalPoints;
    user.totalPointsRedeemed = Number(user.totalPointsRedeemed || 0) + totalPoints;

    rewardItem.redeemedCount = Number(rewardItem.redeemedCount || 0) + qty;
    rewardItem.totalPointsRedeemed = Number(rewardItem.totalPointsRedeemed || 0) + totalPoints;
    if (rewardItem.stock > 0) {
      rewardItem.stock = Math.max(0, rewardItem.stock - qty);
    }

    const redemption = new RewardRedemption({
      user: user._id,
      rewardItem: rewardItem._id,
      itemNameSnapshot: rewardItem.name,
      pointsCostSnapshot: Number(rewardItem.pointsCost || 0),
      quantity: qty,
      totalPoints,
      status: 'fulfilled',
    });

    await Promise.all([user.save(), rewardItem.save(), redemption.save()]);

    return sendResponse(res, 201, 'Đổi điểm thành công', {
      redemption,
      pointsBalance: Number(user.loyaltyPoints || 0),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRedemptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const total = await RewardRedemption.countDocuments({ user: req.user.id });
    const redemptions = await RewardRedemption.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return sendPaginatedResponse(
      res,
      200,
      'Lấy lịch sử đổi điểm thành công',
      redemptions,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const getAllRewardItemsAdmin = async (req, res, next) => {
  try {
    const rewards = await RewardItem.find().sort({ createdAt: -1 });
    return sendResponse(res, 200, 'Lấy danh sách quà thành công', rewards);
  } catch (error) {
    next(error);
  }
};

export const createRewardItemAdmin = async (req, res, next) => {
  try {
    const { name, description, image, pointsCost, stock, isActive } = req.body;

    if (!name || !pointsCost) {
      return sendError(res, 400, 'Vui lòng nhập tên quà và số điểm đổi');
    }

    const reward = await RewardItem.create({
      name,
      description: description || '',
      image: image || '',
      pointsCost: Number(pointsCost),
      stock: Math.max(0, Number(stock || 0)),
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    return sendResponse(res, 201, 'Tạo quà đổi điểm thành công', reward);
  } catch (error) {
    next(error);
  }
};

export const updateRewardItemAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = {
      ...(req.body.name !== undefined ? { name: req.body.name } : {}),
      ...(req.body.description !== undefined ? { description: req.body.description } : {}),
      ...(req.body.image !== undefined ? { image: req.body.image } : {}),
      ...(req.body.pointsCost !== undefined ? { pointsCost: Math.max(1, Number(req.body.pointsCost || 1)) } : {}),
      ...(req.body.stock !== undefined ? { stock: Math.max(0, Number(req.body.stock || 0)) } : {}),
      ...(req.body.isActive !== undefined ? { isActive: Boolean(req.body.isActive) } : {}),
    };

    const reward = await RewardItem.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!reward) {
      return sendError(res, 404, 'Không tìm thấy quà đổi điểm');
    }

    return sendResponse(res, 200, 'Cập nhật quà đổi điểm thành công', reward);
  } catch (error) {
    next(error);
  }
};

export const deleteRewardItemAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reward = await RewardItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!reward) {
      return sendError(res, 404, 'Không tìm thấy quà đổi điểm');
    }
    return sendResponse(res, 200, 'Đã ngưng kích hoạt quà đổi điểm', reward);
  } catch (error) {
    next(error);
  }
};

export const getRewardRedemptionStatsAdmin = async (req, res, next) => {
  try {
    const [summaryRows, topItems, recentRedemptions] = await Promise.all([
      RewardRedemption.aggregate([
        {
          $group: {
            _id: null,
            totalRedemptions: { $sum: '$quantity' },
            totalPointsRedeemed: { $sum: '$totalPoints' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      RewardRedemption.aggregate([
        {
          $group: {
            _id: '$rewardItem',
            itemName: { $first: '$itemNameSnapshot' },
            quantity: { $sum: '$quantity' },
            points: { $sum: '$totalPoints' },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
      RewardRedemption.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const summary = summaryRows?.[0] || {
      totalRedemptions: 0,
      totalPointsRedeemed: 0,
      totalOrders: 0,
    };

    return sendResponse(res, 200, 'Lấy thống kê đổi điểm thành công', {
      ...summary,
      topItems,
      recentRedemptions,
    });
  } catch (error) {
    next(error);
  }
};

export const syncUserMembershipAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'Không tìm thấy người dùng');
    }

    const totalSpent = await recalculateUserTotalSpent(user._id);
    user.totalSpent = totalSpent;
    await user.save();

    return sendResponse(res, 200, 'Đồng bộ membership thành công', {
      userId: user._id,
      totalSpent,
      rank: getMembershipLevelBySpent(totalSpent),
    });
  } catch (error) {
    next(error);
  }
};
