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

    const { competition_id } = await req.json();

    if (!competition_id) {
      throw new Error("Competition ID is required");
    }

    // Get submissions for the competition
    const { data: submissions, error: submissionsError } = await supabaseClient
      .from("submissions")
      .select(`*, profiles:auth.users(email)`) // Join with users to get email
      .eq("competition_id", competition_id)
      .eq("status", "approved");

    if (submissionsError) throw submissionsError;

    // Format the response to include user email
    const formattedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      user_id: submission.user_id,
      content: submission.content,
      created_at: submission.created_at,
      user_email: submission.profiles?.email || "Unknown",
    }));

    return new Response(JSON.stringify({ submissions: formattedSubmissions }), {
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
