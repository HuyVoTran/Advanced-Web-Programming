import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label: string;
  icon?: LucideIcon;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label, 
  icon: Icon,
  pulse = false 
}) => {
  const statusStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            status === 'success' ? 'bg-green-400' :
            status === 'warning' ? 'bg-yellow-400' :
            status === 'error' ? 'bg-red-400' :
            status === 'info' ? 'bg-blue-400' :
            'bg-gray-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            status === 'success' ? 'bg-green-500' :
            status === 'warning' ? 'bg-yellow-500' :
            status === 'error' ? 'bg-red-500' :
            status === 'info' ? 'bg-blue-500' :
            'bg-gray-500'
          }`}></span>
        </span>
      )}
      {Icon && <Icon className="w-3 h-3" />}
      <span>{label}</span>
    </motion.div>
  );
};

// Quick helper to get order status badge
export const getOrderStatusBadge = (status: string) => {
  const statusMap: Record<string, { status: StatusBadgeProps['status']; label: string; pulse?: boolean }> = {
    pending: { status: 'warning', label: 'Chờ xác nhận', pulse: true },
    confirmed: { status: 'info', label: 'Đã xác nhận' },
    shipping: { status: 'info', label: 'Đang giao hàng', pulse: true },
    delivered: { status: 'success', label: 'Đã giao hàng' },
    cancelled: { status: 'error', label: 'Đã hủy' },
  };

  const config = statusMap[status] || { status: 'neutral', label: status };
  return <StatusBadge {...config} />;
};
