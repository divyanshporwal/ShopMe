"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  stock?: number;
  requireAuth?: boolean;
}

export default function ProductCard({
  _id, title, price, originalPrice,
  images, category, stock = 1,
  requireAuth = false,
}: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);
  const isInCart = useCartStore((s) => s.isInCart?.(_id) ?? s.cart.some((i: any) => i._id === _id));
  const [added, setAdded] = useState(false);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth) {
      router.push("/auth/login");
      return;
    }
    addToCart({
      _id, title, price, originalPrice,
      image: images[0],
      category,
      stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth) router.push("/auth/login");
  };

  return (
    <Link
      href={requireAuth ? "#" : `/customer/products/${_id}`}
      className="group block"
    >
      <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300">

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-3 left-3 z-10 bg-white text-blue-600 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-blue-100">
            UPTO {discount}% OFF
          </div>
        )}

        {/* Stock warning */}
        {stock && stock <= 3 && (
          <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Only {stock} left
          </div>
        )}

        {/* Add to cart — appears on hover */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
              isInCart
                ? "bg-green-500 text-white"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added to Cart
              </>
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                {requireAuth ? "Login to Buy" : "Add to Cart"}
              </>
            )}
          </button>
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 text-gray-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Image */}
        <Image
          src={images[0] || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        {category && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {category}
          </p>
        )}
        <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
          {title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-base font-black text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discount && (
            <span className="text-xs font-bold text-green-600">
              {discount}% off
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}