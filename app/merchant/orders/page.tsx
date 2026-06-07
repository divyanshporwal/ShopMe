"use client";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Package,
  Loader2,
} from "lucide-react";

const STATUS_STYLES = {
  PENDING: { color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  PAID: { color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  SHIPPED: { color: "text-blue-600 bg-blue-50 border-blue-200", icon: Package },
  DELIVERED: { color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle },
};

const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED"] as const;

type MerchantOrder = {
  _id: string;
  items: {
    _id: string;
    title: string;
    quantity: number;
    price: number;
  }[];
  customerName: string;
  customerEmail?: string;
  amount?: number;
  status: keyof typeof STATUS_STYLES;
  createdAt: string;
};

export default function MerchantOrders() {
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/merchant/orders", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.orders) {
        setOrders(data.orders);
        setStatusDrafts(
          Object.fromEntries(
            data.orders.map((order: MerchantOrder) => [order._id, order.status])
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string) => {
    const nextStatus = statusDrafts[orderId];

    if (!nextStatus) return;

    setUpdatingId(orderId);

    try {
      const res = await fetch("/api/merchant/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: data.order.status } : order
        )
      );

      setStatusDrafts((prev) => ({
        ...prev,
        [orderId]: data.order.status,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage orders for your products
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: orders.length, color: "text-gray-900" },
          { label: "Pending", value: orders.filter(o => o.status === "PENDING").length, color: "text-yellow-600" },
          { label: "Shipped", value: orders.filter(o => o.status === "SHIPPED").length, color: "text-blue-600" },
          { label: "Delivered", value: orders.filter(o => o.status === "DELIVERED").length, color: "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className={`text-2xl font-black ${stat.color}`}>
              {loading ? "—" : stat.value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">
            When customers order your products, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Products</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Action</div>
          </div>

          {orders.map((order) => {
            const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
            const StatusIcon = statusStyle.icon;
            return (
              <div
                key={order._id}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center last:border-0"
              >
                <div className="col-span-4">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {order.items.map((item) => item.title).join(", ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-gray-700">{order.customerName}</p>
                  {order.customerEmail && (
                    <p className="text-xs text-gray-400 truncate">{order.customerEmail}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{order.amount?.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {order.status}
                  </span>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <select
                      value={statusDrafts[order._id] || order.status}
                      onChange={(e) =>
                        setStatusDrafts((prev) => ({
                          ...prev,
                          [order._id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => updateStatus(order._id)}
                      disabled={updatingId === order._id}
                      className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                      title="Update order status"
                    >
                      {updatingId === order._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
