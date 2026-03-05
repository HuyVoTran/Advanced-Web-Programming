import React from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../../components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
  showButton?: boolean;
  buttonLabel?: string;
  buttonVariant?: 'text' | 'icon';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = '',
  onSearch,
  showButton = false,
  buttonLabel = 'Tìm',
  buttonVariant = 'text',
}) => {
  const buttonOffset = showButton ? (buttonVariant === 'icon' ? 'right-10' : 'right-20') : 'right-3';
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pl-10 ${showButton ? (buttonVariant === 'icon' ? 'pr-16' : 'pr-24') : 'pr-10'} bg-muted border-transparent focus:bg-white focus:border-primary transition-all`}
      />
      {showButton && (
        <button
          type="submit"
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            buttonVariant === 'icon'
              ? 'w-8 h-8 rounded-full bg-[#C9A24D] text-white flex items-center justify-center hover:bg-[#b8923f]'
              : 'text-xs uppercase tracking-wider bg-[#C9A24D] text-white px-3 py-1.5 rounded hover:bg-[#b8923f]'
          } transition-colors`}
          aria-label={buttonVariant === 'icon' ? 'Tìm kiếm' : buttonLabel}
        >
          {buttonVariant === 'icon' ? <Search className="w-4 h-4" /> : buttonLabel}
        </button>
      )}
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            onClick={handleClear}
            className={`absolute ${buttonOffset} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  );
};
