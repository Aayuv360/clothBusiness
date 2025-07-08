import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Calendar,
  IndianRupee,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  ArrowLeft,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { animatePageEntry } from "@/lib/animations";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    images: string[];
    sku: string;
  };
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  total: string;
  shippingCost?: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress: any;
  estimatedDelivery?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetail() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders/detail", id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/detail/${id}`);
      if (!response.ok) throw new Error("Failed to fetch order details");
      return response.json() as Promise<OrderDetail>;
    },
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5" />;
      case "processing":
        return <Clock className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <Package className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shimmer h-64" />
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shimmer h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Order not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-golden hover:text-golden-dark mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  Total: ₹{order.total}
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-base px-4 py-2`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </div>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-golden line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        SKU: {item.product.sku}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>₹{(parseFloat(order.total) - parseFloat(order.shippingCost || "0")).toString()}</span>
                </div>
                {order.shippingCost && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span>₹{order.shippingCost}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Method</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <Badge
                    variant={order.paymentStatus === "completed" ? "default" : "secondary"}
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.shippingAddress?.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.shippingAddress?.addressLine1}
                  </p>
                  {order.shippingAddress?.addressLine2 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                    {order.shippingAddress?.pincode}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.shippingAddress?.phone}
                  </p>
                </div>
                {order.estimatedDelivery && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Truck className="w-4 h-4" />
                      <span>
                        Estimated delivery:{" "}
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}