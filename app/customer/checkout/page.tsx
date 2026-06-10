// checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import useAuth from "@/hooks/useAuth";
import showToast from "@/lib/toast";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

interface FormData {
  fullName: string;
  mobile: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  pincode: string;
  state: string;
  addressType: string;
  saveAddress: boolean;
}

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    cart,
    promoApplied,
    promoCode,
    subtotal: getSubtotal,
    shipping: getShipping,
    promoDiscount: getPromoDiscount,
    totalPrice: getTotalPrice,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const promoDiscount = getPromoDiscount();
  const total = getTotalPrice();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobile: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    pincode: "",
    state: "",
    addressType: "Home",
    saveAddress: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Prefill name and email from logged-in user
  useEffect(() => {
    if (user) {
      const u = user as any;
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || u.name || "",
        email: prev.email || u.email || "",
      }));
    }
  }, [user]);

  // Prefill city from localStorage
  useEffect(() => {
    const loc = localStorage.getItem("shopme_location");
    if (loc) {
      setFormData((prev) => ({
        ...prev,
        city: prev.city || loc,
      }));
    }
  }, []);

  // Fetch saved addresses from API
  useEffect(() => {
    fetch("/api/customer/address")
      .then((res) => res.json())
      .then((data) => {
        if (data.savedAddresses) {
          setSavedAddresses(data.savedAddresses);
        }
      })
      .catch((err) => console.error("Error fetching saved addresses", err));
  }, []);

  const handleBlur = (field: keyof FormData) => {
    const val = formData[field];
    let err = "";

    if (field === "fullName") {
      if (!val) err = "Full Name is required";
      else if (typeof val === "string" && val.trim().length < 3)
        err = "Full Name must be at least 3 characters";
    } else if (field === "mobile") {
      if (!val) err = "Mobile Number is required";
      else if (typeof val === "string" && !/^\d{10}$/.test(val))
        err = "Mobile Number must be exactly 10 digits";
    } else if (field === "email") {
      if (!val) err = "Email Address is required";
      else if (
        typeof val === "string" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      )
        err = "Invalid email address";
    } else if (field === "address1") {
      if (!val) err = "Address Line 1 is required";
    } else if (field === "city") {
      if (!val) err = "City is required";
    } else if (field === "pincode") {
      if (!val) err = "Pincode is required";
      else if (typeof val === "string" && !/^\d{6}$/.test(val))
        err = "Pincode must be exactly 6 digits";
    } else if (field === "state") {
      if (!val) err = "State is required";
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full Name must be at least 3 characters";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile Number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile Number must be exactly 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.address1.trim()) {
      newErrors.address1 = "Address Line 1 is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();

    if (!isValid) {
      showToast.error("Please fill all required fields correctly");
      setTimeout(() => {
        const firstErrorEl = document.querySelector(".field-error");
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    try {
      setSubmitting(true);

      // Save delivery details to sessionStorage
      sessionStorage.setItem(
        "shopme_delivery_address",
        JSON.stringify(formData)
      );

      // If "Save this address" is checked, call API
      if (formData.saveAddress) {
        await fetch("/api/customer/address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            mobile: formData.mobile,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            addressType: formData.addressType,
          }),
        });
      }

      showToast.success("Address saved! Proceeding to payment.");
      setTimeout(() => {
        router.push("/customer/checkout/payment");
      }, 800);
    } catch (err) {
      console.error(err);
      showToast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isAddressSelected = (addr: any) => {
    return (
      formData.fullName === addr.fullName &&
      formData.mobile === addr.mobile &&
      formData.address1 === addr.address1 &&
      formData.city === addr.city &&
      formData.state === addr.state &&
      formData.pincode === addr.pincode &&
      formData.addressType === addr.addressType
    );
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-sm">
          <p className="font-semibold text-gray-800 mb-4">
            Your cart is empty
          </p>
          <Link
            href="/customer/products"
            className="inline-block bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href="/customer/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column — Address Form & Saved Addresses */}
          <div className="lg:col-span-8 space-y-8">
            {/* Saved Addresses cards */}
            {savedAddresses.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📦 Saved Addresses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedAddresses.map((addr, idx) => {
                    const selected = isAddressSelected(addr);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setFormData({
                            fullName: addr.fullName || "",
                            mobile: addr.mobile || "",
                            email: addr.email || (user as any)?.email || "",
                            address1: addr.address1 || "",
                            address2: addr.address2 || "",
                            city: addr.city || "",
                            state: addr.state || "",
                            pincode: addr.pincode || "",
                            addressType: addr.addressType || "Home",
                            saveAddress: false,
                          });
                          setErrors({});
                        }}
                        className={`border-2 rounded-2xl p-4 cursor-pointer transition relative ${
                          selected
                            ? "border-black bg-gray-50/30"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full uppercase">
                            {addr.addressType || "Home"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {addr.fullName}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          {addr.mobile}
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {addr.address1}
                          {addr.address2 ? `, ${addr.address2}` : ""},{" "}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Address Form Card */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                Delivery Details
              </h2>

              <form id="address-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        onBlur={() => handleBlur("fullName")}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                      />
                      {errors.fullName && (
                        <p className="field-error text-xs text-red-600 font-medium mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                        onBlur={() => handleBlur("mobile")}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                      />
                      {errors.mobile && (
                        <p className="field-error text-xs text-red-600 font-medium mt-1">
                          {errors.mobile}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      onBlur={() => handleBlur("email")}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                    />
                    {errors.email && (
                      <p className="field-error text-xs text-red-600 font-medium mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address Section */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Delivery Address
                  </h3>

                  {/* Address Line 1 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.address1}
                      onChange={(e) =>
                        setFormData({ ...formData, address1: e.target.value })
                      }
                      onBlur={() => handleBlur("address1")}
                      placeholder="House/Flat No., Building, Street"
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                    />
                    {errors.address1 && (
                      <p className="field-error text-xs text-red-600 font-medium mt-1">
                        {errors.address1}
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.address2}
                      onChange={(e) =>
                        setFormData({ ...formData, address2: e.target.value })
                      }
                      placeholder="Area, Colony, Landmark"
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        onBlur={() => handleBlur("city")}
                        placeholder="Indore"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                      />
                      {errors.city && (
                        <p className="field-error text-xs text-red-600 font-medium mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        State *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        onBlur={() => handleBlur("state")}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="field-error text-xs text-red-600 font-medium mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        onBlur={() => handleBlur("pincode")}
                        placeholder="6-digit PIN"
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                      />
                      {errors.pincode && (
                        <p className="field-error text-xs text-red-600 font-medium mt-1">
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Type & Save Checkbox */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Address Type
                    </label>
                    <div className="flex gap-3">
                      {["Home", "Work", "Other"].map((type) => {
                        const isSelected = formData.addressType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, addressType: type })
                            }
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                              isSelected
                                ? "bg-[#111827] text-white border-[#111827]"
                                : "bg-white text-[#374151] border-[#e5e7eb] hover:bg-gray-50"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={formData.saveAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          saveAddress: e.target.checked,
                        })
                      }
                      className="w-4.5 h-4.5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 font-semibold select-none">
                      Save this address for future orders
                    </span>
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column — Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sticky top-24 space-y-6 shadow-sm">
              <h3 className="text-base font-black text-gray-900 border-b pb-3">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {cart.map((item: any) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span
                    className={`font-semibold ${
                      shipping === 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-purple-600 font-semibold">
                    <span>Discount ({promoCode})</span>
                    <span>-₹{promoDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-black text-gray-900">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Continue to Payment button */}
              <button
                type="submit"
                form="address-form"
                disabled={submitting}
                className="w-full bg-[#111827] text-white py-4 rounded-2xl font-bold text-sm hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Continue to Payment →</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}