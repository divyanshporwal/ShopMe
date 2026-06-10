"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "react-hot-toast";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/customer/wishlist');
        
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Failed to load wishlist');
          return;
        }

        const data = await res.json();
        setWishlist(data.wishlist || []);
      } catch (err) {
        console.error('Wishlist fetch error:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const wishlistIds = wishlist.map((p) => p._id.toString());
  const handleWishlistChange = (productId, added) => {
    if (!added) {
      setWishlist((prev) => prev.filter((p) => p._id.toString() !== productId.toString()));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-black text-gray-900">
          My Wishlist
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Your wishlist is empty</h3>
          <p className="text-gray-500 mt-2 mb-6">Save products you love by clicking the ♥ icon</p>
          <Link
            href="/customer/products"
            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id}
              {...product}
              wishlistIds={wishlistIds}
              onWishlistChange={handleWishlistChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
