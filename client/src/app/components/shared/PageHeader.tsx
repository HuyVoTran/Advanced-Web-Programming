import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  icon?: LucideIcon;
  actions?: React.ReactNode;
  centered?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  icon: Icon,
  actions,
  centered = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-8 ${centered ? 'text-center' : ''}`}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.href ? (
                <Link 
                  to={crumb.href} 
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className={`flex items-start ${centered ? 'justify-center' : 'justify-between'} gap-6 flex-wrap`}>
        <div className={centered ? 'flex flex-col items-center' : ''}>
          <div className="flex items-center gap-4 mb-3">
            {Icon && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">
              {title}
            </h1>
          </div>
          {description && (
            <p className={`text-muted-foreground text-lg max-w-2xl ${centered ? 'text-center' : ''}`}>
              {description}
            </p>
          )}
        </div>

        {actions && !centered && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {actions && centered && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {actions}
        </div>
      )}
    </motion.div>
  );
};
