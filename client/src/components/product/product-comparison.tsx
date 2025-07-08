import { useState, useRef, useEffect } from "react";
import { X, Plus, Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { animatePageEntry } from "@/lib/animations";
import { Link } from "react-router-dom";
import type { Product } from "@shared/schema";

interface ProductComparisonProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onAddProduct: () => void;
  maxProducts?: number;
}

export default function ProductComparison({ 
  products, 
  onRemoveProduct, 
  onAddProduct, 
  maxProducts = 4 
}: ProductComparisonProps) {
  const comparisonRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (comparisonRef.current) {
      animatePageEntry(comparisonRef.current);
    }
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart.mutateAsync({
        productId: product.id || product._id,
        quantity: 1,
      });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Failed to add to cart",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const comparisonFeatures = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'fabric', label: 'Fabric' },
    { key: 'color', label: 'Color' },
    { key: 'stockQuantity', label: 'Stock' },
    { key: 'sku', label: 'SKU' },
  ];

  const getFeatureValue = (product: Product, feature: string) => {
    switch (feature) {
      case 'name':
        return product.name;
      case 'price':
        return `₹${product.price}`;
      case 'fabric':
        return product.fabric;
      case 'color':
        return product.color;
      case 'stockQuantity':
        return product.stockQuantity > 0 ? product.stockQuantity : 'Out of Stock';
      case 'sku':
        return product.sku;
      default:
        return '-';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products to compare
        </h3>
        <p className="text-gray-600 mb-4">
          Add products to compare their features and prices
        </p>
        <Button onClick={onAddProduct}>
          Add Products to Compare
        </Button>
      </div>
    );
  }

  return (
    <div ref={comparisonRef} className="w-full">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Product Headers */}
          <div className="grid grid-cols-1 gap-6 mb-6" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
            {/* Feature Label Column */}
            <div className="sticky left-0 bg-white z-10">
              <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-700">Product Details</span>
              </div>
            </div>

            {/* Product Cards */}
            {products.map((product) => (
              <Card key={product.id || product._id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
                  onClick={() => onRemoveProduct(product.id || product._id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={product.imageUrl || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge className="bg-red-600 text-white">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/product/${product.id || product._id}`}>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">
                      ₹{product.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity === 0 || addToCart.isPending}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Product Button */}
            {products.length < maxProducts && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center min-h-64">
                <Button
                  variant="outline"
                  onClick={onAddProduct}
                  className="h-full w-full border-dashed"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Add Product
                </Button>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={feature.key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="sticky left-0 bg-inherit px-6 py-4 font-medium text-gray-900 border-r">
                          {feature.label}
                        </td>
                        {products.map((product) => (
                          <td 
                            key={product.id || product._id} 
                            className={`px-6 py-4 text-center ${
                              feature.key === 'stockQuantity' 
                                ? getStockColor(product.stockQuantity) 
                                : 'text-gray-900'
                            }`}
                          >
                            {getFeatureValue(product, feature.key)}
                          </td>
                        ))}
                        {products.length < maxProducts && (
                          Array.from({ length: maxProducts - products.length }).map((_, i) => (
                            <td key={`empty-${i}`} className="px-6 py-4 text-center text-gray-400">
                              -
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-green-600 mb-1">Lowest Price</h4>
                <p className="text-2xl font-bold">
                  ₹{Math.min(...products.map(p => parseFloat(p.price)))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-blue-600 mb-1">In Stock</h4>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.stockQuantity > 0).length}/{products.length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-purple-600 mb-1">Comparing</h4>
                <p className="text-2xl font-bold">
                  {products.length} products
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}