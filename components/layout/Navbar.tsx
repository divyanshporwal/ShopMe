"use client";
import Link from "next/link";
import {
  Search, ShoppingBag, User, ChevronDown,
  MapPin, LogOut, LayoutDashboard, Store, Menu, ChevronRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

const NAV_LINKS = [
  { label: "ALL", href: "/customer/products", category: "" },
  { label: "SNEAKERS", href: "/customer/products?category=Sneakers", category: "Sneakers" },
  { label: "APPAREL", href: "/customer/products?category=Apparel", category: "Apparel" },
  { label: "WATCHES", href: "/customer/products?category=Watches", category: "Watches" },
  { label: "ACCESSORIES", href: "/customer/products?category=Accessories", category: "Accessories" },
  { label: "PERFUMES", href: "/customer/products?category=Perfumes", category: "Perfumes" },
  { label: "SALE", href: "/customer/products?sale=true", category: "sale", sale: true },
];

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  isApproved: boolean;
}

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get("category") || "";

  // Cart store
  const cart = useCartStore((s) => s.cart);
  const totalItems = cart.reduce((sum: number, i: any) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data._id) setUser(data);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setShowDropdown(false);
    router.push("/");
    router.refresh();
  };

  const getDashboardLink = () => {
    if (user?.role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "MERCHANT") return "/merchant/dashboard";
    return "/customer/orders";
  };

  const isActive = (link: typeof NAV_LINKS[0]) => {
    if (!pathname.includes("/customer/products")) return false;
    if (link.category === "") return currentCategory === "" && !searchParams.get("sale");
    if (link.category === "sale") return searchParams.get("sale") === "true";
    return currentCategory === link.category;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/customer/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Announcement bar */}
      <div className="bg-black text-white text-center text-[11px] md:text-xs py-[5px] px-[12px] md:py-2 md:px-0 tracking-wide font-medium flex flex-wrap justify-center items-center gap-x-1 leading-[1.5]">
        <span>🎉 FREE SHIPPING on orders above ₹999</span>
        <span className="hidden md:inline">&nbsp;|&nbsp;</span>
        <span>Use code{" "}<span className="text-yellow-400 font-bold">SHOPME10</span> for 10% off</span>
      </div>

      {/* Main navbar */}
      <div className="w-full max-w-[1400px] mx-auto px-4 py-2 md:px-6 md:py-0 md:h-16 flex items-center gap-2 md:gap-6 border-b border-gray-200 relative">
        {/* Logo */}
        <Link href="/customer/products" className="shrink-0 mr-2 md:mr-0">
          <div className="flex flex-col leading-none">
            <span className="text-[9px] md:text-[11px] font-semibold tracking-[0.3em] text-gray-500 uppercase">
              Shop
            </span>
            <span className="text-[18px] md:text-[22px] font-black tracking-tight text-black leading-none">
              ME
            </span>
          </div>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-[calc(100%-100px)] md:max-w-2xl relative">
          <div className={`flex items-center border border-gray-200 md:border-2 rounded-[20px] md:rounded-full px-3 md:px-4 py-0 h-[36px] md:h-auto md:py-2.5 gap-2 md:gap-3 bg-gray-50 transition-all duration-200 ${
            focused ? "border-black bg-white shadow-md" : ""
          }`}>
            <button type="submit">
              <Search className="w-4 h-4 text-gray-400 hover:text-black shrink-0 transition" />
            </button>
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
              <button
                type="button"
                onClick={() => { setSearch(""); router.push("/customer/products"); }}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >✕</button>
            )}
          </div>
        </form>

        {/* Right section - Hidden on mobile */}
        <div className="hidden md:flex items-center ml-auto shrink-0 divide-x divide-gray-200 border-l border-gray-200">

          {userLoading ? (
            <div className="flex items-center gap-3 px-5 h-16">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-1.5">
                <div className="w-16 h-2.5 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <>
              {/* Location — only for customers */}
              {user.role === "CUSTOMER" && (
                <button className="hidden lg:flex items-center gap-2 px-5 h-16 hover:bg-gray-50 transition group">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-black shrink-0" />
                  <div className="flex flex-col leading-none text-left">
                    <span className="text-[11px] text-gray-400 font-medium">Deliver to</span>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-black">
                      Indore <ChevronDown className="w-3 h-3 inline-block" />
                    </span>
                  </div>
                </button>
              )}

              {/* Account dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="hidden md:flex items-center gap-2.5 px-5 h-16 hover:bg-gray-50 transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-black">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex flex-col leading-none text-left">
                    <span className="text-[11px] text-gray-400 font-medium">
                      Hello, {user.name?.split(" ")[0]}
                    </span>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-black">
                      My Account ▾
                    </span>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-[68px] w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "MERCHANT"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1.5">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        My Dashboard
                      </Link>

                      {user.role === "CUSTOMER" && (
                        <Link
                          href="/customer/orders"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition"
                        >
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          My Orders
                        </Link>
                      )}

                      {user.role === "MERCHANT" && (
                        <Link
                          href="/merchant/add-product"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition"
                        >
                          <Store className="w-4 h-4 text-gray-400" />
                          Add Product
                        </Link>
                      )}

                      {user.role === "CUSTOMER" && (
                        <Link
                          href="/customer/cart"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition"
                        >
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          My Cart
                          {totalItems > 0 && (
                            <span className="ml-auto bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                              {totalItems}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart — only for customers */}
              {user.role === "CUSTOMER" && (
                <Link
                  href="/customer/cart"
                  className="flex items-center gap-2.5 px-5 h-16 hover:bg-gray-50 transition group"
                >
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-black" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[11px] text-gray-400 font-medium">My Cart</span>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-black">
                      {totalItems > 0
                        ? `₹${totalPrice.toLocaleString("en-IN")}`
                        : "Empty"}
                    </span>
                  </div>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-5 h-16 hover:bg-gray-50 transition group"
              >
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-black transition">
                  <User className="w-4 h-4 text-gray-500 group-hover:text-black" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[11px] text-gray-400 font-medium">Have an account?</span>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-black">Login</span>
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
                  <span className="text-sm font-bold text-gray-900 group-hover:text-black">Register</span>
                </div>
              </Link>
            </>
          )}
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
          <div className="flex flex-col">
            {user ? (
              <div className="flex flex-col">
                {user.name && (
                  <div className="bg-gray-50 px-5 py-4 border-b-2 border-gray-200">
                    <p className="text-[13px] text-gray-500 font-normal">Hello,</p>
                    <p className="text-[17px] text-gray-900 font-bold capitalize">{user.name}</p>
                  </div>
                )}
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-900 text-[15px] font-medium px-5 py-[15px] border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 cursor-pointer w-full"
                >
                  My Dashboard
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                {user.role === "CUSTOMER" && (
                  <>
                    <Link
                      href="/customer/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-900 text-[15px] font-medium px-5 py-[15px] border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 cursor-pointer w-full"
                    >
                      My Orders
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                    <Link
                      href="/customer/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-900 text-[15px] font-medium px-5 py-[15px] border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 cursor-pointer w-full"
                    >
                      <div className="flex items-center gap-2">
                        My Cart
                        {totalItems > 0 && <span className="text-blue-600 font-bold">({totalItems})</span>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </>
                )}
                <div className="border-t-2 border-gray-200 mt-1" />
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-semibold px-5 py-[15px] flex items-center gap-2 hover:bg-red-50 active:bg-red-100 cursor-pointer w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* Category nav */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1400px] mx-auto md:px-6">
          <ul className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none]">
            {NAV_LINKS.map((link, index) => {
              const active = isActive(link);
              return (
                <li key={link.label} className="flex-1 flex items-center">
                  {index !== 0 && (
                    <div className="w-px h-4 bg-gray-200 shrink-0" />
                  )}
                  <Link
                    href={link.href}
                    className={`shrink-0 flex items-center justify-center px-3.5 md:px-0 py-2 md:py-3.5 text-[12px] md:text-[13px] font-semibold tracking-wider whitespace-nowrap border-b-2 transition-all duration-150 md:flex-1
                      ${active
                        ? "text-black border-black"
                        : link.sale
                        ? "text-blue-600 border-transparent hover:border-blue-400 hover:text-blue-700"
                        : "text-gray-500 border-transparent hover:text-black hover:border-gray-400"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );  
}