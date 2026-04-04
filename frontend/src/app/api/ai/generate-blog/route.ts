import { NextResponse } from 'next/server';

type BlogPayload = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
};

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

function extractTextFromGemini(data: any): string {
  return data?.text || data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function stripCodeFence(text: string): string {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

function extractLikelyJson(text: string): string {
  const cleaned = stripCodeFence(text);
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return cleaned.slice(first, last + 1);
  }
  return cleaned;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePayload(topic: string, raw: any): BlogPayload {
  const title = typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : topic;
  const excerpt = typeof raw?.excerpt === 'string' && raw.excerpt.trim()
    ? raw.excerpt.trim().slice(0, 220)
    : `A comprehensive guide about ${topic} for Australian homeowners.`;
  const content = typeof raw?.content === 'string' && raw.content.trim()
    ? raw.content.trim()
    : `<p>${escapeHtml(excerpt)}</p>`;
  const tags = Array.isArray(raw?.tags)
    ? raw.tags.map((t: unknown) => String(t || '').trim()).filter(Boolean).slice(0, 8)
    : ['guide'];

  return {
    title,
    excerpt,
    content,
    tags: tags.length > 0 ? tags : ['guide'],
  };
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2500, topP: 0.9 },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    const error: any = new Error(`Gemini error (${response.status}): ${errText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function callGeminiWithRetry(prompt: string, apiKey: string, model: string): Promise<any> {
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callGemini(prompt, apiKey, model);
    } catch (error: any) {
      lastError = error;
      const status = error?.status;

      if (status === 503 && model !== FALLBACK_MODEL) {
        return callGeminiWithRetry(prompt, apiKey, FALLBACK_MODEL);
      }

      if (status === 429 || status === 503) {
        const waitMs = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Gemini retry exceeded');
}

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const normalizedTopic = String(topic || '').trim();
    if (!normalizedTopic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = DEFAULT_MODEL;

    if (!apiKey) {
      return NextResponse.json({
        title: `${normalizedTopic}`,
        excerpt: `A comprehensive guide about ${normalizedTopic} for Australian homeowners.`,
        content: `<h2>About ${escapeHtml(normalizedTopic)}</h2><p>This is a placeholder article. Configure GEMINI_API_KEY in .env.local to enable AI blog generation.</p>`,
        tags: ['guide'],
      });
    }

    const prompt = `You are a professional content writer for vpstonemason, a premium Australian stone benchtop showroom.

Write a complete blog post about the following topic: "${normalizedTopic}"

The article should:
- Be 700-1000 words, informative, and SEO-optimised
- Target Australian homeowners interested in kitchen/bathroom renovation
- Use Australian English spelling (e.g., colour, metre, specialise)
- Include practical advice and expert insights
- Mention stone types where relevant (Marble, Granite, Quartz, Porcelain, CSF Stone, Quartzite)
- Have a warm, professional tone
- NOT include any made-up statistics or fake references

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{"title":"...","excerpt":"...","content":"<h2>...</h2><p>...</p>...","tags":["tag1","tag2"]}

The content field should be valid HTML with <h2>, <h3>, <p>, <ul>, <li> tags.`;

    const firstPass = await callGeminiWithRetry(prompt, apiKey, model);
    const firstText = extractTextFromGemini(firstPass);

    try {
      const jsonText = extractLikelyJson(firstText);
      const parsed = JSON.parse(jsonText);
      return NextResponse.json(normalizePayload(normalizedTopic, parsed));
    } catch {
      // Second pass: ask model to repair/convert into strict JSON.
      const repairPrompt = `Convert the following content into STRICT VALID JSON with exactly keys: title, excerpt, content, tags.
Rules:
- Output only JSON, no markdown
- title/excerpt/content must be strings
- tags must be an array of short lowercase strings
- Keep content as HTML string

SOURCE:
${firstText}`;

      try {
        const secondPass = await callGeminiWithRetry(repairPrompt, apiKey, FALLBACK_MODEL);
        const secondText = extractTextFromGemini(secondPass);
        const repaired = JSON.parse(extractLikelyJson(secondText));
        return NextResponse.json(normalizePayload(normalizedTopic, repaired));
      } catch {
        return NextResponse.json(normalizePayload(normalizedTopic, {
          title: normalizedTopic,
          excerpt: firstText.slice(0, 180) || `A practical guide about ${normalizedTopic}.`,
          content: `<p>${escapeHtml(firstText || `AI generated content for ${normalizedTopic}`)}</p>`,
          tags: ['guide'],
        }));
      }
    }
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
