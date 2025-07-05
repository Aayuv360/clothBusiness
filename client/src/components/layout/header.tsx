import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import CartSidebar from '@/components/cart/cart-sidebar';
import AuthModal from '@/components/auth/auth-modal';
import { animateSearch } from '@/lib/animations';

export default function Header() {
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { cartCount, openCart } = useCart();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Silk Sarees', href: '/products/silk-sarees' },
    { name: 'Cotton Sarees', href: '/products/cotton-sarees' },
    { name: 'Banarasi', href: '/products/banarasi-sarees' },
    { name: 'Wedding', href: '/products/wedding-sarees' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      const searchInput = document.querySelector('.search-input') as HTMLElement;
      if (searchInput) {
        animateSearch(searchInput);
      }
    }
  }, [isSearchOpen]);

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-deep-red">SareeMart</h1>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-8">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <a className={`px-3 py-2 text-sm font-medium transition-colors hover:text-golden ${
                        location === item.href ? 'text-golden' : 'text-charcoal'
                      }`}>
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
              </nav>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search */}
              <div className="hidden md:block relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="search-input">
                    <Input
                      type="text"
                      placeholder="Search sarees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                      autoFocus
                      onBlur={() => !searchQuery && setIsSearchOpen(false)}
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    className="text-charcoal hover:text-golden"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="text-charcoal hover:text-golden relative"
                onClick={() => setLocation('/wishlist')}
              >
                <Heart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 bg-deep-red text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  0
                </Badge>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="text-charcoal hover:text-golden relative"
                onClick={openCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-deep-red text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Account */}
              <Button
                variant="ghost"
                size="sm"
                className="text-charcoal hover:text-golden"
                onClick={() => {
                  if (isAuthenticated) {
                    setLocation('/orders');
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden text-charcoal">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch}>
                      <Input
                        type="text"
                        placeholder="Search sarees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </form>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-4">
                      {navigation.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <a className="text-lg font-medium text-charcoal hover:text-golden transition-colors">
                            {item.name}
                          </a>
                        </Link>
                      ))}
                    </nav>

                    {/* User Actions */}
                    <div className="flex flex-col space-y-4 pt-6 border-t">
                      {isAuthenticated ? (
                        <>
                          <p className="text-sm text-gray-600">Welcome, {user?.username}!</p>
                          <Link href="/orders">
                            <a className="text-charcoal hover:text-golden">My Orders</a>
                          </Link>
                          <Link href="/wishlist">
                            <a className="text-charcoal hover:text-golden">Wishlist</a>
                          </Link>
                        </>
                      ) : (
                        <Button onClick={() => setIsAuthModalOpen(true)} className="bg-golden hover:bg-yellow-600 text-charcoal">
                          Sign In / Register
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
