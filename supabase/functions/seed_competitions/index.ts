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

    // Check if competitions table already has data
    const { data: existingData, error: checkError } = await supabaseClient
      .from("competitions")
      .select("id")
      .limit(1);

    if (checkError) throw checkError;

    // If data already exists, return success message
    if (existingData && existingData.length > 0) {
      return new Response(
        JSON.stringify({ message: "Competitions data already exists" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Sample competition data
    const competitions = [
      {
        title: "Logo Design Challenge",
        description:
          "Create a stunning logo for our new tech startup. The winning design will be used as our official brand identity and the designer will receive recognition on our website and social media channels.",
        short_description:
          "Design a logo for a tech startup and win cash prizes.",
        category: "Design",
        type: "Skill",
        entry_requirements: "Free, Email",
        prize: "$500 Cash Prize",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        image_url:
          "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      },
      {
        title: "Photography Contest",
        description:
          "Submit your best nature photography for a chance to be featured in our annual calendar. We're looking for stunning landscapes, wildlife, and macro nature shots that capture the beauty of our natural world.",
        short_description:
          "Submit nature photos for a chance to be featured in our calendar.",
        category: "Photography",
        type: "Skill",
        entry_requirements: "Free, Social Media",
        prize: "Featured in Calendar + $300",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
        image_url:
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      },
      {
        title: "Weekly Giveaway",
        description:
          "Enter our weekly giveaway for a chance to win the latest tech gadgets. This week we're giving away the newest smartphone model that hasn't even hit the stores yet!",
        short_description: "Enter for a chance to win the latest tech gadgets.",
        category: "Technology",
        type: "Luck",
        entry_requirements: "Email, Social Media",
        prize: "Latest Smartphone",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        image_url:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      },
      {
        title: "Content Writing Challenge",
        description:
          "Write a compelling blog post on the future of artificial intelligence. The winning entry will be published on our blog with full attribution and the writer will receive a cash prize.",
        short_description:
          "Write about AI and get published on our popular blog.",
        category: "Writing",
        type: "Skill",
        entry_requirements: "Free, Email",
        prize: "$400 + Publication",
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
        image_url:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      },
      {
        title: "Marketing Strategy Contest",
        description:
          "Develop an innovative marketing strategy for our new product launch. We're looking for fresh ideas that will help us reach new audiences and create buzz around our upcoming release.",
        short_description:
          "Create a marketing strategy for our new product launch.",
        category: "Marketing",
        type: "Skill",
        entry_requirements: "Free, Email",
        prize: "$750 Cash Prize",
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days from now
        image_url:
          "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80",
      },
      {
        title: "Monthly Sweepstakes",
        description:
          "Enter our monthly sweepstakes for a chance to win a luxury weekend getaway for two. Prize includes flights, 5-star hotel accommodation, and spending money.",
        category: "Travel",
        short_description: "Win a luxury weekend getaway for two.",
        type: "Luck",
        entry_requirements: "Purchase, Email",
        prize: "Weekend Getaway ($2000 value)",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        image_url:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      },
    ];

    // Insert the competitions
    const { data, error } = await supabaseClient
      .from("competitions")
      .insert(competitions)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
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
