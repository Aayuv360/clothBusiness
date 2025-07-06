import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { CartItem, Product } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

export function useCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userId = user?._id;
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      const response = await fetch(`/api/cart/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
    enabled: !!userId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      const response = await apiRequest("POST", "/api/cart", {
        userId,
        productId,
        quantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await apiRequest("PATCH", `/api/cart/${id}`, {
        quantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
    },
    onError: () => {
      toast({
        title: "Failed to update quantity",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove item",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/cart/clear/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", userId] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to clear cart",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToCart = (productId: string, quantity?: number) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate({ productId, quantity });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartMutation.mutate(id);
    } else {
      updateQuantityMutation.mutate({ id, quantity });
    }
  };

  const removeFromCart = (id: string) => {
    removeFromCartMutation.mutate(id);
  };

  const clearCart = () => {
    if (userId) clearCartMutation.mutate(userId);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const cartTotal = cartItems.reduce(
    (total: number, item: CartItemWithProduct) => {
      return total + parseFloat(item?.product?.price || "0") * item.quantity;
    },
    0,
  );

  const cartCount = cartItems.reduce(
    (count: number, item: CartItemWithProduct) => {
      return count + item.quantity;
    },
    0,
  );

  return {
    cartItems,
    isLoading,
    isOpen,
    cartTotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
  };
}
