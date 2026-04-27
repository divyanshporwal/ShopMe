"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const STATUS_STYLES = {
  PENDING: "text-orange-600 bg-orange-50 border-orange-200",
  APPROVED: "text-green-600 bg-green-50 border-green-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
};

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SINGLE ACTION HANDLER (approve/reject)
  const handleAction = async (requestId, action) => {
    setProcessing(requestId);

    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }), // "approve" | "reject"
      });

      const data = await res.json();

      if (data.success) {
        // ✅ refresh from DB (best practice)
        await fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const filtered =
    filter === "ALL"
      ? requests
      : requests.filter((r) => r.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Merchant Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve or reject merchant applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === tab
                ? "bg-black text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {tab}
            <span className="ml-2 text-xs opacity-70">
              {tab === "ALL"
                ? requests.length
                : requests.filter((r) => r.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl text-center">
          <Clock className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            No {filter.toLowerCase()} requests
          </h3>
          <p className="text-gray-500 text-sm">
            Merchant applications will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">
                  {req.userId?.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900">
                  {req.userId?.name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500">
                  {req.userId?.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Applied{" "}
                  {new Date(req.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Status */}
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  STATUS_STYLES[req.status]
                }`}
              >
                {req.status}
              </span>

              {/* Actions */}
              {req.status === "PENDING" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(req._id, "approve")}
                    disabled={processing === req._id}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleAction(req._id, "reject")}
                    disabled={processing === req._id}
                    className="flex items-center gap-1.5 bg-white border-2 border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}