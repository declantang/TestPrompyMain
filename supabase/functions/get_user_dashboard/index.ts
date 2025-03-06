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

    // Get saved competitions
    const { data: savedCompetitions, error: savedError } = await supabaseClient
      .from("saved_competitions")
      .select(
        `
        id,
        competition_id,
        competitions!inner(*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Get active participations
    const { data: activeParticipations, error: activeError } =
      await supabaseClient
        .from("competition_participants")
        .select(
          `
          id,
          status,
          progress,
          competitions!inner(*)
        `,
        )
        .eq("user_id", user.id)
        .in("status", ["pending", "submitted", "reviewing"])
        .order("created_at", { ascending: false });

    // Get past participations
    const { data: pastParticipations, error: pastError } = await supabaseClient
      .from("competition_participants")
      .select(
        `
        id,
        status,
        result,
        position,
        competitions!inner(*)
      `,
      )
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    // Get user achievements
    const { data: achievements, error: achievementsError } =
      await supabaseClient
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);

    // Get user stats
    const stats = {
      competitionsJoined:
        (activeParticipations?.length || 0) + (pastParticipations?.length || 0),
      competitionsWon:
        pastParticipations?.filter((p) => p.result === "winner").length || 0,
      savedCompetitions: savedCompetitions?.length || 0,
    };

    if (savedError || activeError || pastError || achievementsError) {
      throw new Error("Error fetching user data");
    }

    return new Response(
      JSON.stringify({
        savedCompetitions:
          savedCompetitions?.map((sc) => sc.competitions) || [],
        activeParticipations:
          activeParticipations?.map((ap) => ({
            ...ap.competitions,
            status: ap.status,
            progress: ap.progress,
          })) || [],
        pastParticipations:
          pastParticipations?.map((pp) => ({
            ...pp.competitions,
            result: pp.result,
            position: pp.position,
          })) || [],
        achievements: achievements || [],
        stats,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
