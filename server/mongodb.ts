import mongoose from "mongoose";
import {
  User,
  Category,
  Product,
  Address,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
  Review,
  IUser,
  ICategory,
  IProduct,
  IAddress,
  ICartItem,
  IWishlistItem,
  IOrder,
  IOrderItem,
  IReview,
} from "../shared/models";
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
  InsertUser,
  InsertCategory,
  InsertProduct,
  InsertAddress,
  InsertCartItem,
  InsertWishlistItem,
  InsertOrder,
  InsertOrderItem,
  InsertReview,
} from "@shared/schema";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sathishreddyk0337:MmNdrMQ7lWp0I5m1@cluster0.fs4vkd7.mongodb.net/clothbusiness";

export async function connectDB() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("Continuing without database connection - using fallback");
    return; // Don't exit, continue with fallback
  }
}

// Helper function to convert MongoDB document to our interface format
function convertDoc<T>(doc: any): T {
  if (!doc) return doc;
  const converted = doc.toObject ? doc.toObject() : doc;

  // Ensure id is a string for consistency
  if (converted.id !== undefined) {
    converted.id = converted.id.toString();
  } else if (converted._id) {
    // Only fallback to _id if no custom id field exists
    converted.id = converted._id.toString();
  }

  // Clean up MongoDB internal fields
  delete converted._id;
  delete converted.__v;

  return converted;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<UserType | undefined>;
  getUserByEmail(email: string): Promise<UserType | undefined>;
  getUserByUsername(username: string): Promise<UserType | undefined>;
  createUser(user: InsertUser): Promise<UserType>;
  updateUser(
    id: string,
    user: Partial<InsertUser>,
  ): Promise<UserType | undefined>;

  // Categories
  getCategories(): Promise<CategoryType[]>;
  getCategory(id: string): Promise<CategoryType | undefined>;
  getCategoryBySlug(slug: string): Promise<CategoryType | undefined>;
  createCategory(category: InsertCategory): Promise<CategoryType>;

  // Products
  getProducts(filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    fabric?: string;
    color?: string;
    search?: string;
  }): Promise<ProductType[]>;
  getProduct(id: string): Promise<ProductType | undefined>;
  getProductsByCategory(categoryId: string): Promise<ProductType[]>;
  getFeaturedProducts(): Promise<ProductType[]>;
  searchProducts(query: string): Promise<ProductType[]>;
  createProduct(product: InsertProduct): Promise<ProductType>;
  updateProduct(
    id: string,
    product: Partial<InsertProduct>,
  ): Promise<ProductType | undefined>;

  // Addresses
  getUserAddresses(userId: string): Promise<AddressType[]>;
  getAddress(id: string): Promise<AddressType | undefined>;
  createAddress(address: InsertAddress): Promise<AddressType>;
  updateAddress(
    id: string,
    address: Partial<InsertAddress>,
  ): Promise<AddressType | undefined>;
  deleteAddress(id: string): Promise<boolean>;

  // Cart
  getCartItems(
    userId: string,
  ): Promise<(CartItemType & { product: ProductType })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItemType>;
  updateCartItem(
    id: string,
    quantity: number,
  ): Promise<CartItemType | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;

  // Wishlist
  getWishlistItems(
    userId: string,
  ): Promise<(WishlistItemType & { product: ProductType })[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItemType>;
  removeFromWishlist(id: string): Promise<boolean>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;

  // Orders
  getOrders(userId: string): Promise<OrderType[]>;
  getOrder(
    id: string,
  ): Promise<
    | (OrderType & { items: (OrderItemType & { product: ProductType })[] })
    | undefined
  >;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderType>;
  updateOrderStatus(id: string, status: string): Promise<OrderType | undefined>;

  // Reviews
  getProductReviews(
    productId: string,
  ): Promise<(ReviewType & { user: Pick<UserType, "username"> })[]>;
  createReview(review: InsertReview): Promise<ReviewType>;
}

export class MongoStorage implements IStorage {
  constructor() {
    // Don't seed immediately, wait for connection
    setTimeout(() => this.seedData(), 1000);
  }

  private async seedData() {
    try {
      // Check if we're connected to MongoDB
      if (mongoose.connection.readyState !== 1) {
        console.log("MongoDB not connected, skipping seed data");
        return;
      }

      // Check if data already exists
      const categoryCount = await Category.countDocuments();
      if (categoryCount > 0) return;

      // Seed categories
      const categories = [
        {
          name: "Silk Sarees",
          slug: "silk-sarees",
          description: "Luxurious silk sarees for special occasions",
          image:
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
        },
        {
          name: "Cotton Sarees",
          slug: "cotton-sarees",
          description: "Comfortable everyday cotton sarees",
          image:
            "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=500",
        },
        {
          name: "Designer Sarees",
          slug: "designer-sarees",
          description: "Trendy designer sarees",
          image:
            "https://images.unsplash.com/photo-1594736797933-d0401ba871ff?w=500",
        },
        {
          name: "Wedding Sarees",
          slug: "wedding-sarees",
          description: "Grand wedding collection",
          image:
            "https://images.unsplash.com/photo-1605481024394-39126949ebe4?w=500",
        },
        {
          name: "Banarasi Sarees",
          slug: "banarasi-sarees",
          description: "Traditional Banarasi weaves",
          image:
            "https://images.unsplash.com/photo-1588066892455-7b88c1dc9d6b?w=500",
        },
      ];

      const createdCategories = await Category.insertMany(categories);

      // Seed products with sm_products schema
      const products = [
        {
          name: "Royal Red Silk Saree",
          sku: "RSS001",
          description:
            "Exquisite red silk saree with golden border, perfect for weddings and special occasions.",
          category: "silk",
          price: "15999",
          costPrice: "12000",
          stockQuantity: 25,
          minStockLevel: 5,
          fabric: "Pure Silk",
          color: "Red",
          size: "L",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Red", "Maroon", "Burgundy"],
          images: [
            "https://images.unsplash.com/photo-1594736797933-d0401ba871ff?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1605481024394-39126949ebe4?w=800&h=600&fit=crop",
          ],
          imageUrl:
            "https://images.unsplash.com/photo-1594736797933-d0401ba871ff?w=800&h=600&fit=crop",
          isActive: true,
          id: 482481,
        },
        {
          name: "Elegant Blue Cotton Saree",
          sku: "BCS002",
          description:
            "Comfortable blue cotton saree with traditional prints, ideal for daily wear.",
          category: "cotton",
          price: "2499",
          costPrice: "1800",
          stockQuantity: 50,
          minStockLevel: 10,
          fabric: "Cotton",
          color: "Blue",
          size: "M",
          sizes: ["S", "M", "L"],
          colors: ["Blue", "Navy", "Sky Blue"],
          images: [
            "https://images.unsplash.com/photo-1588066892455-7b88c1dc9d6b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=800&h=600&fit=crop",
          ],
          imageUrl:
            "https://images.unsplash.com/photo-1588066892455-7b88c1dc9d6b?w=800&h=600&fit=crop",
          isActive: true,
          id: 482482,
        },
        {
          name: "Designer Golden Banarasi",
          sku: "DGB003",
          description:
            "Traditional Banarasi saree with intricate golden work, perfect for festivals.",
          category: "banarasi",
          price: "8999",
          costPrice: "6500",
          stockQuantity: 15,
          minStockLevel: 3,
          fabric: "Silk",
          color: "Golden",
          size: "L",
          sizes: ["M", "L", "XL"],
          colors: ["Golden", "Silver", "Bronze"],
          images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1594736797933-d0401ba871ff?w=800&h=600&fit=crop",
          ],
          imageUrl:
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop",
          isActive: true,
          id: 482483,
        },
      ];

      await Product.insertMany(products);
      console.log("MongoDB seeded with initial data");
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<UserType | undefined> {
    const user = await User.findById(id);
    return user ? convertDoc<UserType>(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    const user = await User.findOne({ email });
    return user ? convertDoc<UserType>(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    const user = await User.findOne({ username });
    return user ? convertDoc<UserType>(user) : undefined;
  }

  async createUser(userData: InsertUser): Promise<UserType> {
    const user = new User(userData);
    await user.save();
    return convertDoc<UserType>(user);
  }

  async updateUser(
    id: string,
    userData: Partial<InsertUser>,
  ): Promise<UserType | undefined> {
    const user = await User.findByIdAndUpdate(id, userData, { new: true });
    return user ? convertDoc<UserType>(user) : undefined;
  }

  // Category methods
  async getCategories(): Promise<CategoryType[]> {
    const categories = await Category.find();
    return categories.map((cat) => convertDoc<CategoryType>(cat));
  }

  async getCategory(id: string): Promise<CategoryType | undefined> {
    const category = await Category.findById(id);
    return category ? convertDoc<CategoryType>(category) : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<CategoryType | undefined> {
    const category = await Category.findOne({ slug });
    return category ? convertDoc<CategoryType>(category) : undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<CategoryType> {
    const category = new Category(categoryData);
    await category.save();
    return convertDoc<CategoryType>(category);
  }

  // Product methods
  async getProducts(filters?: any): Promise<ProductType[]> {
    let query: any = { isActive: true };

    if (filters?.categoryId || filters?.category) {
      query.category = filters.category || filters.categoryId;
    }
    if (filters?.categorySlug) {
      // Find category by slug and filter by category name
      const category = await Category.findOne({ slug: filters.categorySlug });
      if (category) {
        query.category = category.name;
      }
    }
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { sku: { $regex: filters.search, $options: "i" } },
      ];
    }
    if (filters?.fabric) {
      query.fabric = { $regex: filters.fabric, $options: "i" };
    }
    if (filters?.color) {
      query.color = { $regex: filters.color, $options: "i" };
    }
    if (filters?.minPrice || filters?.maxPrice) {
      query.price = {};
      if (filters?.minPrice) {
        query.price.$gte = filters.minPrice.toString();
      }
      if (filters?.maxPrice) {
        query.price.$lte = filters.maxPrice.toString();
      }
    }
    if (filters?.inStockOnly) {
      query.stockQuantity = { $gt: 0 };
    }

    // Build sort object
    let sortObj: any = {};
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          sortObj = { price: 1 };
          break;
        case 'price-high':
          sortObj = { price: -1 };
          break;
        case 'name':
          sortObj = { name: 1 };
          break;
        case 'rating':
          sortObj = { rating: -1 };
          break;
        case 'newest':
        default:
          sortObj = { createdAt: -1 };
          break;
      }
    } else {
      sortObj = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortObj);
    return products.map((product) => convertDoc<ProductType>(product));
  }

  async getProduct(id: string): Promise<ProductType | undefined> {
    try {
      // Try to find by string ID first (most common case)
      let product = await Product.findOne({ id: id });
      
      // If not found, try numeric ID
      if (!product && !isNaN(Number(id))) {
        product = await Product.findOne({ id: parseInt(id) });
      }
      
      // If not found and id looks like an ObjectId, try findById
      if (!product && id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id);
      }
      
      return product ? convertDoc<ProductType>(product) : undefined;
    } catch (error) {
      console.error("Error in getProduct:", error);
      return undefined;
    }
  }

  async getProductsByCategory(categoryId: string): Promise<ProductType[]> {
    const products = await Product.find({
      category: categoryId,
      isActive: true,
    });
    return products.map((product) => convertDoc<ProductType>(product));
  }

  async getFeaturedProducts(): Promise<ProductType[]> {
    const products = await Product.find({ isActive: true }).limit(8);
    return products.map((product) => convertDoc<ProductType>(product));
  }

  async searchProducts(query: string): Promise<ProductType[]> {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
        { fabric: { $regex: query, $options: "i" } },
        { color: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    });
    return products.map((product) => convertDoc<ProductType>(product));
  }

  async createProduct(productData: InsertProduct): Promise<ProductType> {
    const product = new Product(productData);
    await product.save();
    return convertDoc<ProductType>(product);
  }

  async updateProduct(
    id: string,
    productData: Partial<InsertProduct>,
  ): Promise<ProductType | undefined> {
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    });
    return product ? convertDoc<ProductType>(product) : undefined;
  }

  // Address methods
  async getUserAddresses(userId: string): Promise<AddressType[]> {
    const addresses = await Address.find({ userId });
    return addresses.map((addr) => convertDoc<AddressType>(addr));
  }

  async getAddress(id: string): Promise<AddressType | undefined> {
    const address = await Address.findById(id);
    return address ? convertDoc<AddressType>(address) : undefined;
  }

  async createAddress(addressData: InsertAddress): Promise<AddressType> {
    const address = new Address(addressData);
    await address.save();
    return convertDoc<AddressType>(address);
  }

  async updateAddress(
    id: string,
    addressData: Partial<InsertAddress>,
  ): Promise<AddressType | undefined> {
    const address = await Address.findByIdAndUpdate(id, addressData, {
      new: true,
    });
    return address ? convertDoc<AddressType>(address) : undefined;
  }

  async deleteAddress(id: string): Promise<boolean> {
    const result = await Address.findByIdAndDelete(id);
    return !!result;
  }

  // Cart methods
  async getCartItems(
    userId: string,
  ): Promise<(CartItemType & { product: ProductType })[]> {
    const cartItems = await CartItem.find({ userId });

    // Manual join with products using string ID
    const cartItemsWithProducts = [];
    for (const cartItem of cartItems) {
      const product = await Product.findOne({ id: cartItem.productId });
      if (product) {
        cartItemsWithProducts.push({
          ...convertDoc<CartItemType>(cartItem),
          product: convertDoc<ProductType>(product),
        });
      }
    }

    return cartItemsWithProducts;
  }

  async addToCart(cartData: InsertCartItem): Promise<CartItemType> {
    // Verify product exists using string ID
    const product = await Product.findOne({ id: cartData.productId });
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if item already exists in cart using string IDs directly
    const existingItem = await CartItem.findOne({
      userId: cartData.userId,
      productId: cartData.productId, // Use string ID directly
    });

    if (existingItem) {
      existingItem.quantity += cartData.quantity || 1;
      await existingItem.save();
      return convertDoc<CartItemType>(existingItem);
    }

    // Create cart item with string IDs directly
    const cartItem = new CartItem(cartData);
    await cartItem.save();
    return convertDoc<CartItemType>(cartItem);
  }

  async updateCartItem(
    id: string,
    quantity: number,
  ): Promise<CartItemType | undefined> {
    const cartItem = await CartItem.findByIdAndUpdate(
      id,
      { quantity },
      { new: true },
    );
    return cartItem ? convertDoc<CartItemType>(cartItem) : undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await CartItem.findByIdAndDelete(id);
    return !!result;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await CartItem.deleteMany({ userId });
    return result.deletedCount > 0;
  }

  // Wishlist methods
  async getWishlistItems(
    userId: string,
  ): Promise<(WishlistItemType & { product: ProductType })[]> {
    const wishlistItems = await WishlistItem.find({ userId }).populate(
      "productId",
    );
    return wishlistItems.map((item) => {
      const converted = convertDoc<WishlistItemType>(item);
      return {
        ...converted,
        product: convertDoc<ProductType>(item.productId),
      };
    });
  }

  async addToWishlist(
    wishlistData: InsertWishlistItem,
  ): Promise<WishlistItemType> {
    const wishlistItem = new WishlistItem(wishlistData);
    await wishlistItem.save();
    return convertDoc<WishlistItemType>(wishlistItem);
  }

  async removeFromWishlist(id: string): Promise<boolean> {
    const result = await WishlistItem.findByIdAndDelete(id);
    return !!result;
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await WishlistItem.findOne({ userId, productId });
    return !!item;
  }

  // Order methods
  async getOrders(userId: string): Promise<OrderType[]> {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders.map((order) => convertDoc<OrderType>(order));
  }

  async getOrder(
    id: string,
  ): Promise<
    | (OrderType & { items: (OrderItemType & { product: ProductType })[] })
    | undefined
  > {
    const order = await Order.findById(id);
    if (!order) return undefined;

    const orderItems = await OrderItem.find({ orderId: id });
    
    // Manual join with products using string ID
    const items = [];
    for (const orderItem of orderItems) {
      const product = await Product.findOne({ id: orderItem.productId });
      if (product) {
        items.push({
          ...convertDoc<OrderItemType>(orderItem),
          product: convertDoc<ProductType>(product),
        });
      }
    }

    return {
      ...convertDoc<OrderType>(order),
      items,
    };
  }

  async createOrder(
    orderData: InsertOrder,
    items: InsertOrderItem[],
  ): Promise<OrderType> {
    const order = new Order(orderData);
    await order.save();

    // Create order items and reduce stock quantities
    const orderItems = [];
    for (const item of items) {
      // Reduce stock quantity for each product
      const product = await Product.findOne({ id: item.productId });
      if (product) {
        const newStockQuantity = Math.max(0, product.stockQuantity - item.quantity);
        await Product.updateOne(
          { id: item.productId },
          { 
            stockQuantity: newStockQuantity,
            updatedAt: new Date()
          }
        );
        console.log(`Stock reduced for product ${item.productId}: ${product.stockQuantity} → ${newStockQuantity}`);
      }

      orderItems.push({
        ...item,
        orderId: order._id.toString(),
      });
    }
    
    await OrderItem.insertMany(orderItems);

    return convertDoc<OrderType>(order);
  }

  async updateOrderStatus(
    id: string,
    status: string,
  ): Promise<OrderType | undefined> {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    return order ? convertDoc<OrderType>(order) : undefined;
  }

  // Review methods
  async getProductReviews(
    productId: string,
  ): Promise<(ReviewType & { user: Pick<UserType, "username"> })[]> {
    try {
      // Try to find reviews by string product ID first (most common case)
      let reviews = await Review.find({ productId: productId }).populate(
        "userId",
        "username",
      );
      
      // If not found, try numeric product ID
      if (reviews.length === 0 && !isNaN(Number(productId))) {
        reviews = await Review.find({ productId: parseInt(productId) }).populate(
          "userId",
          "username",
        );
      }
      
      return reviews.map((review) => {
        const converted = convertDoc<ReviewType>(review);
        return {
          ...converted,
          user: { username: (review.userId as any).username || "Anonymous" },
        };
      });
    } catch (error) {
      console.error("Error in getProductReviews:", error);
      return [];
    }
  }

  async createReview(reviewData: InsertReview): Promise<ReviewType> {
    const review = new Review(reviewData);
    await review.save();
    return convertDoc<ReviewType>(review);
  }
}

export const storage = new MongoStorage();
