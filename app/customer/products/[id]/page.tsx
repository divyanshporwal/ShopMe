"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag, Heart, ArrowLeft, Check,
  Star, Truck, Shield, RefreshCw, Package
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import showToast from "@/lib/toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addToCart);
  const cart = useCartStore((s) => s.cart);
  const isInCart = cart.some((i: any) => i._id === id);

  useEffect(() => {
  fetch(`/api/products/${id}`)
    .then((r) => r.json())
    .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    // Check stock
    const existingCartItem = (useCartStore.getState().cart || []).find(
      (item: any) => item._id?.toString() === product._id?.toString()
    );
    const currentCartQty = existingCartItem?.quantity || 0;

    if (product.stock <= 0) {
      showToast.error("This product is out of stock");
      return;
    }

    if (currentCartQty + quantity > product.stock) {
      showToast.error(
        `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available. ` +
        `You already have ${currentCartQty} in your cart.`
      );
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0],
        category: product.category,
        stock: product.stock,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);

    toast.success(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <img
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.title}
            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.title}
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

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 animate-pulse">
          <div className="space-y-3">
            <div className="aspect-square bg-gray-200 rounded-3xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/3" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Product not found</h2>
        <p className="text-gray-500 text-sm mb-8">
          This product may have been removed or doesn't exist.
        </p>
        <Link
          href="/customer/products"
          className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition"
        >
          Browse Products →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 hover:text-black transition font-medium shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="shrink-0">/</span>
        <Link href="/customer/products" className="hover:text-black transition shrink-0">
          Products
        </Link>
        {product.category && (
          <>
            <span className="shrink-0">/</span>
            <Link
              href={`/customer/products?category=${product.category}`}
              className="hover:text-black transition shrink-0"
            >
              {product.category}
            </Link>
          </>
        )}
        <span className="shrink-0">/</span>
        <span className="text-gray-600 truncate max-w-[200px] shrink-0">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        {/* Left — Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
            {discount && (
              <div className="absolute top-4 left-4 z-10 bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-blue-100">
                UPTO {discount}% OFF
              </div>
            )}
            {product.stock <= 3 && product.stock > 0 && (
              <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                Only {product.stock} left!
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center rounded-3xl">
                <span className="bg-white text-black font-black text-lg px-6 py-3 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-black shadow-md"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt={`${product.title} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Product info */}
        <div className="pt-2 flex flex-col">
          {/* Category + brand */}
          <div className="flex items-center gap-2 mb-3">
            {product.category && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {product.category}
              </span>
            )}
            {product.brand && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {product.brand}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-gray-900 leading-tight mb-4">
            {product.title}
          </h1>

          {/* Rating (static for now) */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-600">4.0</span>
            <span className="text-sm text-gray-400">(24 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-gray-900">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-400 line-through font-medium">
                ₹{product.originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
            {discount && (
              <span className="bg-green-100 text-green-700 text-sm font-black px-3 py-1 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Quantity selector */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition font-bold text-gray-700 text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center font-black text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  disabled={quantity >= (product.stock || 10)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition font-bold text-gray-700 text-lg disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-400">
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${
                isInCart
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-5 h-5" />
                  {added ? "Added to Cart!" : "In Cart — Add More"}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </>
              )}
            </button>

            <button className="w-14 h-14 flex items-center justify-center rounded-2xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition group">
              <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition" />
            </button>
          </div>

          {/* Buy now button */}
          {product.stock > 0 && (
            <button
              onClick={() => {
                handleAddToCart();
                router.push("/customer/cart");
              }}
              className="w-full py-4 rounded-2xl border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all mb-8"
            >
              Buy Now →
            </button>
          )}

          {/* Delivery info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders above ₹999" },
              { icon: Shield, title: "Authentic Product", desc: "100% verified by ShopMe" },
              { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200 shrink-0">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}