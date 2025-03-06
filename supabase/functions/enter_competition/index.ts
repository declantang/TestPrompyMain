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
    const { competitionId } = await req.json();

    if (!competitionId) {
      throw new Error("Missing competition ID");
    }

    // Check if already participating
    const { data: existing } = await supabaseClient
      .from("competition_participants")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("competition_id", competitionId)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({
          message: "Already participating in this competition",
          status: existing.status,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Enter the competition
    const { data, error } = await supabaseClient
      .from("competition_participants")
      .insert({
        user_id: user.id,
        competition_id: competitionId,
        status: "pending",
        progress: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Check for achievements
    await checkAndUpdateAchievements(supabaseClient, user.id);

    return new Response(
      JSON.stringify({
        message: "Successfully entered competition",
        data,
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

async function checkAndUpdateAchievements(supabaseClient, userId) {
  // Get count of competitions the user has entered
  const { count, error } = await supabaseClient
    .from("competition_participants")
    .select("id", { count: "exact" })
    .eq("user_id", userId);

  if (error) throw error;

  // Check for "First Competition" achievement
  if (count === 1) {
    await updateOrCreateAchievement(
      supabaseClient,
      userId,
      "first_competition",
      1,
      1,
      true,
    );
  }

  // Check for "Competition Enthusiast" achievement
  if (count >= 5) {
    await updateOrCreateAchievement(
      supabaseClient,
      userId,
      "competition_enthusiast",
      5,
      5,
      true,
    );
  }

  // Check for "Competition Master" achievement
  if (count >= 10) {
    await updateOrCreateAchievement(
      supabaseClient,
      userId,
      "competition_master",
      10,
      10,
      true,
    );
  } else if (count > 0) {
    await updateOrCreateAchievement(
      supabaseClient,
      userId,
      "competition_master",
      count,
      10,
      false,
    );
  }
}

async function updateOrCreateAchievement(
  supabaseClient,
  userId,
  achievementId,
  progress,
  maxProgress,
  unlocked,
) {
  // Check if achievement exists
  const { data: existing } = await supabaseClient
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("achievement_id", achievementId)
    .single();

  if (existing) {
    // Update existing achievement
    if (!existing.unlocked && unlocked) {
      await supabaseClient
        .from("user_achievements")
        .update({
          progress,
          unlocked,
          unlocked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else if (progress > existing.progress) {
      await supabaseClient
        .from("user_achievements")
        .update({
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
  } else {
    // Create new achievement
    await supabaseClient.from("user_achievements").insert({
      user_id: userId,
      achievement_id: achievementId,
      progress,
      unlocked,
      unlocked_at: unlocked ? new Date().toISOString() : null,
    });
  }
}
