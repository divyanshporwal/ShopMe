"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Eye, Package } from "lucide-react";
import showToast from "@/lib/toast";

type Product = {
  _id: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  images?: string[];
  stock?: number;
};

export default function MerchantProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Custom editable quantity state
  const [editingQty, setEditingQty] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products/merchant");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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

  const handleStockUpdate = async (product: Product, delta: number) => {
    const currentStock = product.stock || 0;
    const newQty = Math.max(0, currentStock + delta);

    // Optimistic UI update
    setProducts(prev => prev.map(p =>
      p._id === product._id
        ? { ...p, stock: newQty }
        : p
    ));

    try {
      const res = await fetch(
        `/api/merchant/products/${product._id}/stock`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Revert optimistic update on error
        setProducts(prev => prev.map(p =>
          p._id === product._id
            ? { ...p, stock: product.stock }
            : p
        ));
        showToast.error(data.error || 'Failed to update stock');
        return;
      }

      showToast.success(
        `Stock updated: ${data.quantity} units remaining`
      );

    } catch (err) {
      // Revert on network error
      setProducts(prev => prev.map(p =>
        p._id === product._id
          ? { ...p, stock: product.stock }
          : p
      ));
      showToast.error('Network error. Please try again.');
    }
  };

  const handleQtyInputChange = (productId: string, value: string) => {
    setEditingQty(prev => ({ ...prev, [productId]: value }));
  };

  const handleQtyInputBlur = async (product: Product) => {
    const rawValue = editingQty[product._id];

    // If unchanged or empty, reset state
    if (rawValue === undefined || rawValue === '') {
      setEditingQty(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      return;
    }

    const newQty = parseInt(rawValue);

    // Validate
    if (isNaN(newQty) || newQty < 0) {
      showToast.error('Please enter a valid quantity (0 or more)');
      setEditingQty(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      return;
    }

    if (newQty === product.stock) {
      setEditingQty(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      return;
    }

    // Max limit check
    if (newQty > 9999) {
      showToast.error('Maximum quantity is 9,999');
      setEditingQty(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      return;
    }

    // Call API with absolute quantity
    try {
      const res = await fetch(
        `/api/merchant/products/${product._id}/stock`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQty }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        showToast.error(data.error || 'Failed to update');
        return;
      }

      // Update product in list
      setProducts(prev => prev.map(p =>
        p._id === product._id
          ? { ...p, stock: newQty }
          : p
      ));

      setEditingQty(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });

      showToast.success(`Stock set to ${newQty} units`);

    } catch {
      showToast.error('Network error');
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, product: Product) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setEditingQty(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} products listed
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

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No products yet
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Start listing your products to reach customers
          </p>
          <Link
            href="/merchant/add-product"
            className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <>
          {/* Scrollable Container Wrapper for tablet responsiveness */}
          <div className="products-table bg-white border border-gray-200 rounded-2xl overflow-x-auto WebkitOverflowScrolling-touch">
            <div className="min-w-[850px]">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Rows */}
              {products.map((product) => (
                <div
                  key={product._id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center last:border-0"
                >
                  {/* Product info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-400">{product.brand || "—"}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {product.category || "—"}
                    </span>
                  </div>

                  {/* Price */}
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

                  {/* Stock */}
                  <div className="col-span-2">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <button
                        onClick={() => handleStockUpdate(product, -1)}
                        disabled={(product.stock || 0) <= 0}
                        style={{
                          width: '28px', height: '32px',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '6px',
                          background: (product.stock || 0) <= 0 ? '#f9fafb' : 'white',
                          cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          color: (product.stock || 0) <= 0 ? '#d1d5db' : '#111827',
                          fontWeight: '400',
                          flexShrink: 0,
                        }}
                      >−</button>

                      <input
                        type="number"
                        min="0"
                        max="9999"
                        value={editingQty[product._id] !== undefined
                          ? editingQty[product._id]
                          : (product.stock || 0)
                        }
                        onChange={e => 
                          handleQtyInputChange(product._id, e.target.value)
                        }
                        onBlur={() => handleQtyInputBlur(product)}
                        onKeyDown={e => handleQtyKeyDown(e, product)}
                        onFocus={e => {
                          e.currentTarget.select();
                          setEditingQty(prev => ({
                            ...prev,
                            [product._id]: String(product.stock || 0)
                          }));
                        }}
                        style={{
                          width: '56px',
                          height: '32px',
                          textAlign: 'center',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: (product.stock || 0) <= 0 ? '#ef4444' :
                                 (product.stock || 0) <= 5 ? '#f97316' : '#111827',
                          outline: 'none',
                          MozAppearance: 'textfield',
                        }}
                      />

                      <button
                        onClick={() => handleStockUpdate(product, +1)}
                        style={{
                          width: '28px', height: '32px',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '6px',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          color: '#111827',
                          fontWeight: '400',
                          flexShrink: 0,
                        }}
                      >+</button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link
                      href={`/customer/products/${product._id}`}
                      className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-black"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleting === product._id}
                      className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="products-cards space-y-2">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex flex-col gap-3"
              >
                <div className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.category || "—"} • ₹{product.price?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStockUpdate(product, -1)}
                      disabled={(product.stock || 0) <= 0}
                      style={{
                        width: '28px', height: '32px',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '6px',
                        background: (product.stock || 0) <= 0 ? '#f9fafb' : 'white',
                        cursor: (product.stock || 0) <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        color: (product.stock || 0) <= 0 ? '#d1d5db' : '#111827',
                        fontWeight: '400',
                        flexShrink: 0,
                      }}
                    >−</button>

                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={editingQty[product._id] !== undefined
                        ? editingQty[product._id]
                        : (product.stock || 0)
                      }
                      onChange={e => 
                        handleQtyInputChange(product._id, e.target.value)
                      }
                      onBlur={() => handleQtyInputBlur(product)}
                      onKeyDown={e => handleQtyKeyDown(e, product)}
                      onFocus={e => {
                        e.currentTarget.select();
                        setEditingQty(prev => ({
                          ...prev,
                          [product._id]: String(product.stock || 0)
                        }));
                      }}
                      style={{
                        width: '56px',
                        height: '32px',
                        textAlign: 'center',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: (product.stock || 0) <= 0 ? '#ef4444' :
                               (product.stock || 0) <= 5 ? '#f97316' : '#111827',
                        outline: 'none',
                        MozAppearance: 'textfield',
                      }}
                    />

                    <button
                      onClick={() => handleStockUpdate(product, +1)}
                      style={{
                        width: '28px', height: '32px',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '6px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        color: '#111827',
                        fontWeight: '400',
                        flexShrink: 0,
                      }}
                    >+</button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/customer/products/${product._id}`}
                      className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-black"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleting === product._id}
                      className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
