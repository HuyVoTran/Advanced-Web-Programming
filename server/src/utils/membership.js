export const MEMBERSHIP_LEVELS = [
  {
    rank: 'member',
    label: 'Member',
    minSpent: 0,
    multiplier: 1,
    perks: ['Tích điểm cơ bản'],
  },
  {
    rank: 'silver',
    label: 'Silver',
    minSpent: 5_000_000,
    multiplier: 1.1,
    perks: ['Tích điểm x1.1', 'Ưu tiên hỗ trợ'],
  },
  {
    rank: 'gold',
    label: 'Gold',
    minSpent: 20_000_000,
    multiplier: 1.2,
    perks: ['Tích điểm x1.2', 'Phòng chờ VIP', 'Snack miễn phí'],
  },
  {
    rank: 'platinum',
    label: 'Platinum',
    minSpent: 50_000_000,
    multiplier: 1.5,
    perks: ['Tích điểm x1.5', 'Phòng chờ VIP', 'Snack cao cấp', 'Champagne'],
  },
  {
    rank: 'diamond',
    label: 'Diamond',
    minSpent: 100_000_000,
    multiplier: 2.0,
    perks: ['Tích điểm x2.0', 'Phòng chờ VIP riêng', 'Snack premium', 'Champagne cao cấp'],
  },
];

export const BASE_POINTS_PER_VND = 1 / 10000;

export const getMembershipLevelBySpent = (totalSpent = 0) => {
  const safeTotal = Number(totalSpent || 0);
  let level = MEMBERSHIP_LEVELS[0];
  for (const item of MEMBERSHIP_LEVELS) {
    if (safeTotal >= item.minSpent) {
      level = item;
    }
  }
  return level;
};

export const getNextMembershipLevel = (totalSpent = 0) => {
  const safeTotal = Number(totalSpent || 0);
  const current = getMembershipLevelBySpent(safeTotal);
  const currentIndex = MEMBERSHIP_LEVELS.findIndex((item) => item.rank === current.rank);
  if (currentIndex < 0 || currentIndex === MEMBERSHIP_LEVELS.length - 1) {
    return null;
  }
  return MEMBERSHIP_LEVELS[currentIndex + 1];
};

export const calculateMembershipProgress = (totalSpent = 0) => {
  const safeTotal = Number(totalSpent || 0);
  const current = getMembershipLevelBySpent(safeTotal);
  const next = getNextMembershipLevel(safeTotal);

  if (!next) {
    return {
      current,
      next: null,
      remainingToNext: 0,
      progressPercent: 100,
    };
  }

  const spentInCurrentLevel = Math.max(0, safeTotal - current.minSpent);
  const levelSpan = Math.max(1, next.minSpent - current.minSpent);
  const progressPercent = Math.min(100, Math.round((spentInCurrentLevel / levelSpan) * 100));

  return {
    current,
    next,
    remainingToNext: Math.max(0, next.minSpent - safeTotal),
    progressPercent,
  };
};

export const calculateEarnedPoints = (orderTotal = 0, totalSpentAfterOrder = 0) => {
  const safeOrderTotal = Math.max(0, Number(orderTotal || 0));
  const level = getMembershipLevelBySpent(totalSpentAfterOrder);
  const basePoints = Math.floor(safeOrderTotal * BASE_POINTS_PER_VND);
  const earnedPoints = Math.floor(basePoints * Number(level.multiplier || 1));

  return {
    level,
    basePoints,
    multiplier: Number(level.multiplier || 1),
    earnedPoints,
  };
};
