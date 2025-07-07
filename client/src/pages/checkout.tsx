import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useAddress } from "@/hooks/use-address";
import { useToast } from "@/hooks/use-toast";
import { animatePageEntry } from "@/lib/animations";
import type { Address, InsertAddress } from "@shared/schema";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const {
    addresses,
    createAddress,
    updateAddress,
    deleteAddress,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAddress();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [newAddress, setNewAddress] = useState<InsertAddress>({
    userId: user?.id || "",
    name: user?.username || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    type: "home",
    isDefault: false,
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    if (pageRef.current) {
      animatePageEntry(pageRef.current);
    }
  }, [user, cartItems.length, navigate]);

  const shippingCost = cartTotal >= 999 ? 0 : 99;
  const taxAmount = Math.round(cartTotal * 0.05);
  const finalTotal = cartTotal + shippingCost + taxAmount;

  const handleSaveAddress = () => {
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.addressLine1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingAddress) {
      updateAddress(editingAddress?.id, newAddress);
    } else {
      createAddress(newAddress);
    }

    setIsAddressModalOpen(false);
    setEditingAddress(null);
    setNewAddress({
      userId: user?.id || "",
      name: user?.username || "",
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      type: "home",
      isDefault: false,
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      userId: address.userId,
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type,
      isDefault: address.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    deleteAddress(addressId);
    if (selectedAddressId === addressId) {
      setSelectedAddressId("");
    }
  };

  const selectedAddress = addresses?.find(
    (addr: any) => addr.id === selectedAddressId,
  );

  const handlePlaceOrder = async () => {
    handleRazorpayPayment();
  };

  const handleRazorpayPayment = async () => {
    if (!selectedAddressId || !selectedAddress) {
      toast({
        title: "Address Required",
        description:
          "Please select a shipping address before proceeding with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalTotal * 100,
          currency: "INR",
          userId: user!.id,
          cartItems: cartItems,
          shippingAddress: selectedAddress,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEYid || "rzp_test_UxXBzl98ySixq7",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Saree Store",
        description: "Payment for Saree Order",
        orderid: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_orderid: response.razorpay_orderid,
                razorpay_paymentid: response.razorpay_paymentid,
                razorpay_signature: response.razorpay_signature,
                userId: user!.id,
                cartItems: cartItems,
                shippingAddress: selectedAddress,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyResponse.json();

            toast({
              title: "Payment Successful!",
              description: "Your order has been placed successfully.",
            });

            navigate("/orders");
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if money was deducted.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: selectedAddress?.name || "",
          email: user?.email || "",
          contact: selectedAddress?.phone || "",
        },
        theme: {
          color: "#F59E0B", // Golden color
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can retry payment anytime.",
              variant: "destructive",
            });
          },
        },
      };

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
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
        variant: "destructive",
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
        description:
          "Please select a shipping address before placing your order.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user!.id,
          total: finalTotal.toString(),
          shippingCost: shippingCost.toString(),
          paymentMethod: "razorpay",
          paymentStatus: "completed",
          status: "pending",
          shippingAddress: selectedAddress,
          items: cartItems.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      toast({
        title: "Order Placed Successfully!",
        description:
          "Your order has been confirmed. You will receive a confirmation email shortly.",
      });

      navigate("/orders");
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  console.log(user);
  if (!user || cartItems.length === 0) {
    return null;
  }
  console.log("selectedAddressId", selectedAddressId);
  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/cart")}
                className="text-charcoal hover:text-golden"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
              <h1 className="text-3xl font-bold text-charcoal">Checkout</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-golden">
                ₹{finalTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-charcoal">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </div>
                  <Dialog
                    open={isAddressModalOpen}
                    onOpenChange={setIsAddressModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAddress(null);
                          setNewAddress({
                            userId: user?.id || "",
                            name: user?.username || "",
                            phone: user?.phone || "",
                            addressLine1: "",
                            addressLine2: "",
                            city: "",
                            state: "",
                            pincode: "",
                            type: "home",
                            isDefault: false,
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
                <form className="space-y-4">
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No saved addresses found.</p>
                        <p className="text-sm">
                          Add a new address to continue.
                        </p>
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedAddressId}
                        onValueChange={setSelectedAddressId}
                      >
                        {addresses.map((address: any) => (
                          <div
                            key={address.id}
                            className="border rounded-lg p-4 hover:border-golden transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <RadioGroupItem
                                  value={address.id}
                                  id={address.id}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor={address.id}
                                    className="cursor-pointer"
                                  >
                                    <div className="font-medium text-charcoal">
                                      {address.name}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {address.addressLine1}
                                      {address.addressLine2 &&
                                        `, ${address.addressLine2}`}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {address.city}, {address.state} -{" "}
                                      {address.pincode}
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
                                  onClick={() =>
                                    handleDeleteAddress(address.id)
                                  }
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
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full bg-golden hover:bg-yellow-600 text-charcoal"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
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
                  {cartItems.map((item: any) => (
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
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        ₹
                        {(
                          parseFloat(item.product.price) * item.quantity
                        ).toLocaleString()}
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
                    <span
                      className={shippingCost === 0 ? "text-green-600" : ""}
                    >
                      {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-golden">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modal-name">Full Name *</Label>
                <Input
                  id="modal-name"
                  value={newAddress.name}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label htmlFor="modal-phone">Phone *</Label>
                <Input
                  id="modal-phone"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="modal-address1">Address Line 1 *</Label>
              <Input
                id="modal-address1"
                value={newAddress.addressLine1}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    addressLine1: e.target.value,
                  }))
                }
                placeholder="House No, Building, Street"
              />
            </div>

            <div>
              <Label htmlFor="modal-address2">Address Line 2</Label>
              <Input
                id="modal-address2"
                value={newAddress.addressLine2}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    addressLine2: e.target.value,
                  }))
                }
                placeholder="Landmark, Area"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="modal-city">City *</Label>
                <Input
                  id="modal-city"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="modal-state">State *</Label>
                <Input
                  id="modal-state"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="modal-pincode">Pincode *</Label>
                <Input
                  id="modal-pincode"
                  value={newAddress.pincode}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                  placeholder="Pincode"
                />
              </div>
            </div>

            <div>
              <Label>Address Type</Label>
              <Select
                value={newAddress.type}
                onValueChange={(value) =>
                  setNewAddress((prev) => ({ ...prev, type: value }))
                }
              >
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
                onCheckedChange={(checked) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    isDefault: checked as boolean,
                  }))
                }
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
                {isCreating || isUpdating ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
