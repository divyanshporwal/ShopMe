"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Heart, SlidersHorizontal, ChevronDown, X, Menu, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockProducts } from "@/lib/mockData";

const CATEGORIES = ["All", "Sneakers", "Apparel", "Watches", "Accessories", "Perfumes"];

type Product = {
  _id: string;
  title: string;
  brand?: string;
  category?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  merchantId?: string;
  stock?: number;
  createdAt?: string | Date;
};

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(mockProducts as Product[]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch real products, fallback to mock
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const apiProducts = (data.products || []) as Product[];
        const merged = [...apiProducts, ...mockProducts] as Product[];

        const uniqueProducts = merged.filter(
          (item, index, self) =>
            index === self.findIndex((p) => p._id === item._id)
        );

        setProducts(uniqueProducts);
      })
      .catch(() => setProducts(mockProducts));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (search) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [products, activeCategory, search]);

  const handleProtectedAction = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        {/* Announcement */}
        <div className="bg-black text-white text-center text-[11px] md:text-xs py-[5px] px-[12px] md:py-2 md:px-0 font-medium tracking-wide flex flex-wrap justify-center items-center gap-x-1 leading-[1.5]">
          <span>🎉 FREE SHIPPING on orders above ₹999</span>
          <span className="hidden md:inline">&nbsp;|&nbsp;</span>
          <span>Use code{" "}<span className="text-yellow-400 font-bold">SHOPME10</span> for 10% off</span>
        </div>

        {/* Main nav */}
        <div className="w-full max-w-[1400px] mx-auto px-4 py-2 md:px-6 md:py-0 md:h-16 flex items-center gap-2 md:gap-6 border-b border-gray-200 relative">
          {/* Logo */}
          <Link href="/" className="shrink-0 mr-2 md:mr-0">
            <div className="flex flex-col leading-none">
              <span className="text-[9px] md:text-[11px] font-semibold tracking-[0.3em] text-gray-500 uppercase">Shop</span>
              <span className="text-[18px] md:text-[22px] font-black tracking-tight text-black leading-none">ME</span>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 min-w-0 max-w-[calc(100%-100px)] md:max-w-2xl relative">
            <div className={`flex items-center border border-gray-200 md:border-2 rounded-[20px] md:rounded-full px-3 md:px-4 py-0 h-[36px] md:h-auto md:py-2.5 gap-2 md:gap-3 bg-gray-50 transition-all duration-200 ${
              focused ? "border-black bg-white shadow-md" : ""
            }`}>
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent text-[13px] md:text-sm outline-none text-gray-800 placeholder-gray-400 min-w-0"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 text-xs">✕</button>
              )}
            </div>
          </div>

          {/* Right — Login/Register - Hidden on mobile */}
          <div className="hidden md:flex items-center ml-auto shrink-0 md:divide-x md:divide-gray-200 md:border-l md:border-gray-200">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-5 h-16 hover:bg-gray-50 transition group"
            >
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-black transition">
                <span className="text-xs font-bold text-gray-500 group-hover:text-black">?</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] text-gray-400 font-medium">Have an account?</span>
                <span className="text-sm font-bold text-gray-900">Login</span>
              </div>
            </Link>

            <Link
              href="/auth/register"
              className="flex items-center gap-2.5 px-5 h-16 hover:bg-gray-50 transition group"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-xs font-black">+</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] text-gray-400 font-medium">New here?</span>
                <span className="text-sm font-bold text-gray-900">Register</span>
              </div>
            </Link>
          </div>

          {/* Hamburger Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden shrink-0 ml-2 text-black"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

      {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white z-50 shadow-xl border-t border-gray-200 overflow-hidden">
            <div className="flex flex-col pb-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-900 text-[15px] font-medium px-5 py-[15px] border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 cursor-pointer w-full"
              >
                Login
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-900 text-[15px] font-medium px-5 py-[15px] border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 cursor-pointer w-full"
              >
                Register
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        )}

        {/* Category nav */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-[1400px] mx-auto md:px-6">
            <ul className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none]">
            {CATEGORIES.map((cat, index) => (
              <li key={cat} className="flex-1 flex items-center">
                {index !== 0 && <div className="w-px h-4 bg-gray-200 shrink-0" />}
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 flex items-center justify-center px-3.5 md:px-0 py-2 md:py-3.5 text-[12px] md:text-[13px] font-semibold tracking-wider whitespace-nowrap border-b-2 transition-all duration-150 md:flex-1
                    ${activeCategory === cat
                      ? "text-black border-black"
                      : "text-gray-500 border-transparent hover:text-black hover:border-gray-400"
                    }`}
                >
                  {cat.toUpperCase()}
                </button>
              </li>
            ))}
            <li className="flex-1 flex items-center">
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              <button
                onClick={() => router.push("/auth/login")}
                className="shrink-0 md:flex-1 flex items-center justify-center px-3.5 md:px-0 py-2 md:py-3.5 text-[12px] md:text-[13px] font-semibold tracking-wider text-blue-600 border-b-2 border-transparent hover:border-blue-400"
              >
                SALE
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>

    {/* Hero banner */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4 md:pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 h-[260px] flex items-center">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #facc15 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 40%)",
            }}
          />
          <div className="relative z-10 px-6 md:px-12">
            <span className="inline-block bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full mb-3 tracking-wider uppercase">
              ⚡ New Arrivals
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3">
              Premium Brands<br />
              <span className="text-yellow-400">Up to 77% Off</span>
            </h1>
            <p className="text-gray-300 text-sm mb-5">
              Authentic products. Verified merchants. Unbeatable prices.
            </p>
            <button
              onClick={handleProtectedAction}
              className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-full hover:bg-yellow-400 transition text-sm"
            >
              Login to Shop →
            </button>
          </div>
          <div className="absolute right-20 top-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-white/10" />
          <div className="absolute right-32 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10" />
        </div>
      </section>

      {/* Products section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-xl font-black text-gray-900">
              {activeCategory === "All" ? "All Products" : activeCategory}
            </h2>
            <p className="text-xs md:text-sm text-gray-500">{filtered.length} products</p>
          </div>
          <button
            onClick={handleProtectedAction}
            className="text-sm font-semibold text-black underline underline-offset-4 hover:text-gray-600 transition"
          >
            Login to Buy →
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
          {filtered.map((product) => (
            <div key={product._id} className="group block">
              <div className="relative bg-white rounded-2xl overflow-hidden aspect-square border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                {/* Discount badge */}
                {product.originalPrice && (
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-white text-blue-600 text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full shadow-sm border border-blue-100 whitespace-nowrap">
                    UPTO {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}

                {/* Stock warning */}
                {product.stock && product.stock <= 3 && (
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    Only {product.stock} left
                  </div>
                )}

                {/* Add to cart overlay — triggers login */}
                <button
                  onClick={handleProtectedAction}
                  className="absolute inset-0 z-10 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100"
                >
                  <span className="bg-[#111827] text-white text-xs font-bold px-5 py-2 rounded-[8px] flex items-center gap-2 ">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Login to Add to Cart
                  </span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleProtectedAction}
                  className="absolute bottom-2 right-2 md:bottom-4.5 md:right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 text-gray-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Heart className="w-4 h-4" />
                </button>

                {/* Image */}
                <Image
                  src={product.images[0] || "/placeholder.jpg"}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Product info */}
              <div className="mt-3 px-1 md:px-2 pb-1 md:pb-2">
                {product.category && (
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {product.category}
                  </p>
                )}
                <p className="text-sm font-semibold text-gray-900 break-words leading-tight">{product.title}</p>
                <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1.5">
                  <span className="text-sm md:text-base font-black text-gray-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] md:text-xs text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-[10px] md:text-xs font-bold text-green-600 whitespace-nowrap px-1.5 py-0.5">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Login CTA banner */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 pb-8 md:pb-12">
        <div className="bg-black rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 md:gap-0">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white mb-2">
              Ready to start shopping?
            </h3>
            <p className="text-gray-400 text-sm">
              Create a free account to add to cart, track orders, and get exclusive deals.
            </p>
          </div>
          <div className="flex flex-col w-full md:w-auto md:flex-row gap-3 shrink-0">
            <Link
              href="/auth/login"
              className="px-6 py-3 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition text-sm"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-300 transition text-sm"
            >
              Register Free →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
