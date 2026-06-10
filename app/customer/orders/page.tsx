"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  productId?: {
    title?: string;
  };
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED";
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.text();
        console.log(err);
        throw new Error("Failed");
      }

      const data = await res.json();
      console.log("ORDERS:", data); // 👈 debug
      setOrders(data.orders);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false); // ✅ VERY IMPORTANT
    }
    };

    fetchOrders();
    }, []);

  if (loading) {
    return <p className="text-center py-10">Loading orders...</p>;
  }

  if (error) {
    return (
      <p className="text-center py-10 text-red-500">
        {error}
      </p>
    );
  }

  return (
  <div className="max-w-4xl mx-auto py-10 px-4 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-bold mb-8 text-gray-800">
      My Orders
    </h1>

    {orders.length === 0 ? (
      <p className="text-gray-500 text-center">No orders yet</p>
    ) : (
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <p className="text-xs md:text-sm text-gray-500 truncate">
                Order ID:
                <span className="ml-1 md:ml-2 font-medium text-gray-700 select-all">
                  {order._id}
                </span>
              </p>

              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : order.status === "SHIPPED" || order.status === "PAID"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-3 text-sm"
                >
                  <span className="text-gray-700 font-medium">
                    {item.productId?.title || "Product"}
                    <span className="text-gray-400 ml-1">
                      × {item.quantity}
                    </span>
                  </span>

                  <span className="text-gray-800 font-semibold">
                    ₹{item.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-lg font-semibold text-gray-700">
                Total
              </span>
              <span className="text-xl font-bold text-green-600">
                ₹
                {order.items.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);  
}
