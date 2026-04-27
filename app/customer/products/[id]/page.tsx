"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <img
        src={product.image}
        className="w-full h-96 object-cover rounded-xl"
      />

      <h1 className="text-2xl font-bold mt-4">{product.title}</h1>
      <p className="text-gray-600 mt-2">{product.description}</p>

      <p className="text-xl font-semibold mt-3">₹{product.price}</p>

      <button
        onClick={() => addToCart(product)}
        className="mt-4 bg-black text-white px-6 py-2 rounded-lg"
      >
        Add to Cart
      </button>
    </div>
  );
}