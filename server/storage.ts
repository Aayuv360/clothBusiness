import { 
  users, categories, products, addresses, cart, wishlist, orders, orderItems, reviews,
  type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct,
  type Address, type InsertAddress, type CartItem, type InsertCartItem, type WishlistItem, type InsertWishlistItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Review, type InsertReview
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: { categoryId?: number; minPrice?: number; maxPrice?: number; fabric?: string; color?: string; search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;

  // Addresses
  getUserAddresses(userId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<boolean>;

  // Cart
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;

  // Wishlist
  getWishlistItems(userId: number): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number): Promise<boolean>;
  isInWishlist(userId: number, productId: number): Promise<boolean>;

  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Reviews
  getProductReviews(productId: number): Promise<(Review & { user: Pick<User, 'username'> })[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private addresses: Map<number, Address> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private wishlistItems: Map<number, WishlistItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private reviews: Map<number, Review> = new Map();
  
  private userIdCounter = 1;
  private categoryIdCounter = 1;
  private productIdCounter = 1;
  private addressIdCounter = 1;
  private cartIdCounter = 1;
  private wishlistIdCounter = 1;
  private orderIdCounter = 1;
  private orderItemIdCounter = 1;
  private reviewIdCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoriesData = [
      { name: "Silk Sarees", slug: "silk-sarees", description: "Luxurious silk sarees", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c" },
      { name: "Cotton Sarees", slug: "cotton-sarees", description: "Comfortable cotton sarees", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2" },
      { name: "Banarasi Sarees", slug: "banarasi-sarees", description: "Traditional Banarasi sarees", image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c" },
      { name: "Wedding Sarees", slug: "wedding-sarees", description: "Elegant wedding sarees", image: "https://images.unsplash.com/photo-1594736797933-d0ca71113b62" }
    ];

    categoriesData.forEach(cat => {
      const category: Category = { ...cat, id: this.categoryIdCounter++ };
      this.categories.set(category.id, category);
    });

    // Seed products
    const productsData = [
      {
        name: "Royal Red Silk Saree",
        description: "Exquisite red silk saree with intricate golden zari work and traditional motifs. Perfect for weddings and special occasions.",
        price: "8999",
        originalPrice: "12999",
        categoryId: 1,
        fabric: "Pure Silk",
        color: "Red",
        occasion: "Wedding, Festival",
        brand: "Royal Collection",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
          "https://images.unsplash.com/photo-1583391733956-6c78276477e2",
          "https://images.unsplash.com/photo-1571115764595-644a1f56a55c"
        ],
        inStock: 15,
        rating: "4.8",
        reviewCount: 24
      },
      {
        name: "Blue Floral Cotton Saree",
        description: "Beautiful blue cotton saree with elegant floral prints. Comfortable for daily wear and casual occasions.",
        price: "2499",
        originalPrice: "3999",
        categoryId: 2,
        fabric: "Cotton",
        color: "Blue",
        occasion: "Casual, Office",
        brand: "Cotton Craft",
        images: [
          "https://images.unsplash.com/photo-1583391733956-6c78276477e2",
          "https://images.unsplash.com/photo-1571115764595-644a1f56a55c"
        ],
        inStock: 25,
        rating: "4.5",
        reviewCount: 18
      },
      {
        name: "Golden Banarasi Silk",
        description: "Luxurious golden Banarasi saree with intricate brocade work. A timeless piece for special occasions.",
        price: "15999",
        originalPrice: "22999",
        categoryId: 3,
        fabric: "Banarasi Silk",
        color: "Golden",
        occasion: "Wedding, Festival",
        brand: "Banarasi Heritage",
        images: [
          "https://images.unsplash.com/photo-1571115764595-644a1f56a55c",
          "https://images.unsplash.com/photo-1594736797933-d0ca71113b62"
        ],
        inStock: 8,
        rating: "4.9",
        reviewCount: 31
      },
      {
        name: "Emerald Party Wear",
        description: "Stunning green chiffon saree with elegant embellishments. Perfect for parties and special events.",
        price: "5999",
        originalPrice: "8999",
        categoryId: 4,
        fabric: "Chiffon",
        color: "Green",
        occasion: "Party, Evening",
        brand: "Designer Collection",
        images: [
          "https://images.unsplash.com/photo-1594736797933-d0ca71113b62",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c"
        ],
        inStock: 12,
        rating: "4.6",
        reviewCount: 15
      }
    ];

    productsData.forEach(prod => {
      const product: Product = { 
        ...prod, 
        id: this.productIdCounter++,
        isActive: true,
        createdAt: new Date()
      };
      this.products.set(product.id, product);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.userIdCounter++,
      isVerified: false,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = { ...insertCategory, id: this.categoryIdCounter++ };
    this.categories.set(category.id, category);
    return category;
  }

  // Products
  async getProducts(filters?: any): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(p => p.isActive);
    
    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters?.minPrice) {
      products = products.filter(p => parseFloat(p.price) >= filters.minPrice);
    }
    if (filters?.maxPrice) {
      products = products.filter(p => parseFloat(p.price) <= filters.maxPrice);
    }
    if (filters?.fabric) {
      products = products.filter(p => p.fabric.toLowerCase().includes(filters.fabric.toLowerCase()));
    }
    if (filters?.color) {
      products = products.filter(p => p.color.toLowerCase().includes(filters.color.toLowerCase()));
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search) ||
        p.fabric.toLowerCase().includes(search)
      );
    }
    
    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.categoryId === categoryId && p.isActive);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive).slice(0, 8);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.isActive && (
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.fabric.toLowerCase().includes(searchTerm)
      )
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      ...insertProduct,
      id: this.productIdCounter++,
      isActive: true,
      createdAt: new Date()
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Addresses
  async getUserAddresses(userId: number): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(addr => addr.userId === userId);
  }

  async getAddress(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const address: Address = { ...insertAddress, id: this.addressIdCounter++ };
    this.addresses.set(address.id, address);
    return address;
  }

  async updateAddress(id: number, addressData: Partial<InsertAddress>): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address) return undefined;
    const updatedAddress = { ...address, ...addressData };
    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<boolean> {
    return this.addresses.delete(id);
  }

  // Cart
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const userCartItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    return userCartItems.map(item => ({
      ...item,
      product: this.products.get(item.productId)!
    })).filter(item => item.product);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + (insertCartItem.quantity || 1);
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }
    
    const cartItem: CartItem = {
      ...insertCartItem,
      id: this.cartIdCounter++,
      createdAt: new Date()
    };
    this.cartItems.set(cartItem.id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    item.quantity = quantity;
    this.cartItems.set(id, item);
    return item;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(([_, item]) => item.userId === userId);
    userItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  // Wishlist
  async getWishlistItems(userId: number): Promise<(WishlistItem & { product: Product })[]> {
    const userWishlistItems = Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
    return userWishlistItems.map(item => ({
      ...item,
      product: this.products.get(item.productId)!
    })).filter(item => item.product);
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    const wishlistItem: WishlistItem = {
      ...insertWishlistItem,
      id: this.wishlistIdCounter++,
      createdAt: new Date()
    };
    this.wishlistItems.set(wishlistItem.id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(id: number): Promise<boolean> {
    return this.wishlistItems.delete(id);
  }

  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    return Array.from(this.wishlistItems.values()).some(
      item => item.userId === userId && item.productId === productId
    );
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId)!
      }))
      .filter(item => item.product);
    
    return { ...order, items };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const order: Order = {
      ...insertOrder,
      id: this.orderIdCounter++,
      createdAt: new Date()
    };
    this.orders.set(order.id, order);
    
    items.forEach(insertItem => {
      const orderItem: OrderItem = {
        ...insertItem,
        id: this.orderItemIdCounter++,
        orderId: order.id
      };
      this.orderItems.set(orderItem.id, orderItem);
    });
    
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    order.status = status;
    this.orders.set(id, order);
    return order;
  }

  // Reviews
  async getProductReviews(productId: number): Promise<(Review & { user: Pick<User, 'username'> })[]> {
    const productReviews = Array.from(this.reviews.values()).filter(review => review.productId === productId);
    return productReviews.map(review => ({
      ...review,
      user: { username: this.users.get(review.userId)?.username || 'Anonymous' }
    }));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      ...insertReview,
      id: this.reviewIdCounter++,
      createdAt: new Date()
    };
    this.reviews.set(review.id, review);
    return review;
  }
}

export const storage = new MemStorage();
