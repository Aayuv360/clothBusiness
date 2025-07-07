import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { CreditCard, Truck, MapPin, Phone, Check, ArrowLeft, Wallet, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useAddress } from '@/hooks/use-address';
import { useToast } from '@/hooks/use-toast';
import { animatePageEntry } from '@/lib/animations';
import type { Address, InsertAddress } from '@shared/schema';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addresses, createAddress, updateAddress, deleteAddress, isCreating, isUpdating, isDeleting } = useAddress();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [newAddress, setNewAddress] = useState<InsertAddress>({
    userId: user?.id || '',
    name: user?.username || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    isDefault: false
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (user === null && isAuthenticated === false) {
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
  }, [user, isAuthenticated, cartItems.length, setLocation]);

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
    if (!selectedAddressId) {
      toast({
        title: "Address Required",
        description: "Please select a shipping address.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || 
        !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (editingAddress) {
      updateAddress(editingAddress._id, newAddress);
    } else {
      createAddress(newAddress);
    }
    
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    setNewAddress({
      userId: user?.id || '',
      name: user?.username || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home',
      isDefault: false
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      userId: address.userId,
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type,
      isDefault: address.isDefault
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    deleteAddress(addressId);
    if (selectedAddressId === addressId) {
      setSelectedAddressId('');
    }
  };

  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleDirectOrder();
    }
  };

  const handleRazorpayPayment = async () => {
    // Check if address is selected before opening Razorpay
    if (!selectedAddressId || !selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a shipping address before proceeding with payment.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal * 100, // Razorpay expects amount in paise
          currency: 'INR',
          userId: user!.id,
          cartItems: cartItems,
          shippingAddress: selectedAddress
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_UxXBzl98ySixq7',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Saree Store',
        description: 'Payment for Saree Order',
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user!.id,
                cartItems: cartItems,
                shippingAddress: selectedAddress
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyResponse.json();
            
            toast({
              title: "Payment Successful!",
              description: "Your order has been placed successfully.",
            });
            
            setLocation('/orders');
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if money was deducted.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: selectedAddress?.name || '',
          email: user?.email || '',
          contact: selectedAddress?.phone || '',
        },
        theme: {
          color: '#F59E0B', // Golden color
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can retry payment anytime.",
              variant: "destructive"
            });
          }
        }
      };

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        };
        document.body.appendChild(script);
      } else {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectOrder = async () => {
    // Check if address is selected before placing order
    if (!selectedAddressId || !selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a shipping address before placing your order.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create order directly (for COD, etc.)
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user!.id,
          total: finalTotal.toString(),
          shippingCost: shippingCost.toString(),
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
          status: 'pending',
          shippingAddress: selectedAddress,
          items: cartItems.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

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
                  <CardTitle className="flex items-center justify-between text-charcoal">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Shipping Address
                    </div>
                    <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingAddress(null);
                            setNewAddress({
                              userId: user?.id || '',
                              name: user?.username || '',
                              phone: user?.phone || '',
                              addressLine1: '',
                              addressLine2: '',
                              city: '',
                              state: '',
                              pincode: '',
                              type: 'home',
                              isDefault: false
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Address
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    {/* Address Selection */}
                    <div className="space-y-3">
                      {addresses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No saved addresses found.</p>
                          <p className="text-sm">Add a new address to continue.</p>
                        </div>
                      ) : (
                        <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                          {addresses.map((address) => (
                            <div key={address._id} className="border rounded-lg p-4 hover:border-golden transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <RadioGroupItem value={address._id} id={address._id} className="mt-1" />
                                  <div className="flex-1">
                                    <Label htmlFor={address._id} className="cursor-pointer">
                                      <div className="font-medium text-charcoal">{address.name}</div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {address.city}, {address.state} - {address.pincode}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Phone: {address.phone}
                                      </div>
                                      {address.isDefault && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-golden text-charcoal rounded">
                                          Default
                                        </span>
                                      )}
                                    </Label>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditAddress(address)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAddress(address._id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-golden hover:bg-yellow-600 text-charcoal"
                        disabled={!selectedAddressId}
                      >
                        Continue to Payment
                      </Button>
                    </div>
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
                      {/* Razorpay Payment */}
                      <div className="border rounded-lg p-4 border-golden bg-golden/5">
                        <div className="flex items-center space-x-2 mb-3">
                          <RadioGroupItem value="razorpay" id="razorpay" />
                          <Label htmlFor="razorpay" className="font-medium flex items-center">
                            <Wallet className="h-4 w-4 mr-2" />
                            Secure Online Payment (Recommended)
                          </Label>
                        </div>
                        {paymentMethod === 'razorpay' && (
                          <div className="mt-3 p-3 bg-white rounded-md">
                            <p className="text-sm text-gray-600 mb-2">
                              Pay securely using UPI, Net Banking, Credit/Debit Cards, or Wallets
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>✓ 256-bit SSL Encryption</span>
                              <span>✓ PCI DSS Compliant</span>
                              <span>✓ Instant Payment</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cash on Delivery */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="font-medium">Cash on Delivery</Label>
                        </div>
                        {paymentMethod === 'cod' && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">
                              Pay when your order is delivered. Additional ₹40 COD charges apply.
                            </p>
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
                      <p className="font-medium">{selectedAddress?.name}</p>
                      <p>{selectedAddress?.addressLine1}</p>
                      {selectedAddress?.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                      <p>{selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.pincode}</p>
                      <p>{selectedAddress?.phone}</p>
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

      {/* Address Modal */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modal-name">Full Name *</Label>
              <Input
                id="modal-name"
                value={newAddress.name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full Name"
              />
            </div>
            <div>
              <Label htmlFor="modal-phone">Phone *</Label>
              <Input
                id="modal-phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="modal-address1">Address Line 1 *</Label>
            <Input
              id="modal-address1"
              value={newAddress.addressLine1}
              onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
              placeholder="House No, Building, Street"
            />
          </div>

          <div>
            <Label htmlFor="modal-address2">Address Line 2</Label>
            <Input
              id="modal-address2"
              value={newAddress.addressLine2}
              onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
              placeholder="Landmark, Area"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="modal-city">City *</Label>
              <Input
                id="modal-city"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="modal-state">State *</Label>
              <Input
                id="modal-state"
                value={newAddress.state}
                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="modal-pincode">Pincode *</Label>
              <Input
                id="modal-pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="Pincode"
              />
            </div>
          </div>

          <div>
            <Label>Address Type</Label>
            <Select value={newAddress.type} onValueChange={(value) => setNewAddress(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="default-address"
              checked={newAddress.isDefault}
              onCheckedChange={(checked) => setNewAddress(prev => ({ ...prev, isDefault: checked as boolean }))}
            />
            <Label htmlFor="default-address">Set as default address</Label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-golden hover:bg-yellow-600 text-charcoal"
              onClick={handleSaveAddress}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Saving...' : 'Save Address'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </div>
  );
}
