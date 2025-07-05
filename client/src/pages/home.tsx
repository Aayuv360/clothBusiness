import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Crown, Heart, Star, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/product-card';
import ProductModal from '@/components/product/product-modal';
import { animateHero, animateProductCards } from '@/lib/animations';
import { useState } from 'react';
import type { Product, Category } from '@shared/schema';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  useEffect(() => {
    if (heroRef.current) {
      animateHero();
    }
  }, []);

  useEffect(() => {
    if (productsRef.current && featuredProducts.length > 0) {
      const productCards = document.querySelectorAll('.product-card');
      animateProductCards(productCards);
    }
  }, [featuredProducts]);

  const benefits = [
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Premium Quality",
      description: "Hand-picked sarees from master weavers across India"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Authentic Designs",
      description: "Traditional patterns with contemporary styling"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Customer Love",
      description: "Trusted by 50,000+ happy customers nationwide"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-[500px] md:h-[700px] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="hero-title text-4xl md:text-6xl font-bold mb-6 opacity-0 transform translate-y-8">
            Exquisite Saree Collection
          </h1>
          <p className="hero-subtitle text-lg md:text-xl mb-8 opacity-0 transform translate-y-8 max-w-2xl mx-auto">
            Discover timeless elegance with our curated selection of traditional and designer sarees from master craftsmen across India
          </p>
          <div className="hero-buttons space-x-4 opacity-0 transform translate-y-8">
            <Link href="/products">
              <Button size="lg" className="bg-golden hover:bg-yellow-600 text-charcoal px-8 py-3 font-semibold transition-all transform hover:scale-105">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products?category=wedding-sarees">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-charcoal px-8 py-3 font-semibold transition-all">
                Wedding Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-warm-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-golden rounded-full p-4 text-charcoal">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Shop by Category</h2>
            <p className="text-gray-600 text-lg">Explore our diverse range of traditional and modern sarees</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category: Category) => (
              <Link key={category.id} href={`/products/${category.slug}`}>
                <Card className="category-card group cursor-pointer overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="relative">
                    <img
                      src={category.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c"}
                      alt={category.name}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90">Explore Collection</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section ref={productsRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Featured Collection</h2>
            <p className="text-gray-600 text-lg">Handpicked sarees from our premium collection</p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-80 shimmer" />
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="bg-charcoal hover:bg-gray-800 text-white px-8 py-3 font-semibold transition-all transform hover:scale-105">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">
            Subscribe to our newsletter for exclusive offers, new arrivals, and styling tips
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-charcoal border-0 focus:ring-2 focus:ring-golden"
            />
            <Button type="submit" className="bg-golden hover:bg-yellow-600 text-charcoal px-6 py-3 font-semibold">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Customer Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Need Help?</h2>
            <p className="text-gray-600 text-lg">Our customer support team is here to assist you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="bg-golden rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-charcoal" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
                <Button className="bg-golden hover:bg-yellow-600 text-charcoal">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Get instant support on WhatsApp</p>
                <Button 
                  onClick={() => window.open('https://wa.me/1234567890', '_blank')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Message Us
                </Button>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Speak directly with our experts</p>
                <Button 
                  onClick={() => window.open('tel:+911234567890', '_self')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
