import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

interface Product {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  images?: string[];
  image?: string;
  category?: string;
  stock?: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard
          key={p._id || p.id}
          _id={p._id || p.id || ""}
          title={p.title || p.name || "Product"}
          price={p.price}
          originalPrice={p.originalPrice}
          images={p.images || (p.image ? [p.image] : [])}
          category={p.category}
          stock={p.stock}
        />
      ))}
    </div>
  );
}
