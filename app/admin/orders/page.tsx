"use client";
import { ShoppingBag } from "lucide-react";

export default function AdminOrders() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">All Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform-wide order management
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Orders coming soon
        </h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Order management will be available once the order system is built.
        </p>
      </div>
    </div>
  );
}