import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  RefreshCw,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { animatePageEntry } from "@/lib/animations";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "react-router-dom";
import type { Order } from "@shared/schema";

interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'return' | 'exchange';
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  requestDate: Date;
  estimatedCompletion?: Date;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: string;
  }>;
}

export default function Returns() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  // Fetch eligible orders (completed orders from last 30 days)
  const { data: eligibleOrders = [] } = useQuery({
    queryKey: ["/api/orders/eligible-returns", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${user?.id}/eligible-returns`);
      if (!response.ok) throw new Error("Failed to fetch eligible orders");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch return requests
  const { data: returnRequests = [] } = useQuery<ReturnRequest[]>({
    queryKey: ["/api/returns", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/returns/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch return requests");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Create return request mutation
  const createReturnMutation = useMutation({
    mutationFn: async (returnData: {
      orderId: string;
      type: 'return' | 'exchange';
      reason: string;
      description: string;
    }) => {
      return apiRequest("POST", "/api/returns", returnData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      toast({
        title: "Return request submitted",
        description: "We'll review your request and get back to you within 24 hours.",
      });
      setIsCreateModalOpen(false);
      setSelectedOrder(null);
      setReason('');
      setDescription('');
    },
    onError: () => {
      toast({
        title: "Failed to submit return request",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleCreateReturn = () => {
    if (!selectedOrder || !reason || !description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createReturnMutation.mutate({
      orderId: selectedOrder._id,
      type: returnType,
      reason,
      description,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const returnReasons = [
    'Product damaged',
    'Wrong size',
    'Wrong item received',
    'Quality issues',
    'Not as described',
    'Changed my mind',
    'Other'
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sign in to view returns
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to manage your return requests
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Returns & Exchanges
          </h1>
          <p className="text-gray-600">
            Manage your return and exchange requests
          </p>
        </div>

        {/* Create Return Button */}
        <div className="mb-8">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Request Return/Exchange
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Return or Exchange</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Return Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <Select value={returnType} onValueChange={(value: 'return' | 'exchange') => setReturnType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="return">Return (Refund)</SelectItem>
                      <SelectItem value="exchange">Exchange (Replace)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Order
                  </label>
                  <Select 
                    value={selectedOrder?._id || "none"} 
                    onValueChange={(value) => {
                      if (value === "none") {
                        setSelectedOrder(null);
                      } else {
                        const order = eligibleOrders.find((o: Order) => o._id === value);
                        setSelectedOrder(order || null);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select an order</SelectItem>
                      {eligibleOrders.map((order: Order) => (
                        <SelectItem key={order._id} value={order._id}>
                          Order #{order.orderNumber} - ₹{order.total}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {eligibleOrders.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No eligible orders found. Orders are eligible for returns within 30 days of delivery.
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnReasons.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="Please provide more details about your request..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-24"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateReturn}
                    disabled={createReturnMutation.isPending}
                  >
                    {createReturnMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Return Requests */}
        <div className="space-y-6">
          {returnRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No return requests
                </h3>
                <p className="text-gray-600">
                  You haven't submitted any return or exchange requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            returnRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {request.type === 'return' ? 'Return' : 'Exchange'} Request #{request.id.slice(-6)}
                    </CardTitle>
                    <Badge className={getStatusColor(request.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="font-medium">{request.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Request Date</p>
                      <p className="font-medium">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="font-medium">{request.reason}</p>
                    </div>
                    {request.estimatedCompletion && (
                      <div>
                        <p className="text-sm text-gray-600">Estimated Completion</p>
                        <p className="font-medium">
                          {new Date(request.estimatedCompletion).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {request.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{request.description}</p>
                    </div>
                  )}

                  {/* Status Information */}
                  {request.status === 'approved' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Request Approved</h4>
                      </div>
                      <p className="text-sm text-blue-800">
                        Your {request.type} request has been approved. 
                        {request.type === 'return' 
                          ? ' Please package your item securely and use the provided return label.'
                          : ' Your replacement item will be shipped soon.'
                        }
                      </p>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <h4 className="font-medium text-red-900">Request Rejected</h4>
                      </div>
                      <p className="text-sm text-red-800">
                        Unfortunately, your {request.type} request doesn't meet our return policy criteria. 
                        Please contact customer support for more details.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Return Policy */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Return & Exchange Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Returns and exchanges are accepted within 30 days of delivery</li>
              <li>• Items must be unused, unwashed, and in original condition with tags attached</li>
              <li>• Customized or personalized items cannot be returned</li>
              <li>• Refunds will be processed within 5-7 business days after we receive your return</li>
              <li>• Exchange items will be shipped within 2-3 business days of approval</li>
              <li>• Return shipping is free for defective items; customer pays for other returns</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}