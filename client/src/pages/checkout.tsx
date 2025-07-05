import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { CreditCard, Truck, MapPin, Phone, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { animatePageEntry } from '@/lib/animations';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.username || '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home'
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }

    if (cartItems.length === 0) {
      setLocation('/cart');
      return;
    }

    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, [isAuthenticated, cartItems.length, setLocation]);

  const shippingCost = cartTotal >= 999 ? 0 : 99;
  const taxAmount = Math.round(cartTotal * 0.05);
  const finalTotal = cartTotal + shippingCost + taxAmount;

  const steps = [
    { id: 1, title: 'Shipping Address', icon: <MapPin className="h-5 w-5" /> },
    { id: 2, title: 'Payment Method', icon: <CreditCard className="h-5 w-5" /> },
    { id: 3, title: 'Review Order', icon: <Check className="h-5 w-5" /> }
  ];

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.addressLine1 || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required address fields.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'upi' && !paymentDetails.upiId) {
      toast({
        title: "Missing UPI ID",
        description: "Please enter your UPI ID.",
        variant: "destructive"
      });
      return;
    }
    
    if (paymentMethod === 'card' && (!paymentDetails.cardNumber || !paymentDetails.expiryDate || 
        !paymentDetails.cvv || !paymentDetails.cardholderName)) {
      toast({
        title: "Missing Card Details",
        description: "Please fill in all card information.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success
      await clearCart(user!.id);
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been confirmed. You will receive a confirmation email shortly.",
      });
      
      setLocation('/orders');
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return null;
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/cart')}
                className="text-charcoal hover:text-golden"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
              <h1 className="text-3xl font-bold text-charcoal">Checkout</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-golden">₹{finalTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-golden border-golden text-charcoal' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.icon}
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep >= step.id ? 'text-charcoal' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${
                    currentStep > step.id ? 'bg-golden' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-charcoal">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        value={shippingAddress.addressLine1}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                        placeholder="House No, Building, Street"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input
                        id="addressLine2"
                        value={shippingAddress.addressLine2}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                        placeholder="Landmark, Area"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Address Type</Label>
                      <RadioGroup 
                        value={shippingAddress.type} 
                        onValueChange={(value) => setShippingAddress(prev => ({ ...prev, type: value }))}
                        className="flex space-x-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="home" id="home" />
                          <Label htmlFor="home">Home</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="office" id="office" />
                          <Label htmlFor="office">Office</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full bg-golden hover:bg-yellow-600 text-charcoal">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-charcoal">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {/* UPI Payment */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi" className="font-medium">UPI Payment</Label>
                        </div>
                        {paymentMethod === 'upi' && (
                          <div>
                            <Label htmlFor="upiId">UPI ID</Label>
                            <Input
                              id="upiId"
                              value={paymentDetails.upiId}
                              onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                              placeholder="yourname@upi"
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>

                      {/* Card Payment */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="font-medium">Credit/Debit Card</Label>
                        </div>
                        {paymentMethod === 'card' && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="cardholderName">Cardholder Name</Label>
                              <Input
                                id="cardholderName"
                                value={paymentDetails.cardholderName}
                                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                                placeholder="1234 5678 9012 3456"
                                className="mt-2"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                  id="expiryDate"
                                  value={paymentDetails.expiryDate}
                                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                                  placeholder="MM/YY"
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  value={paymentDetails.cvv}
                                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                  placeholder="123"
                                  className="mt-2"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cash on Delivery */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="font-medium">Cash on Delivery</Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="flex space-x-4">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        Back to Address
                      </Button>
                      <Button type="submit" className="flex-1 bg-golden hover:bg-yellow-600 text-charcoal">
                        Review Order
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-charcoal">
                    <Check className="h-5 w-5 mr-2" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address Review */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Shipping Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{shippingAddress.name}</p>
                      <p>{shippingAddress.addressLine1}</p>
                      {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                      <p>{shippingAddress.phone}</p>
                    </div>
                    <Button 
                      variant="link" 
                      onClick={() => setCurrentStep(1)}
                      className="p-0 h-auto text-golden"
                    >
                      Change Address
                    </Button>
                  </div>

                  {/* Payment Method Review */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Payment Method</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">
                        {paymentMethod === 'upi' && 'UPI Payment'}
                        {paymentMethod === 'card' && 'Credit/Debit Card'}
                        {paymentMethod === 'cod' && 'Cash on Delivery'}
                      </p>
                      {paymentMethod === 'upi' && <p>{paymentDetails.upiId}</p>}
                      {paymentMethod === 'card' && <p>**** **** **** {paymentDetails.cardNumber.slice(-4)}</p>}
                    </div>
                    <Button 
                      variant="link" 
                      onClick={() => setCurrentStep(2)}
                      className="p-0 h-auto text-golden"
                    >
                      Change Payment Method
                    </Button>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      Back to Payment
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 bg-golden hover:bg-yellow-600 text-charcoal"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-charcoal">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-golden">₹{finalTotal.toLocaleString()}</span>
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
