import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '@/app/components/ProductCard';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { SlidersHorizontal, Grid3x3, List, ArrowUpDown, Heart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/app/components/ui/sheet';
import { SearchBar } from '@/app/components/shared/SearchBar';
import { EmptyState } from '@/app/components/shared/EmptyState';
import { ActiveFilterTag } from '@/app/components/shared/FilterComponents';
import { PageBreadcrumb } from '@/app/components/shared/PageBreadcrumb';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ShoppingBag } from 'lucide-react';
import { useProducts, useCategories, useBrands } from '@/hooks/useCustomHooks';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/utils/notifications';
import { formatPrice } from '@/utils/constants';

export const Products: React.FC = () => {
  const ITEMS_PER_BATCH = 9;
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const brandParam = searchParams.get('brand');
  const saleParam = searchParams.get('sale');
  const saleParamEnabled = saleParam === '1' || saleParam === 'true';

  // Fetch dữ liệu từ API
  const { products: apiProducts, loading: loadingProducts, error: errorProducts } = useProducts({ limit: 200 });
  const { categories } = useCategories();
  const { brands: apiBrands } = useBrands();
  const { user, isFavorite } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    brandParam ? [brandParam] : []
  );
  const MAX_PRICE = 500000000;
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [priceRangeDraft, setPriceRangeDraft] = useState<[number, number]>([0, MAX_PRICE]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(saleParamEnabled);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setPriceRangeDraft(priceRange);
  }, [priceRange]);

  useEffect(() => {
    setSelectedCategories(categoryParam ? [categoryParam] : []);
  }, [categoryParam]);

  useEffect(() => {
    setSelectedBrands(brandParam ? [brandParam] : []);
  }, [brandParam]);

  useEffect(() => {
    setSaleOnly(saleParamEnabled);
  }, [saleParamEnabled]);

  const formattedMinPrice = useMemo(
    () => formatPrice(priceRangeDraft[0]),
    [priceRangeDraft]
  );

  const formattedMaxPrice = useMemo(
    () =>
      priceRangeDraft[1] === MAX_PRICE
        ? `${formatPrice(MAX_PRICE)}+`
        : formatPrice(priceRangeDraft[1]),
    [priceRangeDraft, MAX_PRICE]
  );

  const activeFilterBreadcrumbs = useMemo(() => {
    const items: string[] = [];

    selectedCategories.forEach((catId) => {
      const category = categories.find((c) => (c._id || c.id) === catId);
      if (category?.name) {
        items.push(category.name);
      }
    });

    selectedBrands.forEach((brandId) => {
      const brand = apiBrands.find((b) => (b._id || b.id) === brandId);
      if (brand?.name) {
        items.push(brand.name);
      }
    });

    selectedMaterials.forEach((material) => {
      items.push(material);
    });

    if (priceRange[0] > 0 || priceRange[1] < MAX_PRICE) {
      const minPrice = priceRange[0].toLocaleString('vi-VN');
      const maxPrice = priceRange[1] === MAX_PRICE ? '500.000.000+' : priceRange[1].toLocaleString('vi-VN');
      items.push(`Giá từ ${minPrice} - ${maxPrice}`);
    }

    if (searchQuery.trim()) {
      items.push(`Từ khóa: ${searchQuery.trim()}`);
    }

    if (favoritesOnly) {
      items.push('Sản phẩm yêu thích');
    }

    if (saleOnly) {
      items.push('Đang giảm giá');
    }

    if (sortBy !== 'featured') {
      const sortLabels: Record<string, string> = {
        newest: 'Mới nhất',
        'price-asc': 'Giá tăng dần',
        'price-desc': 'Giá giảm dần',
        'name-asc': 'Tên A-Z',
        'name-desc': 'Tên Z-A',
      };
      items.push(`Sắp xếp: ${sortLabels[sortBy] || sortBy}`);
    }

    return items;
  }, [selectedCategories, selectedBrands, selectedMaterials, priceRange, MAX_PRICE, searchQuery, sortBy, favoritesOnly, saleOnly, categories, apiBrands]);

  const normalizePriceRange = useCallback((min: number, max: number): [number, number] => {
    const safeMin = Number.isFinite(min) ? Math.max(0, min) : 0;
    const safeMax = Number.isFinite(max) ? Math.min(MAX_PRICE, max) : MAX_PRICE;

    if (safeMin > safeMax) {
      return [safeMax, safeMax];
    }

    return [safeMin, safeMax];
  }, [MAX_PRICE]);

  const handlePriceInputChange = useCallback((field: 'min' | 'max', value: string) => {
    const parsed = value === '' ? 0 : Number(value);
    const numericValue = Number.isFinite(parsed) ? parsed : 0;

    setPriceRangeDraft((prev) => {
      if (field === 'min') {
        return [numericValue, prev[1]];
      }
      return [prev[0], numericValue];
    });
  }, []);

  const applyPriceRangeFromInputs = useCallback(() => {
    const [nextMin, nextMax] = normalizePriceRange(priceRangeDraft[0], priceRangeDraft[1]);
    setPriceRangeDraft([nextMin, nextMax]);
    setPriceRange([nextMin, nextMax]);
  }, [normalizePriceRange, priceRangeDraft]);

  const materials = Array.from(new Set(apiProducts.map((p: any) => {
    const mat = p.material || p.category || '';
    const raw = typeof mat === 'string' ? mat.split(',')[0].trim() : String(mat);
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })));

  const filteredProducts = useMemo(() => {
    const selectedCategoryObjects = selectedCategories
      .map((catId) => categories.find(c => (c._id || c.id) === catId))
      .filter(Boolean) as any[];
    const hasSaleCategory = selectedCategoryObjects.some((category) => {
      const normalizedName = String(category?.name || '').trim().toLowerCase();
      const normalizedSlug = String(category?.slug || '').trim().toLowerCase();
      return normalizedName === 'sale' || normalizedSlug === 'sale';
    });
    const nonSaleSelectedCategories = selectedCategoryObjects.filter((category) => {
      const normalizedName = String(category?.name || '').trim().toLowerCase();
      const normalizedSlug = String(category?.slug || '').trim().toLowerCase();
      return normalizedName !== 'sale' && normalizedSlug !== 'sale';
    });

    let filtered = apiProducts.filter((product: any) => {
      const brandName = typeof product.brand === 'object' ? product.brand?.name : product.brand;
      const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
      const materialText = product.material || '';
      // Search
      const searchMatch = searchQuery === '' || 
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brandName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (categoryName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        materialText.toLowerCase().includes(searchQuery.toLowerCase());

      const productCategoryId = typeof product.category === 'object'
        ? product.category?._id
        : product.category;
      const productCategoryName = typeof product.category === 'object'
        ? product.category?.name
        : product.category;
      const categoryMatch = nonSaleSelectedCategories.length === 0 || 
        nonSaleSelectedCategories.some(category => {
          return productCategoryId === category._id || productCategoryName === category.name;
        });

      const requiresSale = hasSaleCategory || saleOnly;
      const saleMatch = !requiresSale || Number(product.salePercent || 0) > 0;

      const productBrandId = typeof product.brand === 'object'
        ? product.brand?._id
        : product.brand;
      const brandMatch = selectedBrands.length === 0 || 
        selectedBrands.includes(productBrandId);

      const priceValue = product.price || 0;
      const minPrice = priceRange[0];
      const maxPrice = priceRange[1];
      const priceMatch = priceValue >= minPrice && (maxPrice === MAX_PRICE ? true : priceValue <= maxPrice);
      
      const materialMatch = selectedMaterials.length === 0 || 
        selectedMaterials.some(mat => (product.material || '').toLowerCase().includes(mat.toLowerCase()));

      const favoriteMatch = !favoritesOnly || isFavorite(String(product._id || product.id));

      return searchMatch && categoryMatch && brandMatch && priceMatch && materialMatch && favoriteMatch && saleMatch;
    });

    const getEffectivePrice = (product: any) => {
      const basePrice = Number(product?.price || 0);
      const salePercentValue = Number(product?.salePercent || 0);
      const safeSalePercent = Math.max(0, Math.min(100, salePercentValue));
      return Math.round(basePrice * (1 - safeSalePercent / 100));
    };

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a: any, b: any) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case 'price-desc':
        filtered.sort((a: any, b: any) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case 'name-asc':
        filtered.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a: any, b: any) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'newest':
        filtered = filtered.filter((p: any) => p.new || p.createdAt);
        break;
      case 'featured':
      default:
        filtered.sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, selectedBrands, priceRange, selectedMaterials, favoritesOnly, saleOnly, sortBy, apiProducts, categories, isFavorite]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [filteredProducts.length, searchQuery, selectedCategories, selectedBrands, selectedMaterials, favoritesOnly, saleOnly, sortBy, priceRange, ITEMS_PER_BATCH]);

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        window.clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMoreProducts) {
      return;
    }

    setLoadingMore(true);
    loadMoreTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_BATCH, filteredProducts.length));
      setLoadingMore(false);
    }, 350);
  }, [loadingMore, hasMoreProducts, ITEMS_PER_BATCH, filteredProducts.length]);

  const handleCollapseProducts = useCallback(() => {
    if (loadMoreTimeoutRef.current) {
      window.clearTimeout(loadMoreTimeoutRef.current);
      loadMoreTimeoutRef.current = null;
    }
    setLoadingMore(false);
    setVisibleCount(ITEMS_PER_BATCH);
  }, [ITEMS_PER_BATCH]);

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const toggleBrand = useCallback((brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  }, []);

  const toggleMaterial = useCallback((material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, MAX_PRICE]);
    setSelectedMaterials([]);
    setFavoritesOnly(false);
    setSaleOnly(false);
  }, [MAX_PRICE]);

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg mb-4">Danh mục</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category._id || category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category._id || category.id}`}
                checked={selectedCategories.includes(category._id || category.id)}
                onCheckedChange={() => toggleCategory(category._id || category.id)}
              />
              <Label
                htmlFor={`category-${category._id || category.id}`}
                className="text-sm cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="text-lg mb-4">Thương hiệu</h3>
        <div className="space-y-3">
          {apiBrands.map(brand => (
            <div key={brand._id || brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand._id || brand.id}`}
                checked={selectedBrands.includes(brand._id || brand.id)}
                onCheckedChange={() => toggleBrand(brand._id || brand.id)}
              />
              <Label
                htmlFor={`brand-${brand._id || brand.id}`}
                className="text-sm cursor-pointer"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg mb-4">Khoảng giá</h3>
        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                Giá từ
              </Label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_PRICE}
                step={1000000}
                value={priceRangeDraft[0]}
                onChange={(e) => handlePriceInputChange('min', e.target.value)}
                onBlur={applyPriceRangeFromInputs}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyPriceRangeFromInputs();
                  }
                }}
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wide text-gray-500 mb-2 block">
                Giá đến
              </Label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_PRICE}
                step={1000000}
                value={priceRangeDraft[1]}
                onChange={(e) => handlePriceInputChange('max', e.target.value)}
                onBlur={applyPriceRangeFromInputs}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyPriceRangeFromInputs();
                  }
                }}
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                placeholder={MAX_PRICE.toString()}
              />
            </div>
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 space-y-1">
            <p>Từ: {formattedMinPrice}</p>
            <p>Đến: {formattedMaxPrice}</p>
          </div>
        </div>
      </div>

      {/* Materials */}
      <div>
        <h3 className="text-lg mb-4">Chất liệu</h3>
        <div className="space-y-3">
          {materials.map(material => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material}`}
                checked={selectedMaterials.includes(material)}
                onCheckedChange={() => toggleMaterial(material)}
              />
              <Label
                htmlFor={`material-${material}`}
                className="text-sm cursor-pointer"
              >
                {material}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Khuyến mãi</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sale-only"
              checked={saleOnly}
              onCheckedChange={() => setSaleOnly((prev) => !prev)}
            />
            <Label htmlFor="sale-only" className="text-sm cursor-pointer">
              Chỉ hiển thị sản phẩm đang giảm giá
            </Label>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={applyPriceRangeFromInputs}
        className="w-full"
      >
        Áp dụng bộ lọc
      </Button>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full border border-gray-300 text-gray-700 px-6 py-2 text-sm hover:bg-gray-50 transition-colors duration-300"
      >
        Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-wide">
            Sản phẩm
          </h1>

          <PageBreadcrumb
            className="mb-4"
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Sản phẩm', href: '/products' },
              ...(activeFilterBreadcrumbs.length > 0
                ? activeFilterBreadcrumbs.map((item) => ({ label: item }))
                : [{ label: 'Tất cả sản phẩm' }]),
            ]}
          />

          {/* Active Filters & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategories.length > 0 && selectedCategories.map(catId => {
                const category = categories.find(c => (c._id || c.id) === catId);
                return category ? (
                  <ActiveFilterTag
                    key={catId}
                    label={category.name}
                    onRemove={() => toggleCategory(catId)}
                  />
                ) : null;
              })}
              {selectedBrands.length > 0 && selectedBrands.map(brandId => {
                const brand = apiBrands.find(b => (b._id || b.id) === brandId);
                return brand ? (
                <ActiveFilterTag
                  key={brandId}
                  label={brand.name}
                  onRemove={() => toggleBrand(brandId)}
                />
                ) : null;
              })}
              {selectedMaterials.length > 0 && selectedMaterials.map(material => (
                <ActiveFilterTag
                  key={material}
                  label={material}
                  onRemove={() => toggleMaterial(material)}
                />
              ))}
              {favoritesOnly && (
                <ActiveFilterTag
                  label="Yêu thích"
                  onRemove={() => setFavoritesOnly(false)}
                />
              )}
              {saleOnly && (
                <ActiveFilterTag
                  label="Đang giảm giá"
                  onRemove={() => setSaleOnly(false)}
                />
              )}
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedMaterials.length > 0 || favoritesOnly || saleOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Xóa tất cả
                </Button>
              )}
            </div>

            {/* Sort & View Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={setSearchQuery}
                placeholder="Tìm theo tên, thương hiệu, chất liệu..."
                className="w-full sm:w-80"
              />
              <Button
                type="button"
                variant={favoritesOnly ? 'default' : 'outline'}
                onClick={() => {
                  if (!user) {
                    notify.info('Vui lòng đăng nhập để lọc sản phẩm yêu thích');
                    return;
                  }
                  setFavoritesOnly((prev) => !prev);
                }}
                className={favoritesOnly ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${favoritesOnly ? 'fill-current' : ''}`} />
                Yêu thích
              </Button>
              <Button
                type="button"
                variant={saleOnly ? 'default' : 'outline'}
                onClick={() => setSaleOnly((prev) => !prev)}
                className={saleOnly ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
              >
                Đang giảm giá
              </Button>
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Nổi bật</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                  <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên: Z-A</SelectItem>
                </SelectContent>
              </Select>

              {/* Desktop Filter Toggle */}
              <Button
                variant="outline"
                className="hidden lg:flex"
                onClick={() => setFilterOpen((v) => !v)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {filterOpen ? 'Ẩn bộ lọc' : 'Mở bộ lọc'}
              </Button>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Bộ lọc
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <div className="mt-8">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground">
            {loadingProducts ? 'Đang tải...' : filteredProducts.length === 0
              ? `Hiển thị 0 / 0 sản phẩm (tổng ${apiProducts.length})`
              : `Hiển thị ${visibleProducts.length} / ${filteredProducts.length} sản phẩm (tổng ${apiProducts.length})`
            }
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          {filterOpen && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div>
                <FilterPanel />
              </div>
            </aside>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {errorProducts ? (
              <ErrorState 
                message="Lỗi tải sản phẩm" 
                onRetry={() => window.location.reload()} 
              />
            ) : loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                    : 'flex flex-col gap-6'
                }
              >
                <AnimatePresence mode="popLayout">
                  {visibleProducts.map((product, index) => (
                    <motion.div
                      key={product._id || product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard 
                        product={product} 
                        index={index}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title="Không tìm thấy sản phẩm"
                description="Không có sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc xóa bộ lọc để xem tất cả sản phẩm."
                action={{
                  label: 'Xóa bộ lọc',
                  onClick: () => {
                    clearFilters();
                    setSearchQuery('');
                  }
                }}
              />
            )}

            {!loadingProducts && !errorProducts && visibleProducts.length > 0 && hasMoreProducts && (
              <div className="mt-10 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-w-[220px]"
                >
                  {loadingMore
                    ? 'Đang tải thêm...'
                    : `Xem thêm ${Math.min(ITEMS_PER_BATCH, filteredProducts.length - visibleCount)} sản phẩm`}
                </Button>
              </div>
            )}

            {!loadingProducts && !errorProducts && visibleProducts.length > ITEMS_PER_BATCH && !hasMoreProducts && (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCollapseProducts}
                >
                  Thu gọn
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};