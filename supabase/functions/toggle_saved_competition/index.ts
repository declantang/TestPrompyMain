import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get request body
    const { competitionId, action } = await req.json();

    if (!competitionId || !action) {
      throw new Error("Missing required fields");
    }

    let result;

    if (action === "save") {
      // Check if already saved
      const { data: existing } = await supabaseClient
        .from("saved_competitions")
        .select("id")
        .eq("user_id", user.id)
        .eq("competition_id", competitionId)
        .single();

      if (!existing) {
        // Save the competition
        const { data, error } = await supabaseClient
          .from("saved_competitions")
          .insert({
            user_id: user.id,
            competition_id: competitionId,
          })
          .select()
          .single();

        if (error) throw error;
        result = { action: "saved", data };
      } else {
        result = { action: "already_saved" };
      }
    } else if (action === "unsave") {
      // Remove the saved competition
      const { data, error } = await supabaseClient
        .from("saved_competitions")
        .delete()
        .eq("user_id", user.id)
        .eq("competition_id", competitionId)
        .select();

      if (error) throw error;
      result = { action: "unsaved", data };
    } else {
      throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
