import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 p-6 bg-muted rounded-full"
        >
          <Icon className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
        </motion.div>
      )}
      
      <h3 className="text-2xl font-light tracking-wide mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {action.label}
        </Button>
      )}
      
      {children}
    </motion.div>
  );
};
