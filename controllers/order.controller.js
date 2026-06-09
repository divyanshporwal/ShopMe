import Order from "@/models/order.model";
import Product from "@/models/product.model";
import mongoose from "mongoose";

const MERCHANT_ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

const getItemProductId = (item) => item.productId || item._id;

const normalizeStatus = (status) => String(status || "").trim().toUpperCase();

const buildOrderFromItems = async (items, user, options = {}) => {
  const productIds = items
    .map(getItemProductId)
    .filter(Boolean)
    .map((id) => id.toString())
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (productIds.length === 0) {
    throw new Error("No valid items provided");
  }

  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const productId = getItemProductId(item)?.toString();
    const quantity = Number(item.quantity || 1);

    if (!productId || quantity <= 0) {
      throw new Error("Invalid item quantity");
    }

    const product = productMap.get(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    totalAmount += product.price * quantity;
    orderItems.push({
      productId: product._id,
      quantity,
      price: product.price,
    });
  }

  return { orderItems, totalAmount };
};

const decrementProductStock = async (items) => {
  const stockUpdates = items
    .map((item) => {
      const productId = getItemProductId(item)?.toString();
      const quantity = Number(item.quantity || 1);

      if (!productId || !mongoose.Types.ObjectId.isValid(productId) || quantity <= 0) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { stock: -quantity } },
        },
      };
    })
    .filter(Boolean);

  if (stockUpdates.length === 0) {
    return;
  }

  await Product.bulkWrite(stockUpdates);
};

const createOrderRecord = async (items, user, options = {}) => {
  const { orderItems, totalAmount } = await buildOrderFromItems(
    items,
    user,
    options
  );

  const [order] = await Order.create(
    [
      {
        userId: user._id,
        items: orderItems,
        totalAmount,
        status: "PENDING",
        paymentStatus: options.paymentStatus || "SUCCESS",
        paymentId: options.paymentId,
      },
    ]
  );

  decrementProductStock(items).catch((error) => {
    console.error("Failed to decrement stock:", error);
  });

  return order;
};

export const createOrderWithInventory = async (
  items,
  user,
  options = {}
) => {
  return createOrderRecord(items, user, options);
};

// 1. Create Order
export const createOrder = async (items, user) => {
  const order = await createOrderWithInventory(items, user, {
    paymentStatus: "PENDING",
  });

  return { order };
};

// 2. Legacy payment verification placeholder.
// Stripe verification is handled in app/api/payment/verify/route.ts.
export const verifyPayment = async (data) => {
  const { orderId, paymentId } = data;

  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  if (order.paymentStatus === "SUCCESS") {
    return order;
  }

  if (paymentId) {
    order.paymentId = paymentId;
  }

  order.paymentStatus = "SUCCESS";
  order.status = "PENDING";

  await order.save();

  return order;
};

// 3. Get User Orders
export const getUserOrders = async (userId) => {
  return await Order.find({ userId }).populate("items.productId");
};

export const getMerchantOrders = async (user) => {
  if (user.role !== "MERCHANT") {
    throw new Error("Only merchants can view orders");
  }

  const merchantProducts = await Product.find({ merchantId: user._id }).select(
    "_id"
  );
  const merchantProductIds = merchantProducts.map((product) =>
    product._id.toString()
  );

  if (merchantProductIds.length === 0) {
    return [];
  }

  const orders = await Order.find({
    "items.productId": { $in: merchantProductIds },
  })
    .populate("userId", "name email")
    .populate("items.productId", "title merchantId price images")
    .sort({ createdAt: -1 });

  return orders.map((order) => {
    const merchantItems = order.items.filter((item) => {
      const productId = item.productId?._id
        ? item.productId._id.toString()
        : item.productId?.toString();

      return merchantProductIds.includes(productId);
    });

    return {
      _id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customerName: order.userId?.name || "Customer",
      customerEmail: order.userId?.email || "",
      amount: merchantItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      items: merchantItems.map((item) => ({
        _id: item.productId?._id || item.productId,
        title: item.productId?.title || "Product",
        quantity: item.quantity,
        price: item.price,
      })),
    };
  });
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
  const nextStatus = normalizeStatus(status);
  const allowedStatuses = MERCHANT_ORDER_STATUSES;

  if (!allowedStatuses.includes(nextStatus)) {
    throw new Error("Invalid status update");
  }

  // ✅ Update
  order.status = nextStatus;
  await order.save();

  return order;
};
