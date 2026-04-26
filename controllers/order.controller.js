import Order from "@/models/order.model";
import Product from "@/models/product.model";
import { razorpay } from "@/services/payment.service";

// 1. Create Order (before payment)
export const createOrder = async (items, user) => {
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) throw new Error("Product not found");

    totalAmount += product.price * item.quantity;
  }

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmount * 100, // paise
    currency: "INR",
  });

  const order = await Order.create({
    userId: user._id,
    items,
    totalAmount,
    paymentId: razorpayOrder.id,
  });

  return { order, razorpayOrder };
};

// 2. Verify Payment (CRITICAL)
export const verifyPayment = async (data) => {
  const { razorpay_order_id, razorpay_payment_id } = data;

  const order = await Order.findOne({
    paymentId: razorpay_order_id,
  });

  if (!order) throw new Error("Order not found");

  order.paymentStatus = "SUCCESS";
  order.status = "PAID";

  await order.save();

  return order;
};

// 3. Get User Orders
export const getUserOrders = async (userId) => {
  return await Order.find({ userId }).populate("items.productId");
};

// 4. Merchant updates order status
export const updateOrderStatus = async (orderId, status, user) => {
  if (user.role !== "MERCHANT") {
    throw new Error("Only merchants can update order");
  }

  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  order.status = status;
  await order.save();

  return order;
};