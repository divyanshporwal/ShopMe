import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [
      {
        productId: {
          type: String,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],

    totalAmount: Number,

    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED"],
      default: "PENDING",
    },

    paymentId: String,

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    deliveryAddress: {
      fullName: String,
      mobile: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      pincode: String,
      addressType: String,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Order && !mongoose.models.Order.schema.path('deliveryAddress')) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);