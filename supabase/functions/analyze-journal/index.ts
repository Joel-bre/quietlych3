import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ code: 401, message: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !data?.claims) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ code: 401, message: "Invalid JWT" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = data.claims.sub;

    const { type, startDate, endDate, question } = await req.json();

    // Get Infomaniak credentials
    const INFOMANIAK_API_KEY = Deno.env.get("INFOMANIAK_API_KEY");
    const INFOMANIAK_PRODUCT_ID = Deno.env.get("INFOMANIAK_PRODUCT_ID");

    if (!INFOMANIAK_API_KEY || !INFOMANIAK_PRODUCT_ID) {
      console.error("Missing Infomaniak credentials");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's journal entries
    let query = supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false });

    if (startDate && endDate) {
      query = query.gte("entry_date", startDate).lte("entry_date", endDate);
    }

    const { data: entries, error: dbError } = await query.limit(100);
    if (dbError) throw dbError;

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({
          summary: "No journal entries found for this period.",
          answer: "I couldn't find any journal entries to analyze.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const entriesText = entries
      .map(
        (e) =>
          `Date: ${e.entry_date}\n` +
          `Mood Score: ${e.mood_rating || "Not recorded"}/5\n` +
          `Feelings: ${e.how_do_you_feel || "N/A"}\n` +
          `Achievements: ${e.achievements || "N/A"}\n` +
          `Learnings: ${e.learnings || "N/A"}\n` +
          `Grateful for: ${e.grateful_for || "N/A"}\n` +
          `Challenges: ${e.challenges || "N/A"}\n` +
          `Something funny: ${e.something_funny || "N/A"}\n` +
          `Notes: ${e.general_notes || "N/A"}`
      )
      .join("\n\n---\n\n");

    const infomaniakApiUrl = `https://api.infomaniak.com/2/ai/${INFOMANIAK_PRODUCT_ID}/openai/v1/chat/completions`;

    if (type === "mood-correlation") {
      // Check if we have enough entries with mood ratings
      const entriesWithMood = entries.filter((e) => e.mood_rating !== null);
      if (entriesWithMood.length < 3) {
        return new Response(
          JSON.stringify({
            error: "insufficient_data",
            message: `You need at least 3 entries with mood ratings for meaningful analysis. Currently you have ${entriesWithMood.length}.`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const moodCorrelationPrompt = `### Role
You are an expert Psychologist and Data Scientist specializing in Affective Science and Behavioral Tracking. Your goal is to analyze a user's journal entries to uncover hidden correlations between their daily activities, thoughts, and their reported mood.

### Input Data Structure
Each entry includes:
1. Mood Score (1-5): 1 = Terrible, 2 = Bad, 3 = Okay, 4 = Good, 5 = Amazing
2. How they feel (free text)
3. Grateful for
4. Achievements
5. Challenges
6. Learnings
7. Something funny
8. General notes

### Analysis Task
Analyze the provided entries for the following:

1. **Correlation Mapping**: Identify which specific categories (e.g., Gratitude vs. Achievements) have the strongest positive correlation with a high mood score.

2. **Linguistic Markers**: Look for "Lead Indicators." (e.g., Does the user use more "we" pronouns on high-mood days? Does mention of a specific person or project always precede a low-mood day?)

3. **Resilience Analysis**: Specifically analyze the "Learnings" and "Challenges" prompts. Does the act of identifying a learning from a challenge objectively correlate with a mood recovery the following day?

4. **Humor Impact**: Evaluate how "Something funny" acts as a buffer against high-stress "Challenges."

### Constraints
- Do not diagnose mental health conditions.
- Use empathetic, professional, and encouraging language.
- Focus on patterns, not just single events.
- Be specific with your observations, referencing actual content from the entries when possible.

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format (no additional text before or after):
{
  "primary_mood_drivers": ["string array of themes/keywords that appear on high-mood days"],
  "stress_signals": ["string array of early warning signs or triggers"],
  "behavioral_insights": {
    "observations": ["string array of actionable observations with specific patterns"]
  },
  "the_laughter_effect": "string describing how humor influenced mood",
  "reflective_question": "string with one deep, non-judgmental question for self-discovery"
}`;

      console.log(`Calling Infomaniak LLM for mood-correlation analysis, user: ${userId}`);

      const response = await fetch(infomaniakApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral",
          messages: [
            { role: "system", content: moodCorrelationPrompt },
            { role: "user", content: `Please analyze these journal entries:\n\n${entriesText}` },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Infomaniak API error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ error: "Invalid API key configuration" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("AI service error");
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No response from AI");
      }

      // Parse the JSON response from the model
      let analysis;
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", content);
        throw new Error("Failed to parse AI response as JSON");
      }

      return new Response(
        JSON.stringify({
          analysis,
          entriesAnalyzed: entries.length,
          entriesWithMood: entriesWithMood.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "summary") {
      console.log(`Calling Infomaniak LLM for summary, user: ${userId}`);

      const response = await fetch(infomaniakApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral",
          messages: [
            {
              role: "system",
              content: `You are a thoughtful journal analyst. Analyze the user's journal entries and provide meaningful insights. Focus on:
- Emotional patterns and trends
- Recurring themes in achievements and challenges
- Things they're grateful for most often
- Areas of growth and learning
- Suggestions for well-being based on patterns

Be warm, supportive, and insightful. Keep the response concise but meaningful.`,
            },
            {
              role: "user",
              content: `Please analyze these journal entries and provide insights:\n\n${entriesText}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Infomaniak API error:", response.status, errorText);
        throw new Error("AI service error");
      }

      const aiResponse = await response.json();

      return new Response(
        JSON.stringify({ summary: aiResponse.choices[0].message.content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === "question") {
      console.log(`Calling Infomaniak LLM for question, user: ${userId}`);

      const response = await fetch(infomaniakApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that answers questions about the user's journal entries. Only use information from the provided entries. If you cannot find relevant information, say so honestly. Be warm and supportive.`,
            },
            {
              role: "user",
              content: `Based on these journal entries:\n\n${entriesText}\n\nQuestion: ${question}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Infomaniak API error:", response.status, errorText);
        throw new Error("AI service error");
      }

      const aiResponse = await response.json();

      return new Response(
        JSON.stringify({ answer: aiResponse.choices[0].message.content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
