import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import slugify from 'slugify';

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiResult {
  text?: string;
  candidates?: GeminiCandidate[];
}

interface FullPostInput {
  topic: string;
  category?: string;
  keywords?: string[];
}

interface FullPostOutput {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  totalTokens: number;
  totalCost: number;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';
const AVG_COST_PER_1K_TOKENS = 0.003125;

function stripCodeFence(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
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

function normalizeKeywords(keywords?: string[]): string[] {
  if (!keywords) return [];
  return keywords
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

function toSafeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function extractText(result: GeminiResult): string {
  if (result?.text?.trim()) return result.text.trim();

  const parts = result?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part?.text || '')
    .join('')
    .trim();

  return text;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  private get apiKey(): string | null {
    const candidateEnvNames = [
      'GEMINI_API_KEY',
      'GOOGLE_API_KEY',
      'GOOGLE_GENERATIVE_AI_API_KEY',
    ];

    for (const envName of candidateEnvNames) {
      const value = this.configService.get<string>(envName);
      if (value?.trim()) {
        return value.trim();
      }
    }

    return null;
  }

  private get model(): string {
    const configured = this.configService.get<string>('GEMINI_MODEL');
    return configured?.trim() || DEFAULT_MODEL;
  }

  private hasApiKey(): boolean {
    return Boolean(this.apiKey);
  }

  private async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async callGemini(
    prompt: string,
    model: string,
    generationConfig?: {
      temperature?: number;
      maxOutputTokens?: number;
      topP?: number;
    },
  ): Promise<GeminiResult> {
    const key = this.apiKey;
    if (!key) {
      throw new BadRequestException('GEMINI_API_KEY is missing on backend');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: generationConfig?.temperature ?? 0.7,
            maxOutputTokens: generationConfig?.maxOutputTokens ?? 2500,
            topP: generationConfig?.topP ?? 0.9,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(
        `Gemini error (${response.status}): ${errorText}`,
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return (await response.json()) as GeminiResult;
  }

  private async generateWithRetry(
    prompt: string,
    options?: { temperature?: number; maxOutputTokens?: number; topP?: number },
  ): Promise<string> {
    let activeModel = this.model;
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        const result = await this.callGemini(prompt, activeModel, options);
        const text = extractText(result);
        if (!text) {
          throw new Error('Gemini returned an empty response');
        }
        return text;
      } catch (error) {
        const status = (error as { status?: number })?.status;

        if (status === 503 && activeModel !== FALLBACK_MODEL) {
          this.logger.warn(
            `Model ${activeModel} overloaded, retrying with fallback ${FALLBACK_MODEL}`,
          );
          activeModel = FALLBACK_MODEL;
          continue;
        }

        if (status === 429 || status === 503) {
          const waitMs = Math.pow(2, attempt) * 1000;
          this.logger.warn(
            `Gemini retry attempt=${attempt + 1} wait=${waitMs}ms`,
          );
          await this.wait(waitMs);
          continue;
        }

        throw error;
      }
    }

    throw new InternalServerErrorException('AI generation retry limit reached');
  }

  private async countTokens(text: string, model: string): Promise<number> {
    const key = this.apiKey;
    if (!key || !text.trim()) return Math.max(1, Math.ceil(text.length / 4));

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:countTokens?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text }] }],
          }),
        },
      );

      if (!response.ok) {
        return Math.max(1, Math.ceil(text.length / 4));
      }

      const data = (await response.json()) as { totalTokens?: number };
      return data?.totalTokens || Math.max(1, Math.ceil(text.length / 4));
    } catch {
      return Math.max(1, Math.ceil(text.length / 4));
    }
  }

  private calculateCost(tokens: number): number {
    return Number(((tokens / 1000) * AVG_COST_PER_1K_TOKENS).toFixed(6));
  }

  private buildFallbackFullPost(input: FullPostInput): FullPostOutput {
    const topic = input.topic.trim();
    const keywords = normalizeKeywords(input.keywords);
    const title = topic;
    const description = `A practical guide about ${topic} for Australian homeowners exploring premium stone surfaces.`;
    const content = `<h2>${escapeHtml(topic)}</h2><p>${escapeHtml(
      'AI full generation is not configured on backend yet. Set GEMINI_API_KEY to enable production-quality output.',
    )}</p>`;
    const tags = keywords.length > 0 ? keywords : ['guide', 'stone'];

    return {
      slug: slugify(title || topic, { lower: true, strict: true }),
      title,
      description,
      content,
      tags,
      totalTokens: 0,
      totalCost: 0,
    };
  }

  async generateTitle(topic: string, keywords?: string[]) {
    const normalizedTopic = String(topic || '').trim();
    if (!normalizedTopic) {
      throw new BadRequestException('Topic is required');
    }

    const normalizedKeywords = normalizeKeywords(keywords);

    if (!this.hasApiKey()) {
      return { title: normalizedTopic, tokensUsed: 0, cost: 0 };
    }

    const keywordText =
      normalizedKeywords.length > 0
        ? `Keywords: ${normalizedKeywords.join(', ')}`
        : '';

    const prompt = `Generate a catchy, SEO-friendly blog title for PVStone (premium Australian stone showroom).
Topic: "${normalizedTopic}"
${keywordText}

Requirements:
- 50-70 characters
- Natural, readable, and click-worthy
- Suitable for Australian homeowners
- Return ONLY the title text`;

    const generated = await this.generateWithRetry(prompt, {
      temperature: 0.8,
      maxOutputTokens: 200,
      topP: 0.9,
    });

    const tokensUsed = await this.countTokens(
      `${prompt}\n${generated}`,
      this.model,
    );
    return {
      title: generated.replace(/^"|"$/g, '').trim(),
      tokensUsed,
      cost: this.calculateCost(tokensUsed),
    };
  }

  async generateDescription(title: string, keywords?: string[]) {
    const normalizedTitle = String(title || '').trim();
    if (!normalizedTitle) {
      throw new BadRequestException('Title is required');
    }

    const normalizedKeywords = normalizeKeywords(keywords);

    if (!this.hasApiKey()) {
      return {
        description: `Discover practical renovation tips and stone selection insights for ${normalizedTitle}.`,
        tokensUsed: 0,
        cost: 0,
      };
    }

    const keywordText =
      normalizedKeywords.length > 0
        ? `Keywords: ${normalizedKeywords.join(', ')}`
        : '';

    const prompt = `Generate a compelling meta description for this blog title: "${normalizedTitle}".
${keywordText}

Requirements:
- 150-170 characters
- Include practical value and intent
- Australian English
- Return ONLY the description text`;

    const generated = await this.generateWithRetry(prompt, {
      temperature: 0.7,
      maxOutputTokens: 260,
      topP: 0.9,
    });

    const tokensUsed = await this.countTokens(
      `${prompt}\n${generated}`,
      this.model,
    );
    return {
      description: generated.replace(/^"|"$/g, '').trim(),
      tokensUsed,
      cost: this.calculateCost(tokensUsed),
    };
  }

  async generateContent(
    title: string,
    description: string,
    keywords?: string[],
  ) {
    const normalizedTitle = String(title || '').trim();
    const normalizedDescription = String(description || '').trim();

    if (!normalizedTitle || !normalizedDescription) {
      throw new BadRequestException('Title and description are required');
    }

    const normalizedKeywords = normalizeKeywords(keywords);

    if (!this.hasApiKey()) {
      return {
        content: `<h2>${escapeHtml(normalizedTitle)}</h2><p>${escapeHtml(
          normalizedDescription,
        )}</p>`,
        tokensUsed: 0,
        cost: 0,
      };
    }

    const keywordText =
      normalizedKeywords.length > 0
        ? `Keywords: ${normalizedKeywords.join(', ')}`
        : '';

    const prompt = `Write a complete HTML blog article for PVStone.
Title: "${normalizedTitle}"
Description: "${normalizedDescription}"
${keywordText}

Requirements:
- 900-1300 words
- Australian English
- Use valid HTML only: <h2>, <h3>, <p>, <ul>, <li>, <blockquote>
- No markdown, no code fences
- Practical and expert-focused for stone benchtops
- Return ONLY the HTML content`;

    const generated = await this.generateWithRetry(prompt, {
      temperature: 0.75,
      maxOutputTokens: 3200,
      topP: 0.9,
    });

    const tokensUsed = await this.countTokens(
      `${prompt}\n${generated}`,
      this.model,
    );

    return {
      content: generated.trim(),
      tokensUsed,
      cost: this.calculateCost(tokensUsed),
    };
  }

  async generateFullPost(input: FullPostInput): Promise<FullPostOutput> {
    const normalizedTopic = String(input.topic || '').trim();
    if (!normalizedTopic) {
      throw new BadRequestException('Topic is required');
    }

    if (!this.hasApiKey()) {
      throw new ServiceUnavailableException(
        'AI generation is unavailable on backend. Missing GEMINI_API_KEY (or GOOGLE_API_KEY) in runtime environment.',
      );
    }

    const normalizedKeywords = normalizeKeywords(input.keywords);
    const categoryText = input.category
      ? `Primary category context: ${input.category}`
      : 'Primary category context: Stone renovation guide';
    const keywordsText =
      normalizedKeywords.length > 0
        ? `Keywords: ${normalizedKeywords.join(', ')}`
        : 'Keywords: kitchen benchtop, stone surface, Melbourne showroom';

    const prompt = `You are a professional writer for PVStone, a premium Australian stone showroom.

Write one complete blog post package about: "${normalizedTopic}".
${categoryText}
${keywordsText}

Output STRICT VALID JSON only, with exactly these keys:
{"title":"...","description":"...","content":"<h2>...</h2><p>...</p>","tags":["tag1","tag2"]}

Rules:
- title: 50-80 chars, clear and compelling
- description: 140-180 chars, useful and SEO-friendly
- content: valid HTML only (no markdown/code fences), include <h2>, <h3>, <p>, <ul>, <li>, <blockquote>
- content length: 900-1300 words
- Australian English spelling
- Tone: practical, expert, trustworthy
- tags: 3-8 lowercase tags`;

    const rawFirst = await this.generateWithRetry(prompt, {
      temperature: 0.8,
      maxOutputTokens: 3800,
      topP: 0.92,
    });

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(extractLikelyJson(rawFirst)) as Record<
        string,
        unknown
      >;
    } catch {
      const repairPrompt = `Convert the following text into STRICT VALID JSON with keys title, description, content, tags.
Rules:
- Return ONLY JSON
- title/description/content must be strings
- tags must be an array of short lowercase strings
- content must remain HTML

SOURCE:
${rawFirst}`;

      const repaired = await this.generateWithRetry(repairPrompt, {
        temperature: 0.2,
        maxOutputTokens: 2200,
        topP: 0.8,
      });

      try {
        parsed = JSON.parse(extractLikelyJson(repaired)) as Record<
          string,
          unknown
        >;
      } catch {
        parsed = null;
      }
    }

    if (!parsed) {
      this.logger.warn(
        'AI full-post JSON parsing failed, returning safe fallback output',
      );
      return {
        ...this.buildFallbackFullPost(input),
        content: `<p>${escapeHtml(rawFirst)}</p>`,
      };
    }

    const title = toSafeString(parsed.title).trim() || normalizedTopic;
    const description =
      toSafeString(parsed.description).trim() ||
      `A practical guide about ${normalizedTopic} for Australian homeowners.`;
    const content =
      toSafeString(parsed.content).trim() ||
      `<p>${escapeHtml(description)}</p>`;

    const tagsFromAi = Array.isArray(parsed.tags)
      ? parsed.tags
          .map((item) =>
            String(item || '')
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean)
          .slice(0, 8)
      : [];

    const tags =
      tagsFromAi.length > 0
        ? tagsFromAi
        : normalizedKeywords.length > 0
          ? normalizedKeywords.map((item) => item.toLowerCase())
          : ['stone', 'guide', 'renovation'];

    const totalTokens = await this.countTokens(
      `${prompt}\n${rawFirst}`,
      this.model,
    );

    return {
      slug: slugify(title || normalizedTopic, { lower: true, strict: true }),
      title,
      description,
      content,
      tags,
      totalTokens,
      totalCost: this.calculateCost(totalTokens),
    };
  }
}
