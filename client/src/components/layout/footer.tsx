import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Instagram, Twitter, MessageCircle, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
          onClick={() => window.open('https://wa.me/1234567890', '_blank')}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <Button
          onClick={scrollToTop}
          className="bg-golden hover:bg-yellow-600 text-charcoal rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-golden">SareeMart</h3>
              <p className="text-gray-300 mb-4">
                Your destination for authentic and beautiful sarees from across India.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-golden p-2">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-golden p-2">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-golden p-2">
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-golden transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/size-guide" className="text-gray-300 hover:text-golden transition-colors">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link to="/care" className="text-gray-300 hover:text-golden transition-colors">
                    Care Instructions
                  </Link>
                </li>
                <li>
                  <Link to="/bulk-orders" className="text-gray-300 hover:text-golden transition-colors">
                    Bulk Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-golden transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-gray-300 hover:text-golden transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-gray-300 hover:text-golden transition-colors">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="text-gray-300 hover:text-golden transition-colors">
                    Track Your Order
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-300 mb-4">
                Subscribe for exclusive offers and new arrivals
              </p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <Button 
                  type="submit"
                  className="ml-2 bg-golden hover:bg-yellow-600 text-charcoal font-semibold"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              &copy; 2024 SareeMart. All rights reserved. |{' '}
              <Link to="/privacy" className="hover:text-golden">
                Privacy Policy
              </Link>{' '}
              |{' '}
              <Link to="/terms" className="hover:text-golden">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
