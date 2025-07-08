import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import ShareButtons from "@/components/social/share-buttons";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onClick?: () => void;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  onQuickView,
  onClick,
  viewMode = "grid",
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, isAddingToCart } = useCart();

  const addToComparison = () => {
    const existing = JSON.parse(localStorage.getItem('comparisonProducts') || '[]');
    if (existing.length >= 3) {
      alert('You can compare up to 3 products at once');
      return;
    }
    if (!existing.find((p: any) => p.id === product.id)) {
      localStorage.setItem('comparisonProducts', JSON.stringify([...existing, product]));
      alert('Product added to comparison');
    }
  };

  if (!product) {
    return null;
  }

  const discount = product.costPrice
    ? Math.round(
        ((parseFloat(product.costPrice) - parseFloat(product.price)) /
          parseFloat(product.costPrice)) *
          100,
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  // Stock status styling
  const getStockStatus = () => {
    if (product.stockQuantity === 0) return { text: "Out of Stock", color: "text-red-600" };
    if (product.stockQuantity <= 5) return { text: `${product.stockQuantity} left`, color: "text-orange-600" };
    if (product.stockQuantity <= 10) return { text: "Low Stock", color: "text-yellow-600" };
    return { text: "In Stock", color: "text-green-600" };
  };

  const stockStatus = getStockStatus();

  if (viewMode === "list") {
    return (
      <Card className="product-card group cursor-pointer bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex p-4 gap-4" onClick={onClick}>
          <div className="flex-shrink-0 relative">
            <img
              src={product.imageUrl || product.images?.[0]}
              alt={product.name || "Product"}
              className="w-32 h-32 object-cover rounded-lg"
            />
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                {discount}% OFF
              </Badge>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
                {product.name}
              </h3>
            </Link>
            
            <p className="text-gray-600 text-sm mb-2">
              {product.fabric} • {product.color}
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
              {product.costPrice && discount > 0 && (
                <span className="text-sm text-gray-500 line-through">₹{product.costPrice}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className="h-8 w-8 p-0"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0 || isAddingToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="product-card group cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div onClick={onClick}>
        <Link to={`/product/${product.id || product._id}`}>
          <div className="relative">
          <img
            src={product.imageUrl || product.images?.[0]}
            alt={product.name || "Product"}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
            onClick={handleWishlistToggle}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </Button>

          {/* Stock Status & Discount Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.stockQuantity === 0 && (
              <Badge className="bg-red-500 text-white">Out of Stock</Badge>
            )}
            {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
              <Badge className="bg-orange-500 text-white">
                Only {product.stockQuantity} left
              </Badge>
            )}
            {product.stockQuantity > 5 && product.stockQuantity <= 10 && (
              <Badge className="bg-yellow-500 text-white">Low Stock</Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-red-600 text-white">{discount}% OFF</Badge>
            )}
          </div>

          {/* Quick View on Hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleQuickView}
              className="bg-white text-charcoal hover:bg-gray-100"
            >
              Quick View
            </Button>
          </div>
          </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-charcoal mb-2 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-gray-600 text-sm mb-2">
            {product.fabric} • {product.color}
          </p>

          {/* Product Info */}
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              SKU: {product.sku}
            </span>
            <span className="ml-2 text-sm text-gray-600">
              Stock: {product.stockQuantity}
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-charcoal">
                ₹{product.price || "0"}
              </span>
              {product.costPrice && discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.costPrice}
                </span>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.stockQuantity}
              className="bg-golden hover:bg-yellow-600 text-charcoal font-semibold transition-all transform hover:scale-105"
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>

          {/* Stock Status */}
          {product.stockQuantity === 0 && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              Out of Stock
            </p>
          )}

          {/* Additional Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToComparison();
              }}
              className="flex-1 text-xs"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Compare
            </Button>
            <div onClick={(e) => e.stopPropagation()}>
              <ShareButtons 
                product={{
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl || product.images?.[0] || '',
                  id: product.id
                }} 
              />
            </div>
          </div>
        </CardContent>
        </Link>
      </div>
    </Card>
  );
}
