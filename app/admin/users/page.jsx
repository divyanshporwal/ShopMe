"use client";
import { useState, useEffect } from "react";
import { Users, Search, Trash2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import showToast from "@/lib/toast";

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

  // Get current logged-in user
  const { user: currentUser } = useAuth();

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    userId: null,
    userName: "",
  });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const userToUpdate = users.find((u) => u._id === userId);
    const oldRole = userToUpdate?.role;

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
    );

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Revert on error
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: oldRole } : u))
        );
        showToast.error(data.error || "Failed to update role");
        return;
      }

      showToast.success(`${userToUpdate?.name}'s role updated to ${newRole}`);
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: oldRole } : u))
      );
      showToast.error("Something went wrong");
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setConfirmModal({ open: true, userId, userName });
  };

  const confirmDelete = async () => {
    const { userId, userName } = confirmModal;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast.error(data.error || "Failed to remove user");
        return;
      }

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast.success(`${userName} has been removed`);
      setConfirmModal({ open: false, userId: null, userName: "" });
    } catch (err) {
      showToast.error("Failed to remove user");
    }
  };

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
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide shrink-0">
          {["ALL", "CUSTOMER", "MERCHANT", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
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
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filtered.map((user) => (
              <div
                key={user._id}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center last:border-0"
              >
                {/* Name + avatar */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
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
                <div className="col-span-3">
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
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <select
                    value={user.role}
                    disabled={user._id === currentUser?._id}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white hover:border-gray-400 focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="MERCHANT">Merchant</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <button
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    disabled={user._id === currentUser?._id}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filtered.map((user) => (
              <div
                key={user._id}
                className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_STYLES[user.role]}`}>
                    {user.role}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Email</span>
                    <span className="text-gray-700 font-medium truncate max-w-[200px]">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Joined</span>
                    <span className="text-gray-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Asia/Kolkata",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions row for Mobile */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Role:</span>
                    <select
                      value={user.role}
                      disabled={user._id === currentUser?._id}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="MERCHANT">Merchant</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    disabled={user._id === currentUser?._id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove User?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to remove <strong className="text-gray-900">{confirmModal.userName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, userId: null, userName: "" })}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}