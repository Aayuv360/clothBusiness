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
    const updatedIds = recentlyViewedIds.filter(id => id !== productId);
    setRecentlyViewedIds(updatedIds);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedIds));
  };

  if (recentlyViewedProducts.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recently Viewed
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentlyViewed}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentlyViewedProducts.map((product) => (
            <div key={product.id || product._id} className="relative">
              <ProductCard
                product={product}
                viewMode="grid"
                className="h-full"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 left-2 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  removeProduct(product.id || product._id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to manage recently viewed products
export function useRecentlyViewed() {
  const addToRecentlyViewed = (productId: string) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let ids: string[] = [];
      
      if (stored) {
        const parsed = JSON.parse(stored);
        ids = Array.isArray(parsed) ? parsed : [];
      }
      
      // Remove if already exists and add to beginning
      ids = [productId, ...ids.filter(id => id !== productId)];
      
      // Keep only the most recent items
      ids = ids.slice(0, MAX_RECENTLY_VIEWED);
      
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Failed to add to recently viewed:', error);
    }
  };

  const getRecentlyViewed = (): string[] => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        return Array.isArray(ids) ? ids : [];
      }
    } catch (error) {
      console.error('Failed to get recently viewed:', error);
    }
    return [];
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  };

  return {
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed,
  };
}