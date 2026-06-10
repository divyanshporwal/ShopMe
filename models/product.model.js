import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: [String],
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stock: { type: Number, default: 1, min: [0, 'Quantity cannot be negative'] },
    category: {
      type: String,
      enum: ["Sneakers", "Apparel", "Watches", "Accessories", "Perfumes"],
    },
    brand: { type: String },
    isInstant: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);