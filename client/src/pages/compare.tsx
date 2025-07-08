import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductComparison from "@/components/product/product-comparison";
import { animatePageEntry } from "@/lib/animations";
import type { Product } from "@shared/schema";

export default function ComparePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  // Get product IDs from URL params
  const productIds = searchParams.get('products')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  // Fetch products for comparison
  const { data: comparisonProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/compare", productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const response = await fetch(`/api/products/compare?ids=${productIds.join(',')}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: productIds.length > 0,
  });

  // Search products for adding to comparison
  const { data: searchResults = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search products");
      const data = await response.json();
      return data.products || [];
    },
    enabled: !!searchQuery.trim(),
  });

  const handleRemoveProduct = (productId: string) => {
    const newProductIds = productIds.filter(id => id !== productId);
    if (newProductIds.length === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ products: newProductIds.join(',') });
    }
  };

  const handleAddProduct = (product: Product) => {
    const productId = product.id || product._id;
    if (!productIds.includes(productId)) {
      const newProductIds = [...productIds, productId];
      setSearchParams({ products: newProductIds.join(',') });
    }
    setShowProductSearch(false);
    setSearchQuery("");
  };

  const toggleProductSearch = () => {
    setShowProductSearch(!showProductSearch);
    setSearchQuery("");
  };

  // Filter out products already in comparison
  const filteredSearchResults = searchResults.filter(
    product => !productIds.includes(product.id || product._id)
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Compare Products
              </h1>
              <p className="text-gray-600">
                Compare features, prices, and specifications side by side
              </p>
            </div>
            
            {comparisonProducts.length < 4 && (
              <Button onClick={toggleProductSearch} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Product Search */}
        {showProductSearch && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search products to add
                  </label>
                  <Input
                    placeholder="Search by name, fabric, or color..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                {filteredSearchResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredSearchResults.slice(0, 12).map((product) => (
                      <Card key={product.id || product._id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <img
                              src={product.imageUrl || product.images?.[0]}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {product.fabric} • {product.color}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-green-600">
                                  ₹{product.price}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddProduct(product)}
                                  disabled={product.stockQuantity === 0}
                                >
                                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {searchQuery && filteredSearchResults.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No products found matching your search</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" onClick={toggleProductSearch}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ProductComparison
            products={comparisonProducts}
            onRemoveProduct={handleRemoveProduct}
            onAddProduct={toggleProductSearch}
            maxProducts={4}
          />
        </div>

        {/* Tips */}
        {comparisonProducts.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Comparison Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <ul className="space-y-2">
                  <li>• Compare up to 4 products at once</li>
                  <li>• Focus on the features most important to you</li>
                  <li>• Check stock availability before deciding</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Consider fabric quality and care instructions</li>
                  <li>• Compare prices and look for the best value</li>
                  <li>• Read reviews for real customer experiences</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}