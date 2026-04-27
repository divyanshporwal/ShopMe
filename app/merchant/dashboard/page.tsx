"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, Plus } from "lucide-react";

export default function MerchantDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/merchant")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= 3).length;

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Low Stock",
      value: lowStock,
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Inventory Value",
      value: `₹${totalValue.toLocaleString("en-IN")}`,
      icon: ShoppingBag,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's your overview.
          </p>
        </div>
        <Link
          href="/merchant/add-product"
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {loading ? "—" : stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent products */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-black text-gray-900">
            Recent Products
          </h2>
          <Link
            href="/merchant/products"
            className="text-sm font-semibold text-gray-500 hover:text-black transition underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-4">No products yet</p>
            <Link
              href="/merchant/add-product"
              className="text-sm font-bold text-black underline underline-offset-4"
            >
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-gray-400">{product.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </p>
                  <p className={`text-xs font-semibold ${
                    product.stock <= 3 ? "text-orange-500" : "text-green-600"
                  }`}>
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}