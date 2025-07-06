import { useState, useEffect } from 'react';
import { X, Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { animateModal } from '@/lib/animations';
import type { Product } from '@shared/schema';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart, isAddingToCart } = useCart();

  useEffect(() => {
    if (isOpen && product) {
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const discount = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price || '0') / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product._id, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product._id, quantity);
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto p-0">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="main-image mb-4">
                <img
                  src={product.images?.[selectedImage] || '/placeholder-image.jpg'}
                  alt={product.name || 'Product'}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              
              {(product.images?.length || 0) > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-full h-20 rounded cursor-pointer border-2 transition-colors ${
                        selectedImage === index ? 'border-golden' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <DialogTitle className="text-2xl font-bold text-charcoal mb-4">
                {product.name}
              </DialogTitle>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-golden mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(parseFloat(product.rating || "0"))
                          ? 'fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-charcoal">₹{product.price || '0'}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through ml-3">
                      ₹{product.originalPrice}
                    </span>
                    <Badge className="bg-green-100 text-green-800 ml-3">
                      {discount}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-charcoal">Fabric:</span>
                    <span className="ml-2 text-gray-600">{product.fabric}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal">Color:</span>
                    <span className="ml-2 text-gray-600">{product.color}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal">Length:</span>
                    <span className="ml-2 text-gray-600">{product.length}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal">Blouse:</span>
                    <span className="ml-2 text-gray-600">{product.blouseLength}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal">Occasion:</span>
                    <span className="ml-2 text-gray-600">{product.occasion}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-charcoal">Brand:</span>
                    <span className="ml-2 text-gray-600">{product.brand}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="font-semibold text-charcoal">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {product.inStock && product.inStock < 10 && (
                  <span className="text-orange-500 text-sm">
                    Only {product.inStock} left in stock
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-6">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !product.inStock}
                  className="flex-1 bg-golden hover:bg-yellow-600 text-charcoal py-3 font-semibold"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 bg-charcoal hover:bg-gray-800 text-white py-3 font-semibold"
                >
                  Buy Now
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="px-4 py-3 border border-gray-300 hover:bg-gray-50"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="h-4 w-4 mr-2 text-green-600" />
                  <span>Free shipping on orders above ₹999</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
                  <span>7-day easy returns & exchanges</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2 text-purple-600" />
                  <span>100% authentic products</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Description */}
              <div>
                <h4 className="font-semibold text-charcoal mb-2">Product Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
