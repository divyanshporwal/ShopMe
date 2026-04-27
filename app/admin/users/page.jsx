"use client";
import { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";

const ROLE_STYLES = {
  ADMIN: "text-purple-600 bg-purple-50 border-purple-200",
  MERCHANT: "text-green-600 bg-green-50 border-green-200",
  CUSTOMER: "text-gray-600 bg-gray-50 border-gray-200",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchesFilter = filter === "ALL" || u.role === filter;
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          {users.length} total users on the platform
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
          />
        </div>

        <div className="flex gap-2">
          {["ALL", "CUSTOMER", "MERCHANT", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === role
                  ? "bg-black text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl">
          <Users className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No users found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">User</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Joined</div>
          </div>

          {filtered.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center last:border-0"
            >
              {/* Name + avatar */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name || "—"}
                  </p>
                  {user.isApproved && (
                    <p className="text-[10px] text-green-600 font-semibold">
                      ✓ Approved
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="col-span-4">
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_STYLES[user.role]}`}>
                  {user.role}
                </span>
              </div>

              {/* Joined */}
              <div className="col-span-2">
                <p className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}