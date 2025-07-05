import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import { Link } from 'wouter';

export default function CartSidebar() {
  const { 
    isOpen, 
    closeCart, 
    cartItems, 
    cartTotal, 
    cartCount,
    updateQuantity, 
    removeFromCart,
    isLoading 
  } = useCart();

  const shippingCost = cartTotal >= 999 ? 0 : 99;
  const finalTotal = cartTotal + shippingCost;

  if (isLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={closeCart}>
        <SheetContent side="right" className="w-96">
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-golden border-t-transparent rounded-full animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({cartCount})</span>
            <Button variant="ghost" size="sm" onClick={closeCart}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
            <Button 
              onClick={closeCart}
              className="bg-golden hover:bg-yellow-600 text-charcoal"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto py-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-4 border-b">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-charcoal text-sm line-clamp-2">
                      {item.product.name}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {item.product.fabric}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-charcoal">
                      ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 text-xs p-0 h-auto"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                    {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                  </span>
                </div>
                
                {cartTotal < 999 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping
                  </p>
                )}
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-golden">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link href="/checkout">
                  <Button 
                    className="w-full bg-golden hover:bg-yellow-600 text-charcoal font-semibold py-3"
                    onClick={closeCart}
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  onClick={closeCart}
                  className="w-full text-charcoal border-gray-300 hover:bg-gray-50"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
