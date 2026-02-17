import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function notConfigured() {
  return NextResponse.json(
    { error: "Webhook non ancora configurato. Configura le API key di Stripe nelle variabili d'ambiente." },
    { status: 503 }
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (
    !stripe ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET
  ) {
    return notConfigured();
  }

  // Use service role key for webhooks (no user context)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer) {
        await supabaseAdmin
          .from("profiles")
          .update({ subscription_tier: "pro" })
          .eq("stripe_customer_id", session.customer as string);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_tier: "free" })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
