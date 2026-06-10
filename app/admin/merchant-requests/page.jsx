"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, CheckCircle, XCircle, Clock, X } from "lucide-react";
import showToast from "@/lib/toast";

const TABS = ["pending", "approved", "rejected"];

const TAB_LABELS = {
  pending:  "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const TAB_COLORS = {
  pending:  { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
  approved: { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
};

export default function AdminMerchantRequests() {
  const [activeTab, setActiveTab]   = useState("pending");
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [counts, setCounts]         = useState({ pending: 0, approved: 0, rejected: 0 });

  // Reject modal
  const [rejectModal, setRejectModal] = useState({ open: false, userId: null, userName: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing]    = useState(null); // userId being processed

  const fetchRequests = useCallback(async (status = activeTab) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/merchant-requests?status=${status}`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch counts for all tabs
  const fetchCounts = useCallback(async () => {
    const results = await Promise.all(
      TABS.map(s =>
        fetch(`/api/admin/merchant-requests?status=${s}`)
          .then(r => r.json())
          .then(d => ({ status: s, count: d.requests?.length || 0 }))
          .catch(() => ({ status: s, count: 0 }))
      )
    );
    const c = {};
    results.forEach(r => { c[r.status] = r.count; });
    setCounts(c);
  }, []);

  useEffect(() => {
    fetchRequests(activeTab);
    fetchCounts();
  }, [activeTab]);

  const handleApprove = async (userId, userName) => {
    setProcessing(userId);
    try {
      const res  = await fetch(`/api/admin/merchant-requests/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast.success(`${userName} approved as merchant! 🎉`);
      fetchRequests(activeTab);
      fetchCounts();
    } catch (err) {
      showToast.error(err.message || "Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    const { userId, userName } = rejectModal;
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/merchant-requests/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectReason }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      showToast.success("Request rejected");
      setRejectModal({ open: false, userId: null, userName: "" });
      setRejectReason("");
      fetchRequests(activeTab);
      fetchCounts();
    } catch {
      showToast.error("Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Merchant Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage applications from customers who want to become merchants.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => {
          const isActive = tab === activeTab;
          const c = TAB_COLORS[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "12px",
                border: `1.5px solid ${isActive ? c.border : "#e5e7eb"}`,
                background: isActive ? c.bg : "white",
                color: isActive ? c.color : "#6b7280",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {TAB_LABELS[tab]}
              <span style={{
                background: isActive ? c.color : "#e5e7eb",
                color: isActive ? "white" : "#6b7280",
                fontSize: "11px",
                fontWeight: "700",
                borderRadius: "10px",
                padding: "1px 7px",
                minWidth: "20px",
                textAlign: "center",
              }}>
                {counts[tab] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl">
          <Users className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            No {activeTab} requests
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const mr   = req.merchantRequest || {};
            const busy = processing === req._id;
            return (
              <div
                key={req._id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">
                        {req.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{req.name}</p>
                      <p className="text-xs text-gray-500">{req.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span style={{
                      ...TAB_COLORS[mr.status] && {
                        background: TAB_COLORS[mr.status]?.bg,
                        color: TAB_COLORS[mr.status]?.color,
                        border: `1px solid ${TAB_COLORS[mr.status]?.border}`,
                      },
                      fontSize: "11px", fontWeight: "700",
                      padding: "3px 10px", borderRadius: "20px",
                    }}>
                      {(mr.status || "unknown").toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {mr.requestedAt
                        ? new Date(mr.requestedAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"
                      }
                    </p>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <InfoRow label="Business Name"  value={mr.businessName} />
                    <InfoRow label="Business Type"  value={mr.businessType} />
                    <InfoRow label="Business Email" value={mr.businessEmail} />
                    <InfoRow label="Phone"          value={mr.businessPhone} />
                    <InfoRow label="Address"        value={mr.businessAddress} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      About
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">
                      {mr.description || "—"}
                    </p>
                    {mr.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-700">{mr.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons (only for pending) */}
                {mr.status === "pending" && (
                  <div className="flex gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/50">
                    <button
                      onClick={() => handleApprove(req._id, req.name)}
                      disabled={busy}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "9px 22px",
                        background: busy ? "#6b7280" : "#16a34a",
                        color: "white", border: "none",
                        borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                        cursor: busy ? "not-allowed" : "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      <CheckCircle size={15} />
                      {busy ? "Processing..." : "Approve"}
                    </button>

                    <button
                      onClick={() => setRejectModal({ open: true, userId: req._id, userName: req.name })}
                      disabled={busy}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "9px 22px",
                        background: "white", color: "#dc2626",
                        border: "1.5px solid #fecaca",
                        borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                        cursor: busy ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        if (!busy) {
                          e.currentTarget.style.background = "#fee2e2";
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "28px",
            maxWidth: "440px",
            width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#111827", margin: 0 }}>
                Reject Merchant Request
              </h3>
              <button
                onClick={() => { setRejectModal({ open: false, userId: null, userName: "" }); setRejectReason(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
              Rejecting <strong style={{ color: "#111827" }}>{rejectModal.userName}</strong>'s merchant request.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block", fontSize: "12px", fontWeight: "600",
                color: "#374151", marginBottom: "6px",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete business information, Invalid phone number..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1.5px solid #e5e7eb", borderRadius: "10px",
                  fontSize: "14px", color: "#111827", background: "#f9fafb",
                  outline: "none", resize: "vertical",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { setRejectModal({ open: false, userId: null, userName: "" }); setRejectReason(""); }}
                style={{
                  flex: 1, padding: "11px",
                  borderRadius: "10px", border: "1.5px solid #e5e7eb",
                  background: "white", color: "#374151",
                  fontSize: "14px", fontWeight: "600", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!processing}
                style={{
                  flex: 1, padding: "11px",
                  borderRadius: "10px", border: "none",
                  background: processing ? "#6b7280" : "#dc2626",
                  color: "white",
                  fontSize: "14px", fontWeight: "700",
                  cursor: processing ? "not-allowed" : "pointer",
                }}
              >
                {processing ? "Processing..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", minWidth: "100px", paddingTop: "1px" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
        {value || "—"}
      </span>
    </div>
  );
}
