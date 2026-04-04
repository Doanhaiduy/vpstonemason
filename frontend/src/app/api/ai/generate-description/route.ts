import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, category, finish, applications } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      return NextResponse.json({
        description: `${name} is a premium ${category || 'natural'} stone, perfect for ${(applications || ['kitchen']).join(', ')} applications. Available in a ${finish || 'polished'} finish, this stone combines timeless beauty with exceptional durability. Visit our Melbourne showroom to experience it in person.`,
      });
    }

    const prompt = `Write a professional, SEO-friendly product description (100-150 words) for a stone benchtop product:

Name: ${name}
Category: ${category || 'Natural Stone'}
Finish: ${finish || 'Polished'}
Applications: ${(applications || ['kitchen', 'bathroom']).join(', ')}

Requirements:
- Use Australian English spelling
- Be descriptive about the stone's visual appearance, veining, colour tones
- Mention suitability for the listed applications
- Include care/durability notes if relevant
- Professional tone suitable for a premium showroom website
- Do NOT invent specific technical specifications
- Return ONLY the description text, no JSON or formatting`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ description: '' }, { status: 500 });
    }

    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return NextResponse.json({ description });
  } catch {
    return NextResponse.json({ description: '' }, { status: 500 });
  }
}
