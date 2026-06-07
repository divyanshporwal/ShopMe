import { createOrderWithInventory } from "@/controllers/order.controller";

export const createOrder = async (items, user) => {
  const order = await createOrderWithInventory(items, user, {
    paymentStatus: "SUCCESS",
  });

  return {
    success: true,
    order,
  };
};