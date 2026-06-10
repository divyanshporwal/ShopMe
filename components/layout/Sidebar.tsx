"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import showToast from "@/lib/toast";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ClipboardList,
  PlusCircle,
  LogOut,
  X,
} from "lucide-react";

const MERCHANT_LINKS = [
  { label: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
  { label: "My Products", href: "/merchant/products", icon: Package },
  { label: "Add Product", href: "/merchant/add-product", icon: PlusCircle },
  { label: "Orders", href: "/merchant/orders", icon: ShoppingBag },
];

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Requests", href: "/admin/requests", icon: ClipboardList },
];

export default function Sidebar({ role = "merchant", onClose }: { role?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = role === "admin" ? ADMIN_LINKS : MERCHANT_LINKS;
  const base = role === "admin" ? "/admin" : "/merchant";

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 relative">
        <Link href={`${base}/dashboard`} onClick={onClose}>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold tracking-[0.3em] text-gray-400 uppercase">
              Shop
            </span>
            <span className="text-xl font-black text-black">ME</span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-black p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">
              {role === "admin" ? "A" : "M"}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 capitalize">{role} Panel</p>
            <p className="text-[10px] text-gray-400">Logged in</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={async () => {
            onClose?.();
            await fetch("/api/auth/logout", { method: "POST" });
            showToast.success('You have been signed out. See you soon!', { duration: 3000 });
            router.push("/auth/login");
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}