import React from 'react';
import { motion } from 'motion/react';
import { Badge } from '../../components/ui/badge';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  count?: number;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active = false,
  onClick,
  count,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-light tracking-wide transition-all
        ${active 
          ? 'bg-primary text-white' 
          : 'bg-white border border-gray-300 text-gray-700 hover:border-primary'
        }
      `}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`ml-2 ${active ? 'text-white/80' : 'text-gray-500'}`}>
          ({count})
        </span>
      )}
    </motion.button>
  );
};

interface ActiveFilterTagProps {
  label: string;
  onRemove: () => void;
}

export const ActiveFilterTag: React.FC<ActiveFilterTagProps> = ({ label, onRemove }) => {
  return (
    <Badge
      variant="secondary"
      className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
      onClick={onRemove}
    >
      {label}
      <span className="ml-2">×</span>
    </Badge>
  );
};

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <h4 className="text-sm font-medium tracking-wide uppercase">{title}</h4>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
};
