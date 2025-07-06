import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phone?: string;
  isVerified: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', userSchema);

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String }
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);

// Product Schema for sm_products collection
export interface IProduct extends Document {
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
  id?: number;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  costPrice: { type: String, required: true },
  stockQuantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 0 },
  fabric: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  images: [{ type: String }],
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  id: { type: Number }
});

export const Product = mongoose.model<IProduct>('sm_products', productSchema);

// Address Schema
export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
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

const addressSchema = new Schema<IAddress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  type: { type: String, default: 'home' },
  isDefault: { type: Boolean, default: false }
});

export const Address = mongoose.model<IAddress>('Address', addressSchema);

// Cart Schema
export interface ICartItem extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
}

const cartSchema = new Schema<ICartItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'sm_products', required: true },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export const CartItem = mongoose.model<ICartItem>('CartItem', cartSchema);

// Wishlist Schema
export interface IWishlistItem extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const wishlistSchema = new Schema<IWishlistItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'sm_products', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const WishlistItem = mongoose.model<IWishlistItem>('WishlistItem', wishlistSchema);

// Order Schema
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
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

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  total: { type: String, required: true },
  shippingCost: { type: String },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'pending' },
  status: { type: String, default: 'pending' },
  shippingAddress: { type: Schema.Types.Mixed, required: true },
  estimatedDelivery: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);

// Order Item Schema
export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: string;
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'sm_products', required: true },
  quantity: { type: Number, required: true },
  price: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const OrderItem = mongoose.model<IOrderItem>('OrderItem', orderItemSchema);

// Review Schema
export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'sm_products', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);