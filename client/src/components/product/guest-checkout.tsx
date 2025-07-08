import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GuestCheckoutProps {
  cartItems: any[];
  total: string;
  onOrderSuccess: (orderId: string) => void;
}

interface GuestOrderData {
  guestInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: any[];
  total: string;
  paymentMethod: string;
}

export default function GuestCheckout({ cartItems, total, onOrderSuccess }: GuestCheckoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const guestOrderMutation = useMutation({
    mutationFn: async (orderData: GuestOrderData) => {
      return apiRequest("POST", "/api/guest-orders", orderData);
    },
    onSuccess: (data) => {
      toast({
        title: "Order placed successfully!",
        description: `Order #${data.orderNumber} has been confirmed.`,
      });
      onOrderSuccess(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all guest information fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast({
        title: "Missing address",
        description: "Please fill in all shipping address fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestInfo.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(guestInfo.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'razorpay') {
        // Create Razorpay order
        const razorpayResponse = await apiRequest("POST", "/api/razorpay/create-order", {
          amount: parseFloat(total) * 100, // Convert to paise
          currency: "INR",
        });

        // Initialize Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayResponse.amount,
          currency: razorpayResponse.currency,
          name: "Saree Shop",
          description: "Saree Purchase",
          order_id: razorpayResponse.id,
          prefill: {
            name: guestInfo.name,
            email: guestInfo.email,
            contact: guestInfo.phone,
          },
          theme: {
            color: "#2563eb",
          },
          handler: async (response: any) => {
            try {
              // Verify payment and create order
              const verifyResponse = await apiRequest("POST", "/api/razorpay/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.success) {
                // Create guest order
                await guestOrderMutation.mutateAsync({
                  guestInfo,
                  shippingAddress,
                  items: cartItems,
                  total,
                  paymentMethod: 'razorpay'
                });
              }
            } catch (error) {
              toast({
                title: "Payment verification failed",
                description: "Please contact support if money was deducted.",
                variant: "destructive",
              });
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // COD order
        await guestOrderMutation.mutateAsync({
          guestInfo,
          shippingAddress,
          items: cartItems,
          total,
          paymentMethod: 'cod'
        });
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guest Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Guest Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                placeholder="10-digit phone number"
                maxLength={10}
                required
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Order confirmation and tracking details will be sent to your email and phone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              value={shippingAddress.addressLine1}
              onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
              placeholder="House/Flat number, Building name"
              required
            />
          </div>
          <div>
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              value={shippingAddress.addressLine2}
              onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
              placeholder="Area, Landmark"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                placeholder="City"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                placeholder="State"
                required
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={shippingAddress.pincode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                placeholder="6-digit pincode"
                maxLength={6}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="razorpay"
                name="payment"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="razorpay" className="font-medium">
                Credit/Debit Card, UPI, Net Banking
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="cod"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <Label htmlFor="cod" className="font-medium">
                Cash on Delivery (COD)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Items ({cartItems.length})</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/cart")}
          className="flex-1"
        >
          Back to Cart
        </Button>
        <Button
          type="submit"
          disabled={isProcessing || guestOrderMutation.isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing || guestOrderMutation.isPending ? "Processing..." : `Place Order - ₹${total}`}
        </Button>
      </div>
    </form>
  );
}