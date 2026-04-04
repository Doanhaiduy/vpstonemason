import { NextResponse } from 'next/server';

const DEFAULT_SYSTEM_PROMPT = `You are an expert stone & design consultant for vpstonemason, a premium Australian kitchen stone showroom in Melbourne.

Your role:
- Help customers choose the right stone (Marble, Granite, Quartz, Porcelain, CSF Stone, Quartzite)
- Explain differences between stone types, finishes (polished, honed, leathered), and care
- Give general pricing guidance (budget ranges only, never exact)
- Recommend visiting the showroom at 123 Stone Avenue, Richmond VIC 3121

Rules:
- Be concise, professional, and friendly. Keep responses under 200 words.
- ONLY discuss stones, renovations, kitchens, bathrooms, and the showroom.
- NEVER invent stone names, prices, or specs. If unsure say: "I'd recommend calling us at (03) 9000 0000 for specific details."
- For unrelated questions, say: "I specialise in stone & renovation advice. For that question, I'd suggest contacting the relevant service."`;

async function getSystemPrompt(): Promise<string> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://pvstone.com.au/api';
    const res = await fetch(`${apiUrl}/showroom`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      if (data?.aiSystemPrompt) return data.aiSystemPrompt;
    }
  } catch {}
  return DEFAULT_SYSTEM_PROMPT;
}

async function isAiEnabled(): Promise<boolean> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://pvstone.com.au/api';
    const res = await fetch(`${apiUrl}/showroom`, { next: { revalidate: 300 } });
    if (!res.ok) return true;

    const data = await res.json();
    return data?.aiEnabled !== false;
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  try {
    const aiEnabled = await isAiEnabled();
    if (!aiEnabled) {
      return NextResponse.json({
        reply: 'AI assistant is currently disabled. Please contact us at (03) 9000 0000 for assistance.'
      });
    }

    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      return NextResponse.json({
        reply: "Hello! I'm the vpstonemason AI Assistant. My AI service isn't configured yet (missing GEMINI_API_KEY). Please contact us at (03) 9000 0000 or visit our showroom for expert advice!"
      });
    }

    const systemPrompt = await getSystemPrompt();

    // Build conversation history for multi-turn
    const contents = [
      { role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS (follow these strictly):\n${systemPrompt}` }] },
      { role: 'model', parts: [{ text: 'Understood. I will follow these instructions strictly. How can I help you today?' }] },
    ];

    // Add conversation history (last 10 messages max)
    const recentMessages = messages.slice(-10);
    for (const msg of recentMessages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.9,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API Error:', await response.text());
      return NextResponse.json({ reply: "Sorry, I'm having a brief technical issue. Please try again or call us at (03) 9000 0000." }, { status: 500 });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response. Please contact us directly at (03) 9000 0000.";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ reply: 'Sorry, something went wrong. Please try again.' }, { status: 500 });
  }
}
