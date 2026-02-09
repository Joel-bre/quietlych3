
# Infomaniak AI Migration Plan
## Core Edge Functions: transcribe-audio and analyze-journal

This plan updates the two core edge functions to use Infomaniak's Swiss AI APIs, achieving full data sovereignty.

---

## Overview

| Function | Current Provider | New Provider | Change Complexity |
|----------|-----------------|--------------|-------------------|
| `transcribe-audio` | OpenAI Whisper SDK | Infomaniak Whisper API | Low |
| `analyze-journal` | Lovable AI Gateway | Infomaniak LLM (Mistral) | Medium |

---

## Prerequisites

Before implementation, you need to add these secrets to your **new Swiss Supabase project**:

| Secret Name | Where to Find |
|-------------|---------------|
| `INFOMANIAK_API_KEY` | Infomaniak Manager > API > Create Token |
| `INFOMANIAK_PRODUCT_ID` | AI Tools Dashboard > Your product ID |

---

## Changes Summary

### 1. transcribe-audio Function

**Current approach:**
- Uses OpenAI SDK (`openai@4.20.1`)
- Calls `openai.audio.transcriptions.create()`
- Requires `OPENAI_API_KEY`

**New approach:**
- Direct fetch to Infomaniak API
- OpenAI-compatible endpoint format
- Requires `INFOMANIAK_API_KEY` and `INFOMANIAK_PRODUCT_ID`

**Key code change:**
```typescript
// Remove OpenAI import and SDK usage
// Replace with direct fetch:
const formData = new FormData();
formData.append("file", file);
formData.append("model", "whisper-1");

const response = await fetch(
  `https://api.infomaniak.com/2/ai/${PRODUCT_ID}/openai/v1/audio/transcriptions`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${INFOMANIAK_API_KEY}` },
    body: formData,
  }
);
```

---

### 2. analyze-journal Function

**Current approach:**
- Fetches Lovable AI Gateway at `https://ai.gateway.lovable.dev/v1/chat/completions`
- Uses `google/gemini-3-flash-preview` model
- Uses OpenAI-style `tools` and `tool_choice` for structured output
- Requires `LOVABLE_API_KEY`

**New approach:**
- Fetch Infomaniak API at `https://api.infomaniak.com/2/ai/{product_id}/openai/v1/chat/completions`
- Use `mistral` or `llama-3.1-70b` model
- Use JSON schema in prompt for structured output (safer cross-model compatibility)
- Requires `INFOMANIAK_API_KEY` and `INFOMANIAK_PRODUCT_ID`

**Handling structured output:**
Since tool calling support varies by model, the safest approach is to instruct the model to return JSON directly:

```typescript
messages: [
  {
    role: "system",
    content: `${moodCorrelationPrompt}

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
  "primary_mood_drivers": ["..."],
  "stress_signals": ["..."],
  "behavioral_insights": { "observations": ["..."] },
  "the_laughter_effect": "...",
  "reflective_question": "..."
}`
  },
  { role: "user", content: `Please analyze these journal entries:\n\n${entriesText}` }
]
```

Then parse the response:
```typescript
const content = aiResponse.choices[0].message.content;
const analysis = JSON.parse(content);
```

---

## Implementation Details

### File: supabase/functions/transcribe-audio/index.ts

1. Remove the OpenAI import (line 3)
2. Add Infomaniak credential retrieval
3. Replace OpenAI SDK call with Infomaniak fetch
4. Parse response and return text

### File: supabase/functions/analyze-journal/index.ts

1. Remove the OpenAI import (line 3, unused but present)
2. Replace `LOVABLE_API_KEY` with `INFOMANIAK_API_KEY` and `INFOMANIAK_PRODUCT_ID`
3. Update API URL from Lovable Gateway to Infomaniak
4. Change model from `google/gemini-3-flash-preview` to `mistral`
5. For `mood-correlation` type: Remove `tools`/`tool_choice`, use JSON-in-prompt approach
6. For `summary` and `question` types: Simple endpoint/model swap (no structural changes)

### File: supabase/config.toml

1. Add JWT verification settings for both functions (already using `verify_jwt = false` pattern in code)

---

## Technical Details

### Infomaniak API Endpoints

| Feature | Endpoint |
|---------|----------|
| Chat/LLM | `https://api.infomaniak.com/2/ai/{product_id}/openai/v1/chat/completions` |
| Whisper | `https://api.infomaniak.com/2/ai/{product_id}/openai/v1/audio/transcriptions` |

### Model Recommendations

| Use Case | Infomaniak Model | Reasoning |
|----------|------------------|-----------|
| Journal Analysis | `mistral` | Good reasoning, fast, Swiss-hosted |
| Transcription | `whisper-1` | Standard Whisper, OpenAI-compatible |

### Error Handling Updates

Current code handles Lovable-specific errors (402 for credits, 429 for rate limits). Update to handle Infomaniak-specific responses:
- 401: Invalid API key
- 429: Rate limit (keep existing handling)
- 500: Server error

---

## Testing Plan

After deployment:

1. **Test transcription**: Record a short voice note in the app
2. **Test journal summary**: Create entries and request AI insights
3. **Test mood correlation**: Ensure structured JSON parsing works
4. **Test question answering**: Ask a question about journal entries

---

## Secrets Summary

**Add to new Swiss Supabase:**
- `INFOMANIAK_API_KEY`
- `INFOMANIAK_PRODUCT_ID`

**No longer needed:**
- `OPENAI_API_KEY` (was for Whisper)
- `LOVABLE_API_KEY` (was for AI Gateway)

---

## Files to Modify

```text
supabase/functions/transcribe-audio/index.ts
  - Remove OpenAI SDK import
  - Replace with Infomaniak Whisper API call
  - Update error handling

supabase/functions/analyze-journal/index.ts
  - Replace Lovable AI Gateway with Infomaniak LLM
  - Update model to "mistral"
  - Convert tool_choice to JSON-in-prompt approach
  - Update API URL and authentication

supabase/config.toml
  - Add function configurations with verify_jwt = false
```
