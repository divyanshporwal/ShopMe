"use client";
import { useState, useEffect } from "react";
import { Users, Package, ClipboardList, ShoppingBag, TrendingUp, UserCheck } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/requests").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([usersData, requestsData, productsData]) => {
      if (usersData.success) setUsers(usersData.users);
      if (requestsData.success) setRequests(requestsData.requests);
      if (productsData.success) setProducts(productsData.products);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/users",
    },
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/products",
    },
    {
      label: "Merchants",
      value: users.filter((u) => u.role === "MERCHANT").length,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
      href: "/admin/users",
    },
    {
      label: "Pending Requests",
      value: requests.filter((r) => r.status === "PENDING").length,
      icon: ClipboardList,
      color: "bg-orange-50 text-orange-600",
      href: "/admin/requests",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {loading ? "—" : stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1 group-hover:text-black transition">
                {stat.label}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pending requests */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-gray-900">
              Pending Requests
            </h2>
            <Link
              href="/admin/requests"
              className="text-xs font-semibold text-gray-500 hover:text-black underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.filter((r) => r.status === "PENDING").length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No pending requests
            </p>
          ) : (
            <div className="space-y-3">
              {requests
                .filter((r) => r.status === "PENDING")
                .slice(0, 5)
                .map((req) => (
                  <div key={req._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-orange-600 text-xs font-bold">
                        {req.userId?.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {req.userId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {req.userId?.email}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full">
                      PENDING
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-gray-900">Recent Users</h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-gray-500 hover:text-black underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                    user.role === "ADMIN"
                      ? "text-purple-600 bg-purple-50 border-purple-200"
                      : user.role === "MERCHANT"
                      ? "text-green-600 bg-green-50 border-green-200"
                      : "text-gray-600 bg-gray-50 border-gray-200"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}