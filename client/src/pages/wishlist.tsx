import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { animatePageEntry } from "@/lib/animations";
import { apiRequest } from "@/lib/queryClient";
import type { WishlistItem, Product } from "@shared/schema";

type WishlistItemWithProduct = WishlistItem & { product: Product };

export default function Wishlist() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { addToCart, isAddingToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading } = useQuery<
    WishlistItemWithProduct[]
  >({
    queryKey: ["/api/wishlist", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove from wishlist");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    },
  });

  // Add to cart from wishlist
  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  // Move to cart (add to cart and remove from wishlist)
  const handleMoveToCart = async (item: WishlistItemWithProduct) => {
    try {
      await addToCart(item.product.id, 1);
      removeFromWishlistMutation.mutate(item.id);
      toast({
        title: "Moved to Cart",
        description: `${item.product.name} has been moved to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move item to cart",
        variant: "destructive",
      });
    }
  };

  // Filter products by category
  const filteredItems =
    filter === "all"
      ? wishlistItems
      : wishlistItems.filter(
          (item) =>
            item.product.fabric.toLowerCase().includes(filter.toLowerCase()) ||
            item.product.color.toLowerCase().includes(filter.toLowerCase()),
        );

  // Get unique categories for filter
  const categories = [
    ...new Set(wishlistItems.map((item) => item.product.fabric)),
  ];

  if (!user) {
    return (
      <div ref={pageRef} className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-charcoal mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Sign in to view your wishlist and save your favorite sarees.
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-golden hover:bg-yellow-600 text-charcoal font-semibold"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 shimmer" />
            <div className="h-4 bg-gray-200 rounded w-32 shimmer" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shimmer h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div ref={pageRef} className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-charcoal mb-4">
              {filter === "all"
                ? "Your wishlist is empty"
                : "No items match your filter"}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filter === "all"
                ? "Save your favorite sarees to your wishlist for easy access later."
                : "Try adjusting your filter or browse all wishlist items."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {filter !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setFilter("all")}
                  className="text-charcoal border-charcoal hover:bg-charcoal hover:text-white"
                >
                  Show All Items
                </Button>
              )}
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-golden hover:bg-yellow-600 text-charcoal font-semibold"
                >
                  Continue Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {filteredItems.length} items saved
              </p>
            </div>

            {/* Filter */}
            {categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="all">All Items</option>
                  {categories.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => {
              filteredItems.forEach((item) => handleMoveToCart(item));
            }}
            disabled={isAddingToCart}
            className="bg-golden hover:bg-yellow-600 text-charcoal font-semibold"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Move All to Cart
          </Button>
          <Link href="/products">
            <Button
              variant="outline"
              className="text-charcoal border-charcoal hover:bg-charcoal hover:text-white"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-0">
                <div className="relative">
                  {/* Product Image */}
                  <Link href={`/product/${item.product.id}`}>
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-64 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWishlistMutation.mutate(item.id)}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>

                  {/* Stock Status */}
                  {item.product.inStock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge
                        variant="secondary"
                        className="bg-red-500 text-white"
                      >
                        Out of Stock
                      </Badge>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {item.product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-deep-red text-white">
                      {Math.round(
                        (1 -
                          parseFloat(item.product.price) /
                            parseFloat(item.product.originalPrice)) *
                          100,
                      )}
                      % OFF
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  {/* Product Info */}
                  <Link href={`/product/${item.product.id}`}>
                    <h3 className="font-semibold text-charcoal mb-2 hover:text-golden cursor-pointer line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="text-sm text-gray-600 mb-3 space-y-1">
                    <p>Fabric: {item.product.fabric}</p>
                    <p>Color: {item.product.color}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center mb-4">
                    <span className="text-lg font-bold text-charcoal">
                      ₹{parseFloat(item.product.price).toLocaleString()}
                    </span>
                    {item.product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹
                        {parseFloat(
                          item.product.originalPrice,
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleMoveToCart(item)}
                      disabled={isAddingToCart || item.product.inStock <= 0}
                      className="w-full bg-golden hover:bg-yellow-600 text-charcoal font-semibold"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Move to Cart
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleAddToCart(item.product)}
                      disabled={isAddingToCart || item.product.inStock <= 0}
                      className="w-full text-charcoal border-charcoal hover:bg-charcoal hover:text-white"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
