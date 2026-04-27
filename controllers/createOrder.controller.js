import Order from "@/models/order.model";

export const createOrder = async (items, user) => {
  const totalAmount = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    userId: user._id,
    items,
    totalAmount,
    status: "PAID",
    paymentStatus: "SUCCESS",
  });

  return {
    success: true,
    order,
  };
};