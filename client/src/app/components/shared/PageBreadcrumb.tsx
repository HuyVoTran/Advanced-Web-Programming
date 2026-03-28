import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/components/ui/breadcrumb';

interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItemData[];
  className?: string;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>•</BreadcrumbSeparator>}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
