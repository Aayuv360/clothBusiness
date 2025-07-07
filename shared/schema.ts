import { z } from "zod";

// MongoDB type definitions based on Mongoose models
export interface User {
  _id: string;
  id: string; // MongoDB _id converted to id by convertDoc
  username: string;
  email: string;
  password: string;
  phone?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  _id?: string;
  id?: number;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: string;
  costPrice: string;
  stockQuantity: number;
  minStockLevel: number;
  fabric: string;
  color: string;
  size?: string;
  sizes?: string[] | null;
  colors?: string[] | null;
  images: string[];
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
  isDefault: boolean;
}

export interface CartItem {
  _id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

export interface Order {
  _id: string;
  userId: string;
  orderNumber: string;
  total: string;
  shippingCost?: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress: any;
  estimatedDelivery?: Date;
  createdAt: Date;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  createdAt: Date;
}

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Insert schemas using Zod
export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const insertProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.string().min(1),
  costPrice: z.string().min(1),
  stockQuantity: z.number().default(0),
  minStockLevel: z.number().default(0),
  fabric: z.string().min(1),
  color: z.string().min(1),
  size: z.string().optional(),
  sizes: z.array(z.string()).nullable().optional(),
  colors: z.array(z.string()).nullable().optional(),
  images: z.array(z.string()),
  imageUrl: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const insertAddressSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  type: z.string().default("home"),
  isDefault: z.boolean().default(false),
});

export const insertCartSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().default(1),
});

export const insertWishlistSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
});

export const insertOrderSchema = z.object({
  userId: z.string().min(1),
  orderNumber: z.string().min(1),
  total: z.string().min(1),
  shippingCost: z.string().optional(),
  paymentMethod: z.string().min(1),
  paymentStatus: z.string().default("pending"),
  status: z.string().default("pending"),
  shippingAddress: z.any(),
  estimatedDelivery: z.date().optional(),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().min(1),
  price: z.string().min(1),
});

export const insertReviewSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type InsertCartItem = z.infer<typeof insertCartSchema>;
export type InsertWishlistItem = z.infer<typeof insertWishlistSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
