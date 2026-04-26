export const authorizeRoles = (...allowedRoles) => {
  return (user) => {
    if (!allowedRoles.includes(user.role)) {
      throw new Error("Access denied");
    }

    // extra check for merchant
    if (user.role === "MERCHANT" && !user.isApproved) {
      throw new Error("Merchant not approved");
    }

    return true;
  };
};