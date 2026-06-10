import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["CUSTOMER", "MERCHANT", "ADMIN"],
      default: "CUSTOMER",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Number,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Number,
      default: null,
    },
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: [],
    }],
    savedAddresses: [{
      fullName:    String,
      mobile:      String,
      address1:    String,
      address2:    String,
      city:        String,
      state:       String,
      pincode:     String,
      addressType: String,
      isDefault:   { type: Boolean, default: false },
    }],
  },
  { timestamps: true }
);

if (mongoose.models.User && (!mongoose.models.User.schema.path('wishlist') || !mongoose.models.User.schema.path('savedAddresses'))) {
  delete mongoose.models.User;
}

export default mongoose.models.User ||
  mongoose.model("User", userSchema);