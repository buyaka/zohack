import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Valid categories must match components/ReportFlow.tsx categoryIcons keys
const VALID_CATEGORIES = ['vandalism', 'trash', 'flood', 'roadwork', 'streetLight', 'dust'] as const;
type Category = typeof VALID_CATEGORIES[number];

const SYSTEM_PROMPT = `You are an image classifier for a citizen issue-reporting app used in Mongolia.
Given a photo submitted by a citizen, decide which single category best describes the reported street/public-space issue.

Categories:
- vandalism: damaged/defaced property, graffiti, broken public fixtures caused by intentional damage
- trash: litter, garbage, dumped waste
- flood: standing water, flooding, waterlogged areas
- roadwork: potholes, cracked or damaged road/sidewalk surfaces
- streetLight: broken, fallen, or non-functional street lighting poles/fixtures
- dust: visibly dusty/dirty air or unpaved dusty ground conditions

Respond ONLY with strict JSON, no markdown, no code fences, in this exact shape:
{"category": "<one of: vandalism, trash, flood, roadwork, streetLight, dust>", "confidence": <number 0 to 1>, "isRelevant": <true|false>, "reason": "<short reason, max 15 words, in Mongolian>"}

Set "isRelevant" to false if the photo does NOT depict a plausible public infrastructure/cleanliness issue at all
(e.g. selfies, random objects, pets, food, screenshots, memes, indoor personal photos).
If isRelevant is false, still pick your best-guess category but keep confidence low.
Never include any text outside the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing GEMINI_API_KEY' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageUrl } = body as { imageUrl?: string };

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    // Fetch the image and convert to base64 so we can send inline bytes to Gemini.
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from imageUrl' }, { status: 400 });
    }
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT },
            { inlineData: { mimeType: contentType, data: base64Data } },
          ],
        },
      ],
      config: {
        temperature: 0.2,
        maxOutputTokens: 200,
      },
    });

    const rawText = response.text ?? '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsed: {
      category?: string;
      confidence?: number;
      isRelevant?: boolean;
      reason?: string;
    };

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'AI returned an unparsable response', raw: rawText },
        { status: 502 }
      );
    }

    const category: Category = VALID_CATEGORIES.includes(parsed.category as Category)
      ? (parsed.category as Category)
      : 'trash';

    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0;

    const isRelevant = typeof parsed.isRelevant === 'boolean' ? parsed.isRelevant : true;
    const reason = typeof parsed.reason === 'string' ? parsed.reason.slice(0, 200) : '';

    return NextResponse.json({ category, confidence, isRelevant, reason });
  } catch (err: any) {
    console.error('classify-report error:', err);
    return NextResponse.json(
      { error: 'Internal error classifying report', detail: err?.message },
      { status: 500 }
    );
  }
}
