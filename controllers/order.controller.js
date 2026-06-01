import Order from "@/models/order.model";
import Product from "@/models/product.model";
import { razorpay, verifyRazorpaySignature } from "@/services/payment.service";

// 1. Create Order (before payment)
export const createOrder = async (items, user) => {
  if (!items || items.length === 0) {
    throw new Error("No items provided");
  }

  // 🔥 Fetch all products in parallel (performance boost)
  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  let totalAmount = 0;

  // 🔐 Build secure order items (DO NOT trust frontend price)
  const orderItems = items.map(item => {
    const product = products.find(
      p => p._id.toString() === item.productId
    );

    if (!product) throw new Error("Product not found");

    totalAmount += product.price * item.quantity;

    return {
      productId: product._id,
      quantity: item.quantity,
      price: product.price, // ✅ store price at purchase time
    };
  });

  // 💳 Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: "INR",
  });

  // 📝 Save order
  const order = await Order.create({
    userId: user._id,
    items: orderItems,
    totalAmount,
    paymentId: razorpayOrder.id,
  });

  return { order, razorpayOrder };
};

// 2. Verify Payment (CRITICAL)
export const verifyPayment = async (data) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = data;

  // 🔐 Step 1: Verify signature
  verifyRazorpaySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  // 🔎 Step 2: Find order
  const order = await Order.findOne({
    paymentId: razorpay_order_id,
  });

  if (!order) throw new Error("Order not found");

  // ❗ Prevent double payment updates
  if (order.paymentStatus === "SUCCESS") {
    return order;
  }

  // ✅ Step 3: Update order
  order.paymentStatus = "SUCCESS";
  order.status = "PAID";

  await order.save();

  return order;
};

// 3. Get User Orders
export const getUserOrders = async (userId) => {
  return await Order.find({ userId }).populate("items.productId");
};

// 4. Merchant updates order status (FIXED 🔥)
export const updateOrderStatus = async (orderId, status, user) => {
  // 🔐 Only merchant allowed
  if (user.role !== "MERCHANT") {
    throw new Error("Only merchants can update order");
  }

  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  // 🔥 Extract product IDs
  const productIds = order.items.map(item => item.productId);

  // 🔥 Check merchant ownership
  const merchantProductCount = await Product.countDocuments({
    _id: { $in: productIds },
    merchantId: user._id,
  });

  if (merchantProductCount === 0) {
    throw new Error("Not authorized to update this order");
  }

  // ⚠️ Restrict status updates
  const allowedStatuses = ["SHIPPED", "DELIVERED"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status update");
  }

  // ❗ Prevent wrong flow
  if (status === "DELIVERED" && order.status !== "SHIPPED") {
    throw new Error("Order must be SHIPPED before DELIVERED");
  }

  // ✅ Update
  order.status = status;
  await order.save();

  return order;
};
