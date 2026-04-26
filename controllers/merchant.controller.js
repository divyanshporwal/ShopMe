import MerchantRequest from "@/models/merchantRequest.model";

export const createMerchantRequest = async (userId) => {
  const existing = await MerchantRequest.findOne({ userId });

  if (existing) {
    throw new Error("Request already exists");
  }

  return await MerchantRequest.create({ userId });
};