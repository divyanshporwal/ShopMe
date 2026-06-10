import Stripe from "stripe";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function check() {
  try {
    const session = await stripe.checkout.sessions.retrieve("cs_test_b1PftczxJaLlrngZsO3AnkfkGd1Ecf40Y7sFwblu3JPveUAJwYn83Dm9MJ");
    console.log("Metadata:", session.metadata);
  } catch (err) {
    console.error(err.message);
  }
}
check();
