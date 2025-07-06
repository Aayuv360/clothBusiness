import { useState } from 'react';
import { Link } from 'wouter';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, isAddingToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!product) {
    return null;
  }

  const discount = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id);
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

  return (
    <Card className="product-card group cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <Link href={`/product/${product._id}`}>
        <div className="relative">
          <img
            src={product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name || 'Product'}
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
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
              }`} 
            />
          </Button>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.inStock && product.inStock < 5 && (
              <Badge className="bg-orange-500 text-white">
                Only {product.inStock} left
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-deep-red text-white">
                {discount}% OFF
              </Badge>
            )}
            {parseFloat(product.rating || "0") >= 4.5 && (
              <Badge className="bg-green-500 text-white">
                Bestseller
              </Badge>
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
            {product.fabric} • {product.occasion}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex text-golden">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(parseFloat(product.rating || "0"))
                      ? 'fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm ml-2">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-charcoal">
                ₹{product.price || '0'}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.inStock}
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
          {product.inStock === 0 && (
            <p className="text-red-500 text-sm mt-2 font-medium">Out of Stock</p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
