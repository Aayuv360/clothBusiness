import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { animatePageEntry } from "@/lib/animations";

export default function Cart() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { cartItems, cartTotal, updateQuantity, removeFromCart, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, []);

  const shippingCost = cartTotal >= 999 ? 0 : 99;
  const taxAmount = Math.round(cartTotal * 0.05); // 5% tax
  const finalTotal = cartTotal + shippingCost + taxAmount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shimmer h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div ref={pageRef} className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-charcoal mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any beautiful sarees to your cart
              yet. Start shopping to fill it up!
            </p>
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
    );
  }
  console.log(user);
  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">{cartItems.length} items in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item?.id} className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link href={`/product/${item?.product?.id}`}>
                        <img
                          src={item?.product?.images[0]}
                          alt={item?.product?.name}
                          className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item?.product?.id}`}>
                        <h3 className="text-lg font-semibold text-charcoal mb-2 hover:text-golden cursor-pointer line-clamp-2">
                          {item?.product?.name}
                        </h3>
                      </Link>

                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>Fabric: {item.product.fabric}</p>
                        <p>Color: {item.product.color}</p>
                        <p>Brand: {item.product.brand}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-charcoal">
                            Quantity:
                          </span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-3 py-1 font-semibold min-w-[50px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center justify-between sm:justify-end space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-charcoal">
                              ₹
                              {(
                                parseFloat(item.product.price) * item.quantity
                              ).toLocaleString()}
                            </p>
                            {item.product.originalPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                ₹
                                {(
                                  parseFloat(item.product.originalPrice) *
                                  item.quantity
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link href="/products">
                <Button
                  variant="outline"
                  className="text-charcoal border-charcoal hover:bg-charcoal hover:text-white"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({cartItems.length} items):
                    </span>
                    <span className="font-medium">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span
                      className={`font-medium ${shippingCost === 0 ? "text-green-600" : ""}`}
                    >
                      {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%):</span>
                    <span className="font-medium">
                      ₹{taxAmount.toLocaleString()}
                    </span>
                  </div>

                  {cartTotal < 999 && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      Add ₹{(999 - cartTotal).toLocaleString()} more for free
                      shipping
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total:</span>
                  <span className="text-golden">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <Input placeholder="Enter coupon code" className="flex-1" />
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Checkout Button */}
                {!user ? (
                  <Link href="/checkout">
                    <Button className="w-full bg-golden hover:bg-yellow-600 text-charcoal font-semibold py-3 mb-4">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full bg-golden hover:bg-yellow-600 text-charcoal font-semibold py-3 mb-4">
                      Sign In to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {/* Trust Indicators */}
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Fast delivery across India</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
