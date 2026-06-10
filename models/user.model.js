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
    // Which dashboard view the user is currently in
    activeView: {
      type: String,
      enum: ['CUSTOMER', 'MERCHANT'],
      default: 'CUSTOMER',
    },
    // All roles this user holds (supports dual-role: CUSTOMER + MERCHANT)
    roles: {
      type: [String],
      default: ['CUSTOMER'],
    },
    // Embedded merchant application request
    merchantRequest: {
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
      },
      requestedAt:     { type: Date,   default: null },
      reviewedAt:      { type: Date,   default: null },
      reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      rejectionReason: { type: String, default: null },
      businessName:    { type: String, default: null },
      businessType:    { type: String, default: null },
      businessEmail:   { type: String, default: null },
      businessPhone:   { type: String, default: null },
      businessAddress: { type: String, default: null },
      description:     { type: String, default: null },
    },
  },
  { timestamps: true }
);

// Force model re-registration when schema changes
delete mongoose.models.User;

export default mongoose.models.User ||
  mongoose.model("User", userSchema);