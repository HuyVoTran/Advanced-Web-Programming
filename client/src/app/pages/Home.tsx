import React, { Suspense } from 'react';
import { useProducts, useCategories, useFeaturedProducts } from '@/hooks/useCustomHooks';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { SectionReveal } from '@/app/components/shared/SectionReveal';

const HomeHeroSection = React.lazy(() =>
  import('@/app/components/home/HomeHeroSection').then((module) => ({ default: module.HomeHeroSection }))
);
const NewProductsSection = React.lazy(() =>
  import('@/app/components/home/NewProductsSection').then((module) => ({ default: module.NewProductsSection }))
);
const CategoriesSection = React.lazy(() =>
  import('@/app/components/home/CategoriesSection').then((module) => ({ default: module.CategoriesSection }))
);
const FeaturedBannerSection = React.lazy(() =>
  import('@/app/components/home/FeaturedBannerSection').then((module) => ({ default: module.FeaturedBannerSection }))
);
const FeaturedProductsSection = React.lazy(() =>
  import('@/app/components/home/FeaturedProductsSection').then((module) => ({ default: module.FeaturedProductsSection }))
);
const NewsletterSection = React.lazy(() =>
  import('@/app/components/home/NewsletterSection').then((module) => ({ default: module.NewsletterSection }))
);

const SectionFallback: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className ?? 'py-24'}>
    <div className="container mx-auto px-4 lg:px-8">
      <Skeleton className="h-12 w-64 mx-auto mb-8" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

export const Home: React.FC = () => {
  const { products: allProducts, loading: loadingProducts, error: errorProducts } = useProducts();
  const { categories, loading: loadingCategories, error: errorCategories } = useCategories();
  const { products: featuredProducts, loading: loadingFeatured, error: errorFeatured } = useFeaturedProducts();

  const newProducts = allProducts.filter(p => p.new || p.createdAt).slice(0, 4);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<SectionFallback className="h-[80vh]" />}>
        <HomeHeroSection />
      </Suspense>

      <SectionReveal>
        <Suspense fallback={<SectionFallback />}>
          <NewProductsSection newProducts={newProducts} loading={loadingProducts} error={errorProducts} />
        </Suspense>
      </SectionReveal>

      <SectionReveal delay={0.06}>
        <Suspense fallback={<SectionFallback />}>
          <CategoriesSection categories={categories} loading={loadingCategories} error={errorCategories} />
        </Suspense>
      </SectionReveal>

      <SectionReveal delay={0.1}>
        <Suspense fallback={<SectionFallback />}>
          <FeaturedBannerSection />
        </Suspense>
      </SectionReveal>

      <SectionReveal delay={0.14}>
        <Suspense fallback={<SectionFallback />}>
          <FeaturedProductsSection
            featuredProducts={featuredProducts}
            loading={loadingFeatured}
            error={errorFeatured}
          />
        </Suspense>
      </SectionReveal>

      <SectionReveal delay={0.18}>
        <Suspense fallback={<SectionFallback className="py-12" />}>
          <NewsletterSection />
        </Suspense>
      </SectionReveal>
    </div>
  );
};
