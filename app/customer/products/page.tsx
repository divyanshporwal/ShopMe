"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import { mockProducts } from "@/lib/mockData";

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
  { label: "Biggest Discount", value: "discount" },
];

type Product = {
  _id: string;
  title: string;
  brand?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock?: number;
  isSale?: boolean;
  createdAt?: string | Date;
};

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlSale = searchParams.get("sale") || "";

  const [sortBy, setSortBy] = useState("relevance");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false);
      }
    };
    if (showSort) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSort]);

  // ✅ FIX: products state at top
  const [products, setProducts] = useState<Product[]>([]);

  // ✅ FIX: fetch data properly
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // if (data.products?.length) {
        //   setProducts(data.products);
        // } else {
        //   setProducts(mockProducts); // fallback
        // }
        const apiProducts = (data.products || []) as Product[];

      // ✅ merge API + mock data
        const merged = [...apiProducts, ...mockProducts] as Product[];

        // ✅ remove duplicates (based on _id)
        const uniqueProducts = merged.filter(
          (item, index, self) =>
            index === self.findIndex((p) => p._id === item._id)
        );

        setProducts(uniqueProducts);
      })
      .catch(() => setProducts(mockProducts));
  }, []);

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`?${params.toString()}`);
  };

  const clearSearch = () => router.push("/customer/products");

  // ✅ FIX: use products here
  const filtered = useMemo(() => {
    let list = [...products];

    if (urlSearch) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(urlSearch.toLowerCase()) ||
          p.brand?.toLowerCase().includes(urlSearch.toLowerCase()) ||
          p.category?.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }

    if (activeCategory) {
      list = list.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (urlSale) {
      list = list.filter((p) => p.isSale === true);
    }

    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "discount":
        list.sort((a, b) => {
          const discA = a.originalPrice
            ? ((a.originalPrice - a.price) / a.originalPrice) * 100
            : 0;
          const discB = b.originalPrice
            ? ((b.originalPrice - b.price) / b.originalPrice) * 100
            : 0;
          return discB - discA;
        });
        break;
    }

    return list;
  }, [products, activeCategory, sortBy, urlSearch, urlSale]);

  const activeSortLabel = SORT_OPTIONS.find(
    (s) => s.value === sortBy
  )?.label;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-black text-gray-900">
          {urlSearch
            ? `Results for "${urlSearch}"`
            : urlSale
            ? "Sale"
            : activeCategory || "All Products"}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Showing {filtered.length} results
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 md:mb-6 border-b border-gray-100 pb-4 flex-wrap">
        <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[150px]" ref={sortRef}>
          <button
            onClick={() => setShowSort(!showSort)}
            className={`flex items-center justify-between w-full sm:w-auto min-w-[180px] gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-gray-900 cursor-pointer transition-all duration-200 ${
              showSort
                ? "border-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                : "border-gray-300 shadow-sm hover:border-gray-400 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <span>Sort: {activeSortLabel}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                showSort ? "rotate-180" : ""
              }`}
            />
          </button>

          {showSort && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white border border-gray-200 rounded-[14px] p-1.5 w-full sm:w-auto min-w-[200px] sm:min-w-[220px] shadow-[0_10px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden sort-dropdown">
              {SORT_OPTIONS.map((opt, index) => (
                <div key={opt.value}>
                  {(index === 1 || index === 3) && <div className="border-t border-gray-100 my-1" />}
                  <button
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSort(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
                      sortBy === opt.value
                        ? "bg-gray-900 text-white font-semibold"
                        : "text-gray-700 font-normal hover:bg-gray-50 hover:text-gray-900 hover:font-medium"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {urlSearch && (
          <span className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full text-sm">
            🔍 {urlSearch}
            <button onClick={clearSearch}>
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}

        {activeCategory && (
          <span className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-full text-sm">
            {activeCategory}
            <button onClick={clearCategory}>
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>

      {/* Products */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛍️</div>
          <h3 className="text-xl font-bold">No products found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
          {filtered.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsLoadingFallback() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingFallback />}>
      <ProductsPageContent />
    </Suspense>
  );
}
