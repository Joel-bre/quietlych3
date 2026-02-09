import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { insertJournalEntrySchema, insertUserSettingsSchema, insertPushSubscriptionSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/entries", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      const entries = await storage.getJournalEntries(
        userId,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/dates", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const entries = await storage.getEntriesWithDates(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entry dates:", error);
      res.status(500).json({ error: "Failed to fetch entry dates" });
    }
  });

  app.get("/api/entries/:date", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { date } = req.params;
      const entry = await storage.getJournalEntry(userId, date);
      res.json(entry || null);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ error: "Failed to fetch entry" });
    }
  });

  app.post("/api/entries", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const data = { ...req.body, userId };
      
      const existing = await storage.getJournalEntry(userId, data.entryDate);
      if (existing) {
        const updated = await storage.updateJournalEntry(existing.id, data);
        return res.json(updated);
      }

      const entry = await storage.createJournalEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error saving entry:", error);
      res.status(500).json({ error: "Failed to save entry" });
    }
  });

  app.patch("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateJournalEntry(parseInt(id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating entry:", error);
      res.status(500).json({ error: "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteJournalEntry(parseInt(id));
      res.json({ message: "Entry deleted" });
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({ error: "Failed to delete entry" });
    }
  });

  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      let settings = await storage.getUserSettings(userId);
      if (!settings) {
        settings = await storage.createUserSettings({ userId });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      let settings = await storage.getUserSettings(userId);
      if (!settings) {
        settings = await storage.createUserSettings({ userId, ...req.body });
      } else {
        settings = await storage.updateUserSettings(userId, req.body);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.post("/api/push-subscription", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { endpoint, p256dh, auth } = req.body;

      const existing = await storage.getPushSubscription(userId, endpoint);
      if (existing) {
        return res.json(existing);
      }

      const subscription = await storage.createPushSubscription({
        userId,
        endpoint,
        p256dh,
        auth,
      });
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating push subscription:", error);
      res.status(500).json({ error: "Failed to create push subscription" });
    }
  });

  app.delete("/api/push-subscription", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { endpoint } = req.body;
      await storage.deletePushSubscription(userId, endpoint);
      res.json({ message: "Subscription deleted" });
    } catch (error) {
      console.error("Error deleting push subscription:", error);
      res.status(500).json({ error: "Failed to delete push subscription" });
    }
  });

  app.post("/api/analyze", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { type, startDate, endDate, question } = req.body;

      const entries = await storage.getJournalEntries(userId, startDate, endDate);

      if (!entries || entries.length === 0) {
        return res.json({
          summary: "No journal entries found for this period.",
          answer: "I couldn't find any journal entries to analyze.",
        });
      }

      const INFOMANIAK_API_KEY = process.env.INFOMANIAK_API_KEY;
      const INFOMANIAK_PRODUCT_ID = process.env.INFOMANIAK_PRODUCT_ID;

      if (!INFOMANIAK_API_KEY || !INFOMANIAK_PRODUCT_ID) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      const entriesText = entries
        .map(
          (e) =>
            `Date: ${e.entryDate}\n` +
            `Mood Score: ${e.moodRating || "Not recorded"}/5\n` +
            `Feelings: ${e.howDoYouFeel || "N/A"}\n` +
            `Achievements: ${e.achievements || "N/A"}\n` +
            `Learnings: ${e.learnings || "N/A"}\n` +
            `Grateful for: ${e.gratefulFor || "N/A"}\n` +
            `Challenges: ${e.challenges || "N/A"}\n` +
            `Something funny: ${e.somethingFunny || "N/A"}\n` +
            `Notes: ${e.generalNotes || "N/A"}`
        )
        .join("\n\n---\n\n");

      const infomaniakApiUrl = `https://api.infomaniak.com/1/ai/${INFOMANIAK_PRODUCT_ID}/openai/chat/completions`;

      let systemPrompt: string;
      let userMessage: string;

      if (type === "mood-correlation") {
        const entriesWithMood = entries.filter((e) => e.moodRating !== null);
        if (entriesWithMood.length < 3) {
          return res.json({
            error: "insufficient_data",
            message: `You need at least 3 entries with mood ratings for meaningful analysis. Currently you have ${entriesWithMood.length}.`,
          });
        }

        systemPrompt = `### Role
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
        userMessage = `Analyze these journal entries:\n\n${entriesText}`;
      } else if (type === "summary") {
        systemPrompt = `You are a supportive journaling coach and reflective psychologist.
Your job is to analyze a series of daily journal entries and return a well-structured, psychologically insightful summary in the same language used in most of the entries.
The user has selected a specific time period in the app.
You receive all entries for that period as plain text, separated by lines containing three dashes ---.
Each entry follows this structure (some fields may be empty or contain "N/A"):
Date: YYYY-MM-DD
Mood Score: X/5
Feelings: ...
Achievements: ...
Learnings: ...
Grateful for: ...
Challenges: ...
Something funny: ...
Notes: ...

Your goals:
1. Help the user notice emotional and cognitive patterns over this period.
2. Highlight helpful themes (gratitude, achievements, learnings, humor).
3. Identify recurring challenges and thinking patterns that may be holding them back.
4. Offer 1-2 concrete, realistic habit suggestions that fit what they actually wrote.
5. End with one concise "Key Insight" that feels like a meaningful takeaway.

Very important style guidelines:
- Use a warm, supportive coaching tone.
- Be validating, but you may be gently challenging when it helps the user grow.
- Do not use medical or diagnostic language. Do not mention disorders, diagnoses, medication, or therapy types.
- Stay within the content of the entries. Do not invent specific events or emotions that were not mentioned.
- If some sections had no meaningful content across entries, briefly say that they were rarely or not used instead of forcing an interpretation.
- Keep the response around 400-600 words so it feels substantial but not overwhelming.
- Write in the same language as the majority of the entries.

Analysis focus:
- Emotional patterns: Look for recurring feelings and mood score tendencies. Note when moods tend to be higher or lower, and any clear triggers or contexts mentioned.
- Gratitude themes: Identify what the user is most often grateful for (e.g., people, autonomy, routines, health, nature). Connect these to their values or what gives them energy.
- Achievements & growth: Notice what they count as "wins" (big or small). Point out signs of progress, self-efficacy, and any increase in celebrating small wins.
- Challenges & cognitive patterns: Identify recurring types of challenges (e.g., procrastination, perfectionism, conflict, self-doubt). Notice any unhelpful thinking patterns (e.g., harsh self-criticism, all-or-nothing thinking, catastrophizing, minimising successes) based on their wording. Reflect these patterns back in a non-judgmental way and, when useful, gently challenge them.
- Humor & lightness: If "Something funny" or notes show humor or light moments, highlight how they use humor or lightness, especially during hard days.
- Outliers: Briefly point out any especially unusual days (e.g., much higher or lower mood score, very intense entry) and what seemed different.

Structure your response as clear sections with short paragraph blocks (not bullet lists).
Use markdown ## headings for each section title so they stand out visually:
## Mood & Emotions
## Gratitude & What Matters to You
## Achievements & Signs of Progress
## Challenges & Thinking Patterns
## Humor & Light Moments (only if there were relevant entries)
## Concrete Suggestions (1-2 habits)
## Key Insight

Only include a section if there was at least some content for it in the entries, but always include the "Key Insight" section at the end.

In your "Concrete Suggestions" section:
- Give 1-2 specific, realistic habits or micro-actions that clearly connect to the patterns you described.
- Make them practical and doable (e.g., "At the end of each workday, write down one small thing you handled well, especially on stressful days").
- When useful, briefly reference specific entries (e.g., "On 2026-02-05 you felt calmer after finishing a task; you could build a small routine around that.").
- You may quote short snippets from the entries if they help illustrate a pattern, but keep quotes brief and respectful.`;
        userMessage = `Now analyze the following entries for the selected period and respond with your structured coaching summary and recommendations:\n\n${entriesText}`;
      } else if (type === "question") {
        systemPrompt = `You are a helpful assistant that answers questions about the user's journal entries. Only use information from the provided entries.`;
        userMessage = `Based on these journal entries:\n\n${entriesText}\n\nQuestion: ${question}`;
      } else {
        return res.status(400).json({ error: "Invalid analysis type" });
      }

      const response = await fetch(infomaniakApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral3",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", response.status, errorText);
        return res.status(500).json({ error: "AI service error" });
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (type === "mood-correlation") {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return res.json({
              analysis,
              entriesAnalyzed: entries.length,
              entriesWithMood: entries.filter((e) => e.moodRating !== null).length,
            });
          }
        } catch (parseError) {
          console.error("Failed to parse AI response");
        }
      }

      res.json({
        summary: content,
        answer: content,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  app.post("/api/transcribe", requireAuth, async (req, res) => {
    try {
      const { audio } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "No audio provided" });
      }

      const INFOMANIAK_API_KEY = process.env.INFOMANIAK_API_KEY;
      const INFOMANIAK_PRODUCT_ID = process.env.INFOMANIAK_PRODUCT_ID;

      if (!INFOMANIAK_API_KEY || !INFOMANIAK_PRODUCT_ID) {
        return res.status(500).json({ error: "Transcription service not configured" });
      }

      const binaryString = Buffer.from(audio, "base64");
      const blob = new Blob([binaryString], { type: "audio/webm" });
      const file = new File([blob], "audio.webm", { type: "audio/webm" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper");

      const response = await fetch(
        `https://api.infomaniak.com/1/ai/${INFOMANIAK_PRODUCT_ID}/openai/audio/transcriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Transcription API error:", response.status, errorText);
        return res.status(500).json({ error: "Transcription failed", details: errorText });
      }

      const submitResult = await response.json();
      console.log("Transcription submit response:", JSON.stringify(submitResult));

      // Check if it's a batch/async response
      if (submitResult.batch_id) {
        // Poll for the result
        const batchId = submitResult.batch_id;
        const maxAttempts = 30;
        const pollInterval = 1000; // 1 second

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));

          const statusResponse = await fetch(
            `https://api.infomaniak.com/1/ai/${INFOMANIAK_PRODUCT_ID}/results/${batchId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
              },
            }
          );

          if (!statusResponse.ok) {
            console.error("Transcription status error:", statusResponse.status);
            continue;
          }

          const statusResult = await statusResponse.json();
          console.log("Transcription status:", JSON.stringify(statusResult));

          if (statusResult.status === "failed") {
            return res.status(500).json({ error: "Transcription failed" });
          }

          if (statusResult.status === "success" || statusResult.status === "completed") {
            let text = "";
            if (typeof statusResult.data === "string") {
              try {
                const parsed = JSON.parse(statusResult.data);
                text = parsed.text || "";
              } catch {
                text = statusResult.data;
              }
            } else if (statusResult.data?.text) {
              text = statusResult.data.text;
            } else if (statusResult.text) {
              text = statusResult.text;
            }
            return res.json({ text: text.trim() });
          }
        }

        return res.status(500).json({ error: "Transcription timeout" });
      }

      // Direct response (synchronous)
      const text = submitResult.data?.text || submitResult.text || "";
      res.json({ text });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: "Transcription failed" });
    }
  });

  app.delete("/api/auth/account", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.deleteUser(userId);
      req.logout((err) => {
        if (err) {
          console.error("Logout error after account deletion:", err);
        }
        req.session.destroy(() => {
          res.json({ message: "Account and all data deleted successfully" });
        });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.get("/api/vapid-key", (req, res) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return res.status(500).json({ error: "VAPID key not configured" });
    }
    res.json({ publicKey: vapidPublicKey });
  });
}
