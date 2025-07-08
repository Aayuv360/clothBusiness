import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProductCard from "@/components/product/product-card";
import ProductModal from "@/components/product/product-modal";
import { animatePageEntry } from "@/lib/animations";
import type { Product, Category } from "@shared/schema";

export default function CategoryPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const categorySlug = params.slug;
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });
  const [selectedFabric, setSelectedFabric] = useState(searchParams.get("fabric") || "all");
  const [selectedColor, setSelectedColor] = useState(searchParams.get("color") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [inStockOnly, setInStockOnly] = useState(searchParams.get("inStock") === "true");

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (priceRange.min) params.set("minPrice", priceRange.min);
    if (priceRange.max) params.set("maxPrice", priceRange.max);
    if (selectedFabric && selectedFabric !== "all") params.set("fabric", selectedFabric);
    if (selectedColor && selectedColor !== "all") params.set("color", selectedColor);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (inStockOnly) params.set("inStock", "true");
    
    setSearchParams(params);
  }, [priceRange, selectedFabric, selectedColor, sortBy, inStockOnly, setSearchParams]);

  // Fetch category details
  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", categorySlug],
    queryFn: async () => {
      const response = await fetch(`/api/categories/slug/${categorySlug}`);
      if (!response.ok) throw new Error("Category not found");
      return response.json();
    },
    enabled: !!categorySlug,
  });

  // Fetch products for this category
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", categorySlug, searchParams.toString()],
    queryFn: async () => {
      const params = new URLSearchParams(searchParams);
      params.set("category", categorySlug!);
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: !!categorySlug,
  });

  const clearFilters = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedFabric("all");
    setSelectedColor("all");
    setSortBy("newest");
    setInStockOnly(false);
  };

  const activeFiltersCount = [
    priceRange.min,
    priceRange.max,
    selectedFabric && selectedFabric !== "all" ? selectedFabric : null,
    selectedColor && selectedColor !== "all" ? selectedColor : null,
    inStockOnly,
  ].filter(Boolean).length;

  const fabrics = ["Silk", "Cotton", "Georgette", "Chiffon", "Crepe", "Net", "Satin"];
  const colors = ["Red", "Blue", "Green", "Pink", "Yellow", "Orange", "Purple", "Black", "White", "Gold"];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Fabric */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fabric
        </label>
        <Select value={selectedFabric} onValueChange={setSelectedFabric}>
          <SelectTrigger>
            <SelectValue placeholder="All Fabrics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fabrics</SelectItem>
            {fabrics.map((fabric) => (
              <SelectItem key={fabric} value={fabric.toLowerCase()}>
                {fabric}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <Select value={selectedColor} onValueChange={setSelectedColor}>
          <SelectTrigger>
            <SelectValue placeholder="All Colors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colors</SelectItem>
            {colors.map((color) => (
              <SelectItem key={color} value={color.toLowerCase()}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="inStock"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
          In Stock Only
        </label>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shimmer h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {category && (
        <div className="bg-gradient-to-r from-golden to-amber-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filter */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(priceRange.min || priceRange.max) && (
              <Badge variant="secondary" className="gap-1">
                Price: ₹{priceRange.min || 0} - ₹{priceRange.max || "∞"}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setPriceRange({ min: "", max: "" })}
                />
              </Badge>
            )}
            {selectedFabric && (
              <Badge variant="secondary" className="gap-1">
                Fabric: {selectedFabric}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedFabric("")}
                />
              </Badge>
            )}
            {selectedColor && (
              <Badge variant="secondary" className="gap-1">
                Color: {selectedColor}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedColor("")}
                />
              </Badge>
            )}
            {inStockOnly && (
              <Badge variant="secondary" className="gap-1">
                In Stock Only
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setInStockOnly(false)}
                />
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-4 w-4" />
                  <h3 className="font-semibold">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                <FilterContent />
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Filter className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or check back later
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? 
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "space-y-4"
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => setSelectedProduct(product)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}