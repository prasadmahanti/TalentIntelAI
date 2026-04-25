/**
 * Optional OpenAI-backed suggestion generator.
 *
 * Usage:
 *   const suggestions = await generateAiSuggestions({ profile, jobDescription, key, model });
 *
 * If `key` is missing this returns null and the caller should fall back to the rule-based
 * suggestion engine in utils/generateSuggestions.js. We never store the key anywhere except
 * the user's own localStorage via the Zustand store.
 */
export async function generateAiSuggestions({
  profile,
  jobDescription,
  key,
  model = 'gpt-4o-mini',
}) {
  if (!key) return null;

  const system = `You are a resume coach. You return STRICT JSON in this shape:
{
  "summary_rewrite": "<one paragraph>",
  "bullet_improvements": ["<bullet 1>", "<bullet 2>", "<bullet 3>"],
  "skills_to_add": ["<skill1>", "<skill2>"],
  "tone_fixes": ["<short suggestion>", "..."]
}
No prose, no markdown, only valid JSON.`;

  const user = `Resume profile:\n${JSON.stringify(profile, null, 2)}\n\nJob description (may be empty):\n${jobDescription || '(none)'}\n\nGive concrete, specific suggestions.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no content.');

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('OpenAI response was not valid JSON.');
  }
}
