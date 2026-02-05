import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '@/app/components/ProductCard';
import { products, categories, brands } from '@/data/mockData';
import { Slider } from '@/app/components/ui/slider';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { SlidersHorizontal, X, Grid3x3, List, ArrowUpDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/app/components/ui/sheet';
import { SearchBar } from '@/app/components/shared/SearchBar';
import { EmptyState } from '@/app/components/shared/EmptyState';
import { ActiveFilterTag } from '@/app/components/shared/FilterComponents';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ShoppingBag } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const brandParam = searchParams.get('brand');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    brandParam ? [brandParam] : []
  );
  const [priceRange, setPriceRange] = useState<[number]>([500000000]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const materials = Array.from(new Set(products.map(p => p.material.split(',')[0].trim())));

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.some(cat => categories.find(c => c.id === cat)?.name === product.category);
      
      const brandMatch = selectedBrands.length === 0 || 
        selectedBrands.includes(product.brand);
      
      const priceMatch = product.price <= priceRange[0];
      
      const materialMatch = selectedMaterials.length === 0 || 
        selectedMaterials.some(mat => product.material.includes(mat));

      return searchMatch && categoryMatch && brandMatch && priceMatch && materialMatch;
    });

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered = filtered.filter(p => p.new);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, selectedBrands, priceRange, selectedMaterials, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleBrand = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(name => name !== brandName)
        : [...prev, brandName]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([500000000]);
    setSelectedMaterials([]);
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg mb-4">Danh mục</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label
                htmlFor={`category-${category.id}`}
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
          {brands.map(brand => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.name)}
                onCheckedChange={() => toggleBrand(brand.name)}
              />
              <Label
                htmlFor={`brand-${brand.id}`}
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
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number])}
            max={500000000}
            min={10000000}
            step={10000000}
            className="mb-4"
          />
          <p className="text-sm text-gray-600">
            Tối đa: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[0])}
          </p>
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

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              className="max-w-2xl"
            />
          </div>

          {/* Active Filters & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategories.length > 0 && selectedCategories.map(catId => {
                const category = categories.find(c => c.id === catId);
                return category ? (
                  <ActiveFilterTag
                    key={catId}
                    label={category.name}
                    onRemove={() => toggleCategory(catId)}
                  />
                ) : null;
              })}
              {selectedBrands.length > 0 && selectedBrands.map(brand => (
                <ActiveFilterTag
                  key={brand}
                  label={brand}
                  onRemove={() => toggleBrand(brand)}
                />
              ))}
              {selectedMaterials.length > 0 && selectedMaterials.map(material => (
                <ActiveFilterTag
                  key={material}
                  label={material}
                  onRemove={() => toggleMaterial(material)}
                />
              ))}
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedMaterials.length > 0) && (
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
            <div className="flex items-center gap-3">
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
            {filteredProducts.length === products.length 
              ? `Hiển thị tất cả ${filteredProducts.length} sản phẩm`
              : `Tìm thấy ${filteredProducts.length} sản phẩm`
            }
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <FilterPanel />
            </div>
          </aside>

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'flex flex-col gap-6'
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
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
          </div>
        </div>
      </div>
    </div>
  );
};