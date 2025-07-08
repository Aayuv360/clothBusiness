import sgMail from '@sendgrid/mail';
import type { Order, Product, User } from '@shared/schema';

// Check if SendGrid API key is available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@sareeshop.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured, email not sent:', params.subject);
    return false;
  }

  try {
    await sgMail.send({
      to: params.to,
      from: FROM_EMAIL,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    console.log('Email sent successfully:', params.subject);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Order confirmation email
export async function sendOrderConfirmationEmail(
  user: User,
  order: Order,
  orderItems: any[]
): Promise<boolean> {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.product.imageUrl || item.product.images[0]}" alt="${item.product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.product.name}</strong><br>
        <small>SKU: ${item.product.sku}</small><br>
        <small>Quantity: ${item.quantity}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${item.price}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d4af37, #b8860b); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase, ${user.username}</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 30px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px; color: #333; font-size: 20px;">Order Details</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ₹${order.total}</p>
          </div>

          <!-- Order Items -->
          <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${itemsHtml}
          </table>

          <!-- Shipping Address -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px; color: #333;">Shipping Address</h3>
            <p style="margin: 0; color: #666; line-height: 1.5;">
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>

          <!-- Next Steps -->
          <div style="border-left: 4px solid #d4af37; padding-left: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px; color: #333;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>We'll process your order within 24 hours</li>
              <li>You'll receive tracking information once shipped</li>
              <li>Estimated delivery: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : '5-7 business days'}</li>
            </ul>
          </div>

          <!-- Support -->
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666;">Need help? Contact our support team</p>
            <p style="margin: 5px 0 0; color: #d4af37; font-weight: bold;">support@sareeshop.com | +91 12345 67890</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #333; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">© 2025 Saree Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Order Confirmed! Thank you for your purchase, ${user.username}.
    
    Order Details:
    - Order Number: ${order.orderNumber}
    - Order Date: ${new Date(order.createdAt).toLocaleDateString()}
    - Total Amount: ₹${order.total}
    
    We'll process your order within 24 hours and send tracking information once shipped.
    
    Need help? Contact support@sareeshop.com
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });
}

// Order status update email
export async function sendOrderStatusUpdateEmail(
  user: User,
  order: Order,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  const subject = `Order ${order.orderNumber} - Status Updated to ${newStatus}`;
  
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Your order has been confirmed and is being prepared.';
      case 'processing': return 'Your order is currently being processed.';
      case 'shipped': return 'Great news! Your order has been shipped and is on its way.';
      case 'delivered': return 'Your order has been delivered. We hope you love your purchase!';
      case 'cancelled': return 'Your order has been cancelled as requested.';
      default: return `Your order status has been updated to ${status}.`;
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d4af37, #b8860b); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Order Status Update</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Order #${order.orderNumber}</p>
        </div>

        <!-- Status Update -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #d4af37; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; font-size: 18px; font-weight: bold;">
              ${newStatus.toUpperCase()}
            </div>
          </div>

          <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 30px;">
            ${getStatusMessage(newStatus)}
          </p>

          <!-- Order Info -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px; color: #333;">Order Information</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ₹${order.total}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          </div>

          ${newStatus === 'shipped' ? `
          <div style="border-left: 4px solid #d4af37; padding-left: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px; color: #333;">Tracking Information</h3>
            <p style="color: #666; margin: 0;">Your order is now in transit. You should receive it within the estimated delivery timeframe.</p>
          </div>
          ` : ''}

          <!-- Support -->
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666;">Questions about your order?</p>
            <p style="margin: 5px 0 0; color: #d4af37; font-weight: bold;">support@sareeshop.com | +91 12345 67890</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #333; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">© 2025 Saree Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
}

// Welcome email for new users
export async function sendWelcomeEmail(user: User): Promise<boolean> {
  const subject = `Welcome to Saree Shop, ${user.username}!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Saree Shop</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d4af37, #b8860b); color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Saree Shop!</h1>
          <p style="margin: 15px 0 0; font-size: 18px; opacity: 0.9;">Thank you for joining our saree family, ${user.username}</p>
        </div>

        <!-- Welcome Content -->
        <div style="padding: 40px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            We're thrilled to have you as part of our community! Discover the finest collection of traditional and contemporary sarees crafted by master artisans from across India.
          </p>

          <!-- Features -->
          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 20px;">What makes us special:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Premium Quality:</strong> Hand-picked sarees from master weavers</li>
              <li><strong>Authentic Designs:</strong> Traditional patterns with contemporary styling</li>
              <li><strong>Fast Delivery:</strong> Quick shipping across India</li>
              <li><strong>Easy Returns:</strong> 30-day hassle-free return policy</li>
            </ul>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="/products" style="background-color: #d4af37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Start Shopping Now
            </a>
          </div>

          <!-- Support -->
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #666;">Need help getting started?</p>
            <p style="margin: 5px 0 0; color: #d4af37; font-weight: bold;">support@sareeshop.com | +91 12345 67890</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #333; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">© 2025 Saree Shop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
}