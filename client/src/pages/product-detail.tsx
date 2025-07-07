import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProductCard from "@/components/product/product-card";
import { useCart } from "@/hooks/use-cart";
import { animatePageEntry } from "@/lib/animations";
import type { Product, Review } from "@shared/schema";

export default function ProductDetail() {
  const pageRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const productId = params.id;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addToCart, isAddingToCart } = useCart();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews", productId],
    enabled: !!productId,
  });

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - SareeMart`;
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="bg-gray-200 h-96 rounded-lg shimmer" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-20 rounded shimmer" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-200 h-8 rounded shimmer" />
              <div className="bg-gray-200 h-4 rounded shimmer" />
              <div className="bg-gray-200 h-6 rounded shimmer" />
              <div className="bg-gray-200 h-32 rounded shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Product not found
          </h1>
          <Link href="/products">
            <Button className="bg-golden hover:bg-yellow-600 text-charcoal">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.costPrice
    ? Math.round(
        (1 - parseFloat(product.price) / parseFloat(product.costPrice)) * 100,
      )
    : 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum: number, review: Review) => sum + review.rating,
          0,
        ) / reviews.length
      : parseFloat(product.rating || "0");

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    window.location.href = "/checkout";
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-golden">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-golden">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-charcoal font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/products">
          <Button
            variant="ghost"
            className="mb-6 text-charcoal hover:text-golden"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <img
                src={
                  product.images?.[selectedImageIndex] || product.images?.[0]
                }
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`bg-white p-2 rounded-lg shadow-sm border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-golden"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-charcoal">
                {product.name}
              </h1>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-charcoal"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-golden mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating)
                        ? "fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-charcoal">
                ₹{product.price}
              </span>
              {product.costPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through ml-3">
                    ₹{product.costPrice}
                  </span>
                  <Badge className="bg-green-100 text-green-800 ml-3">
                    {discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
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
                <span className="ml-2 text-gray-600">{product?.length}</span>
              </div>
              <div>
                <span className="font-semibold text-charcoal">Blouse:</span>
                <span className="ml-2 text-gray-600">
                  {product?.blouseLength}
                </span>
              </div>
              <div>
                <span className="font-semibold text-charcoal">Occasion:</span>
                <span className="ml-2 text-gray-600">{product?.occasion}</span>
              </div>
              <div>
                <span className="font-semibold text-charcoal">Brand:</span>
                <span className="ml-2 text-gray-600">{product?.brand}</span>
              </div>
            </div>

            {/* Stock Status */}
            {product.stockQuantity !== undefined && (
              <div className="mb-6">
                {product.stockQuantity === 0 ? (
                  <Badge variant="destructive">Out of Stock</Badge>
                ) : product.stockQuantity < 5 ? (
                  <Badge className="bg-orange-100 text-orange-800">
                    Only {product.stockQuantity} left in stock
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">
                    In Stock
                  </Badge>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="font-semibold text-charcoal">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-semibold min-w-[60px] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 p-0"
                  disabled={
                    product.stockQuantity !== undefined &&
                    quantity >= product.stockQuantity
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stockQuantity === 0}
                className="flex-1 bg-golden hover:bg-yellow-600 text-charcoal py-3 font-semibold"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={product.stockQuantity === 0}
                className="flex-1 bg-charcoal hover:bg-gray-800 text-white py-3 font-semibold"
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3">
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
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="care">Care Instructions</TabsTrigger>
            </TabsList>

            <TabsContent
              value="description"
              className="bg-white rounded-lg shadow-sm p-6 mt-4"
            >
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                Product Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </TabsContent>

            <TabsContent
              value="reviews"
              className="bg-white rounded-lg shadow-sm p-6 mt-4"
            >
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                Customer Reviews
              </h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: Review) => (
                    <div
                      key={review.id}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-charcoal">
                              {review.user.username}
                            </span>
                            <div className="flex text-golden">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600">{review.comment}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </TabsContent>

            <TabsContent
              value="care"
              className="bg-white rounded-lg shadow-sm p-6 mt-4"
            >
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                Care Instructions
              </h3>
              <div className="space-y-3 text-gray-600">
                <p>• Dry clean only for best results</p>
                <p>• Store in a cool, dry place away from direct sunlight</p>
                <p>• Avoid contact with perfumes and sharp objects</p>
                <p>• Iron on low heat with a cotton cloth</p>
                <p>• Handle with care to maintain fabric quality</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
