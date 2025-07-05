import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import ProductCard from '@/components/product/product-card';
import ProductModal from '@/components/product/product-modal';
import { animateProductCards, animatePageEntry } from '@/lib/animations';
import type { Product, Category } from '@shared/schema';

export default function Products() {
  const [location] = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Extract category from URL path or query params
  const urlParams = new URLSearchParams(window.location.search);
  const categorySlug = location.split('/products/')[1] || urlParams.get('category');
  const searchQuery = urlParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: searchQuery,
    categoryId: undefined as number | undefined,
    minPrice: 0,
    maxPrice: 50000,
    fabric: '',
    color: '',
    sortBy: 'newest'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 0) {
          params.append(key, value.toString());
        }
      });
      const response = await fetch(`/api/products?${params}`);
      return response.json();
    },
  });

  // Set category filter based on URL
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const category = categories.find((cat: Category) => cat.slug === categorySlug);
      if (category) {
        setFilters(prev => ({ ...prev, categoryId: category.id }));
      }
    }
  }, [categorySlug, categories]);

  // Set search filter from URL
  useEffect(() => {
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchQuery]);

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const productCards = document.querySelectorAll('.product-card');
      animateProductCards(productCards);
    }
  }, [products]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: undefined,
      minPrice: 0,
      maxPrice: 50000,
      fabric: '',
      color: '',
      sortBy: 'newest'
    });
  };

  const currentCategory = categories.find((cat: Category) => cat.id === filters.categoryId);
  
  const fabrics = ['Silk', 'Cotton', 'Chiffon', 'Georgette', 'Banarasi', 'Kanjivaram'];
  const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Black', 'White', 'Gold'];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label htmlFor="search">Search Products</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            placeholder="Search sarees..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <Select value={filters.categoryId?.toString() || ''} onValueChange={(value) => handleFilterChange('categoryId', value ? parseInt(value) : undefined)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category: Category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label>Price Range: ₹{filters.minPrice} - ₹{filters.maxPrice}</Label>
        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-sm">Min Price</Label>
            <Slider
              value={[filters.minPrice]}
              onValueChange={(value) => handleFilterChange('minPrice', value[0])}
              max={50000}
              step={500}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-sm">Max Price</Label>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={(value) => handleFilterChange('maxPrice', value[0])}
              max={50000}
              step={500}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Fabric */}
      <div>
        <Label>Fabric</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {fabrics.map((fabric) => (
            <div key={fabric} className="flex items-center space-x-2">
              <Checkbox
                id={fabric}
                checked={filters.fabric === fabric}
                onCheckedChange={(checked) => handleFilterChange('fabric', checked ? fabric : '')}
              />
              <Label htmlFor={fabric} className="text-sm">{fabric}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <Label>Color</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={color}
                checked={filters.color === color}
                onCheckedChange={(checked) => handleFilterChange('color', checked ? color : '')}
              />
              <Label htmlFor={color} className="text-sm">{color}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            {currentCategory ? currentCategory.name : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {currentCategory ? currentCategory.description : 'Discover our complete collection of beautiful sarees'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-charcoal mb-4">Filters</h3>
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <span className="text-sm text-gray-600">
                    {products.length} products found
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-96 shimmer" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search criteria or browse our categories
                  </p>
                  <Button onClick={clearFilters} className="bg-golden hover:bg-yellow-600 text-charcoal">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
