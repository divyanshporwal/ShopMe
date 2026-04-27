"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Loader2 } from "lucide-react";
import Image from "next/image";

const CATEGORIES = ["Sneakers", "Apparel", "Watches", "Accessories", "Perfumes"];

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "1",
    category: "",
    brand: "",
    isSale: false,
    isInstant: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.price || !form.category) {
      setError("Title, price and category are required");
      return;
    }
    if (images.length === 0) {
      setError("Please add at least one product image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, String(val));
      });
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      router.push("/merchant/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-gray-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details to list your product
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images upload */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            Product Images
            <span className="text-black font-normal ml-2">(max 5)</span>
          </h2>

          <div className="flex gap-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <Image src={src} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    MAIN
                  </span>
                )}
              </div>
            ))}

            {images.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition">
                <Plus className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-400 mt-1">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImages}
                />
              </label>
            )}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Basic Information</h2>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Nike Air Force 1 White"
              className="mt-1.5 text-gray-500
               w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe your product..."
              className="mt-1.5 w-full text-gray-500 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. Nike"
                className="mt-1.5 w-full text-gray-500 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1.5 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Pricing & Stock</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="mt-1.5 w-full text-gray-500 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={form.originalPrice}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="mt-1.5 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="1"
                min="0"
                className="mt-1.5 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          {/* Discount preview */}
          {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-green-700 text-sm font-semibold">
                🎉 {Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)}% discount will be shown to customers
              </span>
            </div>
          )}
        </div>

        {/* Flags */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Product Flags</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full transition-all ${form.isSale ? "bg-black" : "bg-gray-200"} relative`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isSale ? "left-5" : "left-1"}`} />
              </div>
              <input
                type="checkbox"
                name="isSale"
                checked={form.isSale}
                onChange={handleChange}
                className="hidden text-gray-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">On Sale</p>
                <p className="text-xs text-gray-500">Show in SALE section</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full transition-all ${form.isInstant ? "bg-black" : "bg-gray-200"} relative`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isInstant ? "left-5" : "left-1"}`} />
              </div>
              <input
                type="checkbox"
                name="isInstant"
                checked={form.isInstant}
                onChange={handleChange}
                className="hidden"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">Instant Delivery</p>
                <p className="text-xs text-gray-500">24hr delivery available</p>
              </div>
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                List Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}