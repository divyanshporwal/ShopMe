import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  stock?: number;
}

export default function ProductCard({
  _id, title, price, originalPrice, images, category, stock,
}: ProductCardProps) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <Link href={`/customer/products/${_id}`} className="group block">
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

        {/* Wishlist button */}
        <button
          className="absolute bottom-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 text-gray-400 hover:text-red-500 hover:scale-110 transition-all"
          onClick={(e) => e.preventDefault()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
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