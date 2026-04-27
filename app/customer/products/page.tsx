"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
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

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlSale = searchParams.get("sale") || "";

  const [sortBy, setSortBy] = useState("relevance");
  const [showSort, setShowSort] = useState(false);

  // ✅ FIX: products state at top
  const [products, setProducts] = useState([]);

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
        const apiProducts = data.products || [];

      // ✅ merge API + mock data
        const merged = [...apiProducts, ...mockProducts];

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
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
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
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {urlSearch
            ? `Results for "${urlSearch}"`
            : urlSale
            ? "Sale"
            : activeCategory || "All Products"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Showing {filtered.length} results
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4 flex-wrap">
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 text-sm font-semibold hover:border-black bg-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Sort: {activeSortLabel}
            <ChevronDown
              className={`w-3.5 h-3.5 ${
                showSort ? "rotate-180" : ""
              }`}
            />
          </button>

          {showSort && (
            <div className="absolute top-12 left-0 z-50 bg-white border rounded-2xl shadow-xl p-2 min-w-[200px]">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setShowSort(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm ${
                    sortBy === opt.value
                      ? "bg-black text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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