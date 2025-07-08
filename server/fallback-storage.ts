import type { IStorage } from './mongodb';
import type {
  User as UserType,
  Category as CategoryType,
  Product as ProductType,
  Address as AddressType,
  CartItem as CartItemType,
  WishlistItem as WishlistItemType,
  Order as OrderType,
  OrderItem as OrderItemType,
  Review as ReviewType,
  InsertUser, InsertCategory, InsertProduct, InsertAddress, 
  InsertCartItem, InsertWishlistItem, InsertOrder, InsertOrderItem, InsertReview
} from '@shared/schema';

export class FallbackStorage implements IStorage {
  private users: UserType[] = [];
  private categories: CategoryType[] = [];
  private products: ProductType[] = [];
  private addresses: AddressType[] = [];
  private cartItems: CartItemType[] = [];
  private wishlistItems: WishlistItemType[] = [];
  private orders: OrderType[] = [];
  private orderItems: OrderItemType[] = [];
  private reviews: ReviewType[] = [];
  private nextId = 1;

  constructor() {
    this.seedData();
  }

  private generateId(): string {
    return (this.nextId++).toString();
  }

  private seedData() {
    // Seed categories
    const categories = [
      { _id: this.generateId(), name: "Silk Sarees", slug: "silk", description: "Luxurious silk sarees for special occasions", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
      { _id: this.generateId(), name: "Cotton Sarees", slug: "cotton", description: "Comfortable cotton sarees for daily wear", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400" },
      { _id: this.generateId(), name: "Banarasi Sarees", slug: "banarasi", description: "Traditional Banarasi sarees with intricate designs", image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400" },
      { _id: this.generateId(), name: "Designer Sarees", slug: "designer", description: "Contemporary designer sarees", image: "https://images.unsplash.com/photo-1583391733982-5c7b8b5e2e1a?w=400" }
    ];

    this.categories = categories.map(cat => ({
      id: cat._id,
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image
    }));

    // Seed products
    const products = [
      {
        _id: this.generateId(),
        name: "Royal Blue Silk Saree",
        description: "Elegant royal blue silk saree with golden border",
        price: "12999",
        originalPrice: "15999",
        categoryId: this.categories[0].id,
        fabric: "Pure Silk",
        color: "Royal Blue",
        length: "6.3 meters",
        blouseLength: "0.8 meters",
        occasion: "Wedding",
        brand: "Heritage",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
          "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800"
        ],
        inStock: 5,
        rating: "4.8",
        reviewCount: 124,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: this.generateId(),
        name: "Traditional Red Cotton Saree",
        description: "Classic red cotton saree perfect for festivals",
        price: "2999",
        originalPrice: "3999",
        categoryId: this.categories[1].id,
        fabric: "Cotton",
        color: "Red",
        length: "6.3 meters",
        blouseLength: "0.8 meters",
        occasion: "Festival",
        brand: "Traditional",
        images: [
          "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"
        ],
        inStock: 12,
        rating: "4.5",
        reviewCount: 89,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: this.generateId(),
        name: "Golden Banarasi Saree",
        description: "Luxurious golden Banarasi saree with intricate zari work",
        price: "18999",
        originalPrice: "22999",
        categoryId: this.categories[2].id,
        fabric: "Banarasi Silk",
        color: "Golden",
        length: "6.3 meters",
        blouseLength: "0.8 meters",
        occasion: "Wedding",
        brand: "Banarasi Heritage",
        images: [
          "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800",
          "https://images.unsplash.com/photo-1583391733982-5c7b8b5e2e1a?w=800"
        ],
        inStock: 3,
        rating: "4.9",
        reviewCount: 156,
        isActive: true,
        createdAt: new Date()
      }
    ];

    this.products = products.map(prod => ({
      id: prod._id,
      _id: prod._id,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      originalPrice: prod.originalPrice,
      categoryId: prod.categoryId,
      fabric: prod.fabric,
      color: prod.color,
      length: prod.length,
      blouseLength: prod.blouseLength,
      occasion: prod.occasion,
      brand: prod.brand,
      images: prod.images,
      inStock: prod.inStock,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
      isActive: prod.isActive,
      createdAt: prod.createdAt
    }));

    console.log('Fallback storage initialized with sample data');
  }

  // User methods
  async getUser(id: string): Promise<UserType | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(userData: InsertUser): Promise<UserType> {
    const user: UserType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...userData,
      isVerified: false,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<UserType | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index >= 0) {
      this.users[index] = { ...this.users[index], ...userData };
      return this.users[index];
    }
    return undefined;
  }

  // Category methods
  async getCategories(): Promise<CategoryType[]> {
    return this.categories;
  }

  async getCategory(id: string): Promise<CategoryType | undefined> {
    return this.categories.find(c => c.id === id);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryType | undefined> {
    return this.categories.find(c => c.slug === slug);
  }

  async createCategory(categoryData: InsertCategory): Promise<CategoryType> {
    const category: CategoryType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...categoryData
    };
    this.categories.push(category);
    return category;
  }

  // Product methods
  async getProducts(filters?: any): Promise<ProductType[]> {
    let filtered = this.products.filter(p => p.isActive);
    
    if (filters?.categoryId) {
      filtered = filtered.filter(p => p.category === filters.categoryId);
    }
    if (filters?.categorySlug) {
      // Find category by slug and filter by category name
      const category = this.categories.find(c => c.slug === filters.categorySlug);
      if (category) {
        filtered = filtered.filter(p => p.category === category.name);
      }
    }
    if (filters?.minPrice) {
      filtered = filtered.filter(p => parseFloat(p.price) >= filters.minPrice);
    }
    if (filters?.maxPrice) {
      filtered = filtered.filter(p => parseFloat(p.price) <= filters.maxPrice);
    }
    if (filters?.fabric) {
      filtered = filtered.filter(p => p.fabric.toLowerCase().includes(filters.fabric.toLowerCase()));
    }
    if (filters?.color) {
      filtered = filtered.filter(p => p.color.toLowerCase().includes(filters.color.toLowerCase()));
    }
    if (filters?.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.sku.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters?.inStockOnly) {
      filtered = filtered.filter(p => p.stockQuantity > 0);
    }
    
    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price-high':
          filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
        default:
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }
    
    return filtered;
  }

  async getProduct(id: string): Promise<ProductType | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getProductsByCategory(categoryId: string): Promise<ProductType[]> {
    return this.products.filter(p => p.categoryId === categoryId);
  }

  async getFeaturedProducts(): Promise<ProductType[]> {
    return this.products.slice(0, 3); // Return first 3 products as featured
  }

  async searchProducts(query: string): Promise<ProductType[]> {
    return this.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async createProduct(productData: InsertProduct): Promise<ProductType> {
    const product: ProductType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...productData,
      isActive: true,
      createdAt: new Date()
    };
    this.products.push(product);
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<ProductType | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index >= 0) {
      this.products[index] = { ...this.products[index], ...productData };
      return this.products[index];
    }
    return undefined;
  }

  // Address methods
  async getUserAddresses(userId: string): Promise<AddressType[]> {
    return this.addresses.filter(a => a.userId === userId);
  }

  async getAddress(id: string): Promise<AddressType | undefined> {
    return this.addresses.find(a => a.id === id);
  }

  async createAddress(addressData: InsertAddress): Promise<AddressType> {
    const address: AddressType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...addressData
    };
    this.addresses.push(address);
    return address;
  }

  async updateAddress(id: string, addressData: Partial<InsertAddress>): Promise<AddressType | undefined> {
    const index = this.addresses.findIndex(a => a.id === id);
    if (index >= 0) {
      this.addresses[index] = { ...this.addresses[index], ...addressData };
      return this.addresses[index];
    }
    return undefined;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const index = this.addresses.findIndex(a => a.id === id);
    if (index >= 0) {
      this.addresses.splice(index, 1);
      return true;
    }
    return false;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<(CartItemType & { product: ProductType })[]> {
    return this.cartItems
      .filter(c => c.userId === userId)
      .map(item => ({
        ...item,
        product: this.products.find(p => p.id === item.productId)!
      }))
      .filter(item => item.product);
  }

  async addToCart(cartData: InsertCartItem): Promise<CartItemType> {
    const cartItem: CartItemType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...cartData,
      createdAt: new Date()
    };
    this.cartItems.push(cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItemType | undefined> {
    const index = this.cartItems.findIndex(c => c.id === id);
    if (index >= 0) {
      this.cartItems[index].quantity = quantity;
      return this.cartItems[index];
    }
    return undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const index = this.cartItems.findIndex(c => c.id === id);
    if (index >= 0) {
      this.cartItems.splice(index, 1);
      return true;
    }
    return false;
  }

  async clearCart(userId: string): Promise<boolean> {
    this.cartItems = this.cartItems.filter(c => c.userId !== userId);
    return true;
  }

  // Wishlist methods
  async getWishlistItems(userId: string): Promise<(WishlistItemType & { product: ProductType })[]> {
    return this.wishlistItems
      .filter(w => w.userId === userId)
      .map(item => ({
        ...item,
        product: this.products.find(p => p.id === item.productId)!
      }))
      .filter(item => item.product);
  }

  async addToWishlist(wishlistData: InsertWishlistItem): Promise<WishlistItemType> {
    const wishlistItem: WishlistItemType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...wishlistData,
      createdAt: new Date()
    };
    this.wishlistItems.push(wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(id: string): Promise<boolean> {
    const index = this.wishlistItems.findIndex(w => w.id === id);
    if (index >= 0) {
      this.wishlistItems.splice(index, 1);
      return true;
    }
    return false;
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    return this.wishlistItems.some(w => w.userId === userId && w.productId === productId);
  }

  // Order methods
  async getOrders(userId: string): Promise<OrderType[]> {
    return this.orders.filter(o => o.userId === userId);
  }

  async getOrder(id: string): Promise<(OrderType & { items: (OrderItemType & { product: ProductType })[] }) | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (!order) return undefined;

    const items = this.orderItems
      .filter(oi => oi.orderId === id)
      .map(item => ({
        ...item,
        product: this.products.find(p => p.id === item.productId)!
      }))
      .filter(item => item.product);

    return { ...order, items };
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<OrderType> {
    const order: OrderType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...orderData,
      createdAt: new Date()
    };
    this.orders.push(order);

    // Add order items
    for (const itemData of items) {
      const orderItem: OrderItemType = {
        id: this.generateId(),
        _id: this.generateId(),
        orderId: order.id,
        ...itemData,
        createdAt: new Date()
      };
      this.orderItems.push(orderItem);
    }

    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderType | undefined> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index >= 0) {
      this.orders[index].status = status;
      return this.orders[index];
    }
    return undefined;
  }

  // Review methods
  async getProductReviews(productId: string): Promise<(ReviewType & { user: Pick<UserType, 'username'> })[]> {
    return this.reviews
      .filter(r => r.productId === productId)
      .map(review => ({
        ...review,
        user: { username: this.users.find(u => u.id === review.userId)?.username || 'Anonymous' }
      }));
  }

  async createReview(reviewData: InsertReview): Promise<ReviewType> {
    const review: ReviewType = {
      id: this.generateId(),
      _id: this.generateId(),
      ...reviewData,
      createdAt: new Date()
    };
    this.reviews.push(review);
    return review;
  }
}