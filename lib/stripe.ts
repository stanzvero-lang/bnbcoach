import Stripe from "stripe";

// Create client on demand. If STRIPE_SECRET_KEY is missing at runtime the
// Stripe SDK will throw and the route-level try/catch returns a proper 500.
export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}
