"use client";
import { useState, useEffect } from "react";
import { Package, Trash2, Search } from "lucide-react";
import Image from "next/image";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">All Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} products across all merchants
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
        />
      </div>

      {/* Products table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-2xl">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No products found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {filtered.map((product) => (
              <div
                key={product._id}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center last:border-0"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.title}</p>
                    <p className="text-xs text-gray-400">{product.brand || "—"}</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    {product.category || "—"}
                  </span>
                </div>

                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </p>
                  {product.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      ₹{product.originalPrice?.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <span className={`text-xs font-bold ${
                    product.stock === 0 ? "text-red-500" :
                    product.stock <= 3 ? "text-orange-500" : "text-green-600"
                  }`}>
                    {product.stock} in stock
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                    className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filtered.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm relative"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-sm font-bold text-gray-900 truncate">{product.title}</p>
                  <p className="text-xs text-gray-400 mb-2">{product.brand || "—"}</p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                      {product.category || "—"}
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </span>
                    <span className={`text-xs font-bold ${
                      product.stock === 0 ? "text-red-500" :
                      product.stock <= 3 ? "text-orange-500" : "text-green-600"
                    }`}>
                      ({product.stock} left)
                    </span>
                  </div>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                    className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}