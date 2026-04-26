import MerchantRequest from "@/models/merchantRequest.model";
import User from "@/models/user.model";

export const approveMerchant = async (requestId) => {
  const request = await MerchantRequest.findById(requestId);

  if (!request) throw new Error("Request not found");

  request.status = "APPROVED";
  await request.save();

  await User.findByIdAndUpdate(request.userId, {
    role: "MERCHANT",
    isApproved: true,
  });

  return request;
};