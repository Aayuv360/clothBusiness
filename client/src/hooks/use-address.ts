import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Address, InsertAddress } from '@shared/schema';

export function useAddress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['/api/addresses', user?._id],
    queryFn: async () => {
      if (!user?._id) throw new Error('User not authenticated');
      const response = await fetch(`/api/addresses/${user._id}`);
      if (!response.ok) throw new Error('Failed to fetch addresses');
      return response.json();
    },
    enabled: !!user?._id,
  });

  const createAddressMutation = useMutation({
    mutationFn: async (addressData: InsertAddress) => {
      const response = await apiRequest('POST', '/api/addresses', addressData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses', user?._id] });
      toast({
        title: "Address added",
        description: "New address has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add address",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAddress> }) => {
      const response = await apiRequest('PUT', `/api/addresses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses', user?._id] });
      toast({
        title: "Address updated",
        description: "Address has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update address",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/addresses/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses', user?._id] });
      toast({
        title: "Address deleted",
        description: "Address has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete address",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const createAddress = (addressData: InsertAddress) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to add addresses.",
        variant: "destructive",
      });
      return;
    }
    createAddressMutation.mutate({ ...addressData, userId: user._id });
  };

  const updateAddress = (id: string, data: Partial<InsertAddress>) => {
    updateAddressMutation.mutate({ id, data });
  };

  const deleteAddress = (id: string) => {
    deleteAddressMutation.mutate(id);
  };

  return {
    addresses,
    isLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    isCreating: createAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
  };
}