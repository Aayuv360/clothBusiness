import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { animatePageEntry } from '@/lib/animations';
import type { Order } from '@shared/schema';

export default function Orders() {
  const [, setLocation] = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }

    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, [isAuthenticated, setLocation]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders', user?.id],
    enabled: !!user?.id,
  });

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'packed':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getActiveOrders = () => orders.filter((order: Order) => 
    !['delivered', 'cancelled'].includes(order.status)
  );

  const getCompletedOrders = () => orders.filter((order: Order) => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-charcoal">
              Order #{order.orderNumber}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(order.status)}>
              {formatStatus(order.status)}
            </Badge>
            <p className="text-lg font-bold text-charcoal mt-1">
              ₹{parseFloat(order.total).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span className="text-sm text-gray-600">
              {order.status === 'pending' && 'Order is being processed'}
              {order.status === 'confirmed' && 'Order confirmed, preparing for dispatch'}
              {order.status === 'packed' && 'Order packed and ready to ship'}
              {order.status === 'shipped' && 'Order shipped, on the way'}
              {order.status === 'delivered' && 'Order delivered successfully'}
              {order.status === 'cancelled' && 'Order was cancelled'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Link href={`/orders/${order.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </Link>
            
            {order.status === 'delivered' && (
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}
            
            {['delivered', 'cancelled'].includes(order.status) && (
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reorder
              </Button>
            )}
          </div>
        </div>

        {order.estimatedDelivery && !['delivered', 'cancelled'].includes(order.status) && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Truck className="h-4 w-4 inline mr-1" />
              Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shimmer h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track and manage your saree orders
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-charcoal mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/products">
              <Button className="bg-golden hover:bg-yellow-600 text-charcoal font-semibold">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">
                Active Orders ({getActiveOrders().length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Order History ({getCompletedOrders().length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {getActiveOrders().length > 0 ? (
                getActiveOrders().map((order: Order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No active orders
                  </h3>
                  <p className="text-gray-500">
                    All your orders have been completed or cancelled.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {getCompletedOrders().length > 0 ? (
                getCompletedOrders().map((order: Order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No completed orders
                  </h3>
                  <p className="text-gray-500">
                    Your completed orders will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Order Tracking Guide */}
        {orders.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-charcoal">Order Status Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Pending:</span>
                  <span className="text-gray-600">Order received</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Confirmed:</span>
                  <span className="text-gray-600">Payment verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Packed:</span>
                  <span className="text-gray-600">Ready to ship</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Shipped:</span>
                  <span className="text-gray-600">On the way</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Delivered:</span>
                  <span className="text-gray-600">Order received</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Cancelled:</span>
                  <span className="text-gray-600">Order cancelled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
