import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error in save-onboarding:", authError);
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      has_listing,
      property_type,
      location_city,
      location_area,
      guest_target,
      improvement_budget,
    } = body;

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();
    const { error: saveError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        has_listing: has_listing ?? false,
        property_type: property_type || "",
        location_city: location_city || "",
        location_area: location_area || "",
        guest_target: guest_target || [],
        improvement_budget: improvement_budget || "",
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (saveError) {
      console.error("Save onboarding error:", JSON.stringify(saveError, null, 2));
      return NextResponse.json(
        { error: saveError.message, details: saveError },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save onboarding route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
