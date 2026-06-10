import mongoose from 'mongoose';
import { connectDB } from './lib/db.js';
import Product from './models/product.model.js';
import Order from './models/order.model.js';

async function test() {
  await connectDB();
  const products = await Product.find().limit(2);
  console.log("Products:", products.map(p => p._id));
  process.exit(0);
}
test();
