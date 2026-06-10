"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import showToast from "@/lib/toast";

interface ProductCardProps {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  stock?: number;
  requireAuth?: boolean;
  wishlistIds?: string[];
  onWishlistChange?: (productId: string, added: boolean) => void;
}

export default function ProductCard({
  _id, title, price, originalPrice,
  images, category, stock = 1,
  requireAuth = false,
  wishlistIds = [],
  onWishlistChange,
}: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);
  const isInCart = useCartStore((s) => s.isInCart?.(_id) ?? s.cart.some((i: any) => i._id === _id));
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(
    (wishlistIds || []).includes(_id?.toString())
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(
      (wishlistIds || []).includes(_id?.toString())
    );
  }, [wishlistIds, _id]);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth) {
      router.push("/auth/login");
      return;
    }
    
    // Check 1: Out of stock entirely
    if (stock <= 0) {
      showToast.error('This product is out of stock');
      return;
    }

    // Check 2: User already has max stock in cart
    const existingCartItem = (useCartStore.getState().cart || []).find(
      (item: any) => item._id?.toString() === _id?.toString()
    );
    const currentCartQty = existingCartItem?.quantity || 0;

    if (currentCartQty >= stock) {
      showToast.error(
        `Only ${stock} unit${stock === 1 ? '' : 's'} available. ` +
        `You already have ${currentCartQty} in your cart.`,
        { duration: 4000 }
      );
      return;
    }

    // Check 3: Adding more would exceed stock
    if (currentCartQty + 1 > stock) {
      showToast.error(
        `Cannot add more. Only ${stock} in stock.`
      );
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

    toast.success(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <img
            src={images[0]}
            alt={title}
            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginTop: '1px' }}>
              is added to cart
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: '#ffffff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >✕</button>
        </div>
      ),
      {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: '#ffffff',
          borderRadius: '14px',
          padding: '12px 14px',
          maxWidth: '340px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(22,163,74,0.35)',
        },
      }
    );
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requireAuth) {
      showToast.error('Please login to save favourites');
      return;
    }

    if (wishlistLoading) return;
    setWishlistLoading(true);

    // Optimistic update
    const newState = !isWishlisted;
    setIsWishlisted(newState);

    try {
      const res = await fetch('/api/customer/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: _id })
      });
      const data = await res.json();

      if (res.ok) {
        setIsWishlisted(data.added);
        if (typeof onWishlistChange === 'function') {
          onWishlistChange(_id, data.added);
        }
        if (data.added) {
          showToast.success('Added to favourites ♥');
        } else {
          showToast.success('Removed from favourites');
        }
      } else {
        setIsWishlisted(!newState);
        showToast.error(data.error || 'Please login to save favourites');
      }
    } catch {
      setIsWishlisted(!newState);
      showToast.error('Something went wrong');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link
      href={requireAuth ? "#" : `/customer/products/${_id}`}
      className="group block"
    >
      <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300">

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-white text-blue-600 text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full shadow-sm border border-blue-100 whitespace-nowrap">
            UPTO {discount}% OFF
          </div>
        )}

        {/* Stock warning */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Out of Stock
          </div>
        ) : stock <= 5 ? (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Only {stock} left
          </div>
        ) : null}


        {/* Image */}
        <Image
          src={images[0] || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* ── OVERLAY ACTION ROW ── */}
        <div
          className="action-overlay absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/45 to-transparent flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-250 md:opacity-0 max-md:opacity-100 max-md:translate-y-0"
        >
          {/* Add to Cart button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart(e)
            }}
            className="add-to-cart-btn"
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              background: isOutOfStock 
                ? 'rgba(156,163,175,0.9)' 
                : 'rgba(17, 24, 39, 0.92)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {isOutOfStock ? 'Out of Stock' : '+ Add to Cart'}
          </button>

          {/* Heart / Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            style={{
              width: '38px',
              height: '38px',
              flexShrink: 0,
              borderRadius: '8px',
              border: 'none',
              background: isWishlisted 
                ? 'rgba(239,68,68,0.9)' 
                : 'rgba(255,255,255,0.92)',
              cursor: wishlistLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease',
            }}
            aria-label={
              isWishlisted 
                ? 'Remove from favourites' 
                : 'Add to favourites'
            }
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill={isWishlisted ? '#ffffff' : 'none'}
              stroke={isWishlisted ? '#ffffff' : '#374151'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1 md:px-2 pb-1 md:pb-2">
        {category && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {category}
          </p>
        )}
        <p className="text-sm font-semibold text-gray-900 break-words leading-tight">
          {title}
        </p>
        <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1.5">
          <span className="text-sm md:text-base font-black text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {originalPrice && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discount && (
            <span className="text-[10px] md:text-xs font-bold text-green-600 whitespace-nowrap px-1.5 py-0.5">
              {discount}% off
            </span>
          )}
        </div>


      </div>
    </Link>
  );
}