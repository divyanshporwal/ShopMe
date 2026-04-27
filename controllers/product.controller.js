import Product from "@/models/product.model";

export const createProduct = async (data, user) => {
  if (user.role !== "MERCHANT" || !user.isApproved) {
    throw new Error("Only approved merchants can add products");
  }

  const product = await Product.create({
    ...data,
    merchantId: user._id,
  });

  return product;
};

export const getAllProducts = async (query) => {
  const { page = 1, limit = 10 } = query;

  return await Product.find()
    .skip((page - 1) * limit)
    .limit(Number(limit));
};

export const getSingleProduct = async (id) => {
  const product = await Product.findById(id).populate(
    "merchantId",
    "name email"
  );

  if (!product) throw new Error("Product not found");

  return product;
};

export const updateProduct = async (id, data, user) => {
  const product = await Product.findById(id);

  if (!product) throw new Error("Product not found");

  if (
    product.merchantId.toString() !== user._id.toString() &&
    user.role !== "ADMIN"
  ) {
    throw new Error("Not authorized");
  }

  return await Product.findByIdAndUpdate(id, data, { new: true });
};

export const deleteProduct = async (id, user) => {
  const product = await Product.findById(id);

  if (!product) throw new Error("Product not found");

  if (
    product.merchantId.toString() !== user._id.toString() &&
    user.role !== "ADMIN"
  ) {
    throw new Error("Not authorized");
  }

  await product.deleteOne();

  return { message: "Product deleted" };
};