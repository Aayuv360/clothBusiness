import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductCard from "./product-card";
import type { Product } from "@shared/schema";

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_RECENTLY_VIEWED = 12;

interface RecentlyViewedProps {
  className?: string;
}

export default function RecentlyViewed({ className = "" }: RecentlyViewedProps) {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load recently viewed products from localStorage
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setRecentlyViewedIds(Array.isArray(ids) ? ids : []);
      } catch (error) {
        console.error('Failed to parse recently viewed products:', error);
        setRecentlyViewedIds([]);
      }
    }
  }, []);

  // Fetch products data
  const { data: recentlyViewedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/recently-viewed", recentlyViewedIds],
    queryFn: async () => {
      if (recentlyViewedIds.length === 0) return [];
      
      const response = await fetch(`/api/products/compare?ids=${recentlyViewedIds.join(',')}`);
      if (!response.ok) throw new Error("Failed to fetch recently viewed products");
      return response.json();
    },
    enabled: recentlyViewedIds.length > 0,
  });

  const clearRecentlyViewed = () => {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    setRecentlyViewedIds([]);
  };

  const removeProduct = (productId: string) => {
    const updated = recentlyViewedIds.filter(id => id !== productId);
    setRecentlyViewedIds(updated);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  };

  if (recentlyViewedIds.length === 0) {
    return null; // Don't show section if no recently viewed products
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-xl">Recently Viewed</CardTitle>
        </div>
        {recentlyViewedIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearRecentlyViewed}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {recentlyViewedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentlyViewedProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard
                  product={product}
                  viewMode="grid"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-full p-1 hover:bg-white"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Loading recently viewed products...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for managing recently viewed products
export function useRecentlyViewed() {
  const addToRecentlyViewed = (productId: string) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let recentlyViewed: string[] = [];
      
      if (stored) {
        recentlyViewed = JSON.parse(stored);
      }
      
      // Remove if already exists (to move to front)
      recentlyViewed = recentlyViewed.filter(id => id !== productId);
      
      // Add to front
      recentlyViewed.unshift(productId);
      
      // Keep only last N items
      if (recentlyViewed.length > MAX_RECENTLY_VIEWED) {
        recentlyViewed = recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);
      }
      
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Failed to save recently viewed product:', error);
    }
  };
  
  const getRecentlyViewed = (): string[] => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get recently viewed products:', error);
      return [];
    }
  };
  
  const clearRecentlyViewed = () => {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  };
  
  return {
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed
  };
}