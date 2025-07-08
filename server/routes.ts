import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import {
  insertUserSchema,
  insertProductSchema,
  insertAddressSchema,
  insertCartSchema,
  insertWishlistSchema,
  insertOrderSchema,
  insertReviewSchema,
} from "@shared/schema";
import Razorpay from "razorpay";
import crypto from "crypto";

const storage = getStorage();

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await getStorage().getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await getStorage().createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await getStorage().getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user session in database
      req.session.userId = (user as any).id || (user as any)._id?.toString(); // MongoDB converts _id to id in convertDoc
      req.session.user = user;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { password: _, ...userWithoutPassword } = req.session.user!;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await getStorage().getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/slug/:slug", async (req, res) => {
    try {
      const category = await getStorage().getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Returns API routes
  app.get("/api/orders/:userId/eligible-returns", async (req, res) => {
    try {
      const userId = req.params.userId;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const orders = await getStorage().getOrders(userId);
      const eligibleOrders = orders.filter(order => 
        order.status === 'delivered' && 
        new Date(order.createdAt) >= thirtyDaysAgo
      );
      
      res.json(eligibleOrders);
    } catch (error) {
      console.error("Failed to fetch eligible returns:", error);
      res.status(500).json({ message: "Failed to fetch eligible orders" });
    }
  });

  app.get("/api/returns/:userId", async (req, res) => {
    try {
      // For now, return empty array as we don't have returns storage yet
      res.json([]);
    } catch (error) {
      console.error("Failed to fetch returns:", error);
      res.status(500).json({ message: "Failed to fetch returns" });
    }
  });

  app.post("/api/returns", async (req, res) => {
    try {
      const { orderId, type, reason, description } = req.body;
      const userId = req.session.userId!;
      
      // Mock return request creation
      const returnRequest = {
        id: Date.now().toString(),
        orderId,
        orderNumber: `ORD-${Date.now()}`,
        type,
        reason,
        description,
        status: 'pending',
        requestDate: new Date(),
        items: []
      };
      
      res.json(returnRequest);
    } catch (error) {
      console.error("Failed to create return request:", error);
      res.status(500).json({ message: "Failed to create return request" });
    }
  });

  // Guest checkout route
  app.post("/api/guest-orders", async (req, res) => {
    try {
      const { guestInfo, shippingAddress, items, total, paymentMethod } = req.body;
      
      // Create guest order
      const orderData = {
        userId: 'guest',
        orderNumber: `ORD-${Date.now()}`,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        status: 'confirmed',
        shippingAddress: {
          name: guestInfo.name,
          email: guestInfo.email,
          phone: guestInfo.phone,
          ...shippingAddress
        },
        guestInfo,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date()
      };
      
      const order = await getStorage().createOrder(orderData, items);
      
      res.json({
        ...order,
        message: "Order placed successfully"
      });
    } catch (error) {
      console.error("Failed to create guest order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Product comparison route
  app.get("/api/products/compare", async (req, res) => {
    try {
      const ids = req.query.ids as string;
      if (!ids) {
        return res.json([]);
      }
      
      const productIds = ids.split(',').filter(Boolean);
      const products = await Promise.all(
        productIds.map(id => getStorage().getProduct(id))
      );
      
      // Filter out null products
      const validProducts = products.filter(product => product !== undefined);
      res.json(validProducts);
    } catch (error) {
      console.error("Failed to fetch products for comparison:", error);
      res.status(500).json({ message: "Failed to fetch products for comparison" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const {
        search,
        category,
        categoryId,
        minPrice,
        maxPrice,
        fabric,
        color,
        sort,
        inStock
      } = req.query;

      const filters: any = {};
      
      if (search) {
        filters.search = search as string;
      }
      if (category) {
        filters.categorySlug = category as string;
      }
      if (categoryId) {
        filters.categoryId = categoryId as string;
      }
      if (minPrice) {
        filters.minPrice = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        filters.maxPrice = parseFloat(maxPrice as string);
      }
      if (fabric) {
        filters.fabric = fabric as string;
      }
      if (color) {
        filters.color = color as string;
      }
      if (inStock === 'true') {
        filters.inStockOnly = true;
      }
      if (sort) {
        filters.sortBy = sort as string;
      }
      const products = await getStorage().getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await getStorage().getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await getStorage().getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const products = await getStorage().searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await getStorage().getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/products/category/:id", async (req, res) => {
    try {
      const category = req.params.id;
      const products = await getStorage().getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const cartItems = await getStorage().getCartItems(req.session.userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { productId, quantity } = req.body;
      
      console.log("Adding to cart:", {
        userId: req.session.userId,
        productId,
        quantity,
        body: req.body
      });
      
      const cartData = insertCartSchema.parse({
        userId: req.session.userId,
        productId,
        quantity,
      });
      const cartItem = await getStorage().addToCart(cartData);
      res.json(cartItem);
    } catch (error) {
      console.error("Cart add error:", error);
      res.status(400).json({ message: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { quantity } = req.body;
      const cartItem = await getStorage().updateCartItem(id, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await getStorage().removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(400).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart/clear", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const success = await getStorage().clearCart(req.session.userId);
      if (!success) {
        return res.status(404).json({ message: "Failed to clear cart" });
      }
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to clear cart" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const wishlistItems = await getStorage().getWishlistItems(
        req.session.userId,
      );
      res.json(wishlistItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { productId } = req.body;
      const wishlistData = insertWishlistSchema.parse({
        userId: req.session.userId,
        productId,
      });
      const wishlistItem = await getStorage().addToWishlist(wishlistData);
      res.json(wishlistItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await getStorage().removeFromWishlist(id);
      if (!success) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      res.status(400).json({ message: "Failed to remove wishlist item" });
    }
  });

  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const wishlistItems = await getStorage().getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  // Addresses routes
  app.get("/api/addresses/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const addresses = await getStorage().getUserAddresses(userId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const addressData = insertAddressSchema.parse(req.body);
      const address = await getStorage().createAddress(addressData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: "Failed to create address" });
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const addressData = insertAddressSchema.partial().parse(req.body);
      const address = await getStorage().updateAddress(id, addressData);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      res.status(400).json({ message: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await getStorage().deleteAddress(id);
      if (!success) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete address" });
    }
  });

  // Orders routes
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const orders = await getStorage().getOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/detail/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      if (!id || id === 'undefined' || id === 'null') {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await getStorage().getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      const orderData = insertOrderSchema.parse(order);
      const orderNumber = `ORD${Date.now()}`;
      const newOrder = await getStorage().createOrder(
        { ...orderData, orderNumber },
        items,
      );
      res.json(newOrder);
    } catch (error) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // Image serving route - Serve images from GridFS
  app.get("/api/images/:imageId", async (req, res) => {
    try {
      const imageId = req.params.imageId;
      const mongoose = await import("mongoose");
      const GridFSBucket = mongoose.default.mongo.GridFSBucket;

      const db = mongoose.default.connection.db;
      if (!db) {
        throw new Error("Database connection not available");
      }

      const bucket = new GridFSBucket(db, { bucketName: "sm_images" });

      // Check if file exists
      const files = await db.collection("sm_images.files").findOne({
        _id: new mongoose.default.Types.ObjectId(imageId),
      });

      if (!files) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Set appropriate headers
      res.set({
        "Content-Type": files.metadata?.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
        "Content-Length": files.length.toString(),
      });

      // Stream the image from GridFS
      const downloadStream = bucket.openDownloadStream(
        new mongoose.default.Types.ObjectId(imageId),
      );

      downloadStream.on("error", (error) => {
        console.error("GridFS download error:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to serve image" });
        }
      });

      downloadStream.pipe(res);
    } catch (error) {
      console.error("Image serving error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to serve image" });
      }
    }
  });

  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const reviews = await getStorage().getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.session?.user?.id,
        userName: req.session.user?.username,
      });
      const review = await getStorage().createReview(reviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  app.put("/api/reviews/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const id = req.params.id;
      const { rating, comment } = req.body;
      // Note: Add updateReview method to storage interface
      res.json({ message: "Review updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Failed to update review" });
    }
  });

  // Payment routes
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;

      const options = {
        amount: amount, // amount in smallest currency unit
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  app.post("/api/payment/verify", async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
        cartItems,
        shippingAddress,
      } = req.body;

      console.log("Payment verification request:", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: razorpay_signature ? "***provided***" : "missing",
        userId,
        cartItemsCount: cartItems?.length || 0,
      });

      console.log("Raw request body:", req.body);

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Missing required payment parameters",
        });
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

      console.log("Signature verification:", {
        expectedSignature,
        receivedSignature: razorpay_signature,
        match: expectedSignature === razorpay_signature,
      });

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Validate cart items and userId
        if (
          !userId ||
          !cartItems ||
          !Array.isArray(cartItems) ||
          cartItems.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid order data: missing userId or cart items",
          });
        }

        // Payment is verified, create order in database
        const orderNumber = `ORD-${Date.now()}`;
        const total = cartItems.reduce(
          (sum: number, item: any) =>
            sum + parseFloat(item.product.price) * item.quantity,
          0,
        );
        const shippingCost = total >= 999 ? 0 : 99;
        const taxAmount = Math.round(total * 0.05);
        const finalTotal = total + shippingCost + taxAmount;

        const orderData = {
          userId: userId,
          orderNumber: orderNumber,
          total: finalTotal.toString(),
          shippingCost: shippingCost.toString(),
          paymentMethod: "razorpay",
          paymentStatus: "completed",
          status: "confirmed",
          shippingAddress: shippingAddress,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        };

        // Get product ObjectIds for order items
        const orderItems = [];
        for (const item of cartItems) {
          // Use the productId from cart which is already the MongoDB _id
          orderItems.push({
            productId: item.productId, // This is already the MongoDB _id from cart
            quantity: item.quantity,
            price: item.product.price,
          });
        }

        console.log("Creating order:", {
          orderData,
          orderItemsCount: orderItems.length,
        });

        const order = await getStorage().createOrder(orderData, orderItems);

        // Clear user's cart
        await getStorage().clearCart(userId);

        console.log("Order created successfully:", order._id);

        res.json({
          success: true,
          orderId: order._id,
          message: "Payment verified and order created successfully",
        });
      } else {
        console.log("Payment verification failed - signature mismatch");
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
