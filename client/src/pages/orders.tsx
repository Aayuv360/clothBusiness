import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Calendar,
  IndianRupee,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { animatePageEntry } from "@/lib/animations";
import type { Order } from "@shared/schema";

export default function Orders() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    enabled: !!user?.id,
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
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Sign in to view your orders
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access your order history
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shimmer h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start shopping to see your orders here
              </p>
              <Link to="/">
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: Order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          ₹{order.total}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </Badge>
                      <Link to={`/orders/${order._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Order Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Payment Method
                          </span>
                          <span className="capitalize">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Payment Status
                          </span>
                          <Badge
                            variant={
                              order.paymentStatus === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        {order.shippingCost && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Shipping
                            </span>
                            <span>₹{order.shippingCost}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Address
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.shippingAddress?.name}
                        </p>
                        <p>{order.shippingAddress?.addressLine1}</p>
                        {order.shippingAddress?.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                          {order.shippingAddress?.pincode}
                        </p>
                        <p>{order.shippingAddress?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {order.estimatedDelivery && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Truck className="w-4 h-4" />
                        <span>
                          Estimated delivery:{" "}
                          {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}