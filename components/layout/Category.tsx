"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Face Makeup", "Perfumes", "Moisturizers", "Hair Masks",
  "Cleansers", "Serums", "Eye Makeup", "Nightwear", "Hoodie", "Sneakers",
];

export default function Category() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "";

  const handleSelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", cat === active ? "" : cat);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleSelect(cat)}
          className={cn(
            "whitespace-nowrap px-4 py-1.5 rounded-full text-sm border transition",
            active === cat
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}