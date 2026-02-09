import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { variation = 1 } = await req.json();

    // Different prompt variations for variety
    const prompts = [
      `A minimalist lowercase letter 'q' monogram logo for a journaling app called "Quietly". Hand-drawn style with organic, slightly imperfect brush strokes. Warm terracotta/amber color (#D97706). The tail of the 'q' elegantly curves and flows into a subtle calligraphy pen stroke suggesting writing and reflection. Simple, approachable, cozy, intimate feeling. Clean white background. Suitable for app icon use at small sizes. No text, no words, just the single letter mark. Ultra high resolution.`,
      
      `A hand-lettered lowercase 'q' logo mark for a mindfulness journal app. Soft, warm copper tone with gentle ink-like quality. The descending tail transforms into a graceful quill pen flourish. Organic imperfections give it a personal, human touch. Minimalist design on pure white background. Icon-ready, scalable. No additional text or decorations. Ultra high resolution.`,
      
      `Artisanal lowercase 'q' monogram in warm amber (#B45309). Feels hand-painted with watercolor-like softness at edges. The tail curves into an elegant pen nib shape suggesting journaling. Warm, inviting, personal aesthetic. White background. Perfect for app icon. Single letter only, no text. Ultra high resolution.`
    ];

    const promptIndex = Math.min(variation - 1, prompts.length - 1);
    const prompt = prompts[promptIndex];

    console.log(`Generating logo variation ${variation} with prompt:`, prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response received, extracting image...");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl,
      variation,
      prompt 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Generate logo error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
