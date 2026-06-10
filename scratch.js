import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(uri);
  const Order = mongoose.model("Order", new mongoose.Schema({
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],
  }));

  try {
    const order = new Order({
      items: [{ productId: "5", quantity: 1, price: 100 }],
    });
    await order.validate();
    console.log("Validated successfully");
  } catch (e) {
    console.error("Validation failed:", e.message);
  }
  mongoose.disconnect();
}
check();
