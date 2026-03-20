'use server'

import { GoogleGenAI } from '@google/genai'

// ── Strict system prompt — forces JSON-only, emoji bullets, no compliance junk ─
const SCAN_SYSTEM_PROMPT = `You are an expert eCommerce product copywriter for Indian platforms like Amazon India, Flipkart, and Meesho.

Analyze the product image provided and return ONLY a valid JSON object. No text before or after. No markdown. No code blocks. Start with { and end with }.

STRICT OUTPUT RULES:
- Return ONLY raw JSON — nothing else
- Do NOT add "Compliance & Standards", disclaimers, or any extra sections
- Do NOT use markdown formatting or code fences
- Do NOT write anything before { or after }

Description format rules:
- Start with 2-3 engaging sentences (conversational, benefit-focused, vivid)
- Then add EXACTLY 5 emoji bullet points on new lines using this format:
  \\n- [relevant emoji] [short feature benefit, max 60 chars]
- Do NOT add any section after the bullets

JSON structure:
{
  "product_name": "keyword-rich concise name, max 80 chars",
  "short_description": "1-2 punchy sentences, max 150 chars",
  "description": "2-3 engaging sentences here\\n- 🎯 First key benefit\\n- ✨ Second key benefit\\n- 🏆 Third key benefit\\n- 💡 Fourth key benefit\\n- 🎁 Fifth key benefit",
  "key_features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "specifications": {
    "material": "",
    "color": "",
    "dimensions": "",
    "usage": "",
    "weight": "",
    "pack_of": ""
  },
  "seo_keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6"]
}`

const SCAN_USER_MESSAGE = `Analyze this product image. Return ONLY the JSON object described in your instructions. No other text.`

// ── Description-by-name system prompt ─────────────────────────────────────────
const DESC_SYSTEM_PROMPT = `You are an expert eCommerce product copywriter for Indian platforms like Amazon India, Flipkart, and Meesho.

Generate a rich product description based on the product name provided.

STRICT OUTPUT RULES:
- Return ONLY the description text — no JSON, no extra fields, no labels
- Do NOT add "Compliance & Standards" or any extra section
- Do NOT use markdown headers or bold text
- End after the 5th bullet point — nothing after

Description format:
- Start with 2-3 engaging sentences (conversational, benefit-focused, vivid language)
- Then add exactly 5 emoji bullet points on new lines:
  - [relevant emoji] [short feature/benefit, max 70 chars]

Example output style:
Dive into a world of creativity with this premium product, crafted for everyday use and built to last. Perfect for all ages, it combines style with pure functionality.
- 🎯 Built for everyday use — durable and reliable
- ✨ Premium quality materials that feel great
- 🏆 Trusted by thousands of happy customers in India
- 💡 Versatile design works for any occasion
- 🎁 Makes the perfect gift for festivals and birthdays`

// ── Robust JSON extractor — finds first { to last } ──────────────────────────
function parseAIResponse(rawText: string): Record<string, unknown> {
    let text = rawText.trim()
    // Strip markdown fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    // Extract first { … last }
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) {
        throw new Error('AI did not return a JSON object. Please re-scan.')
    }
    text = text.slice(start, end + 1)
    try {
        return JSON.parse(text)
    } catch {
        throw new Error('AI returned malformed JSON. Please re-scan.')
    }
}

// ── Clean trailing junk from description text ─────────────────────────────────
function cleanDescriptionText(text: string): string {
    const cutAt = text.search(/\n---|\*\*Compliance|\*\*Note:|Note:/i)
    return cutAt > -1 ? text.slice(0, cutAt).trim() : text.trim()
}

// ── Server Action 1: Scan product image ───────────────────────────────────────
export async function extractProductDetailsWithAI(dataUri: string) {
    if (!process.env.GEMINI_API_KEY) {
        return { success: false, error: 'Gemini API key missing. Configure GEMINI_API_KEY.' }
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

        const mimeTypeMatch = dataUri.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'
        const base64Data = dataUri.split(',')[1] || dataUri

        if (!base64Data) return { success: false, error: 'Invalid image data' }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                SCAN_SYSTEM_PROMPT + '\n\n' + SCAN_USER_MESSAGE,
                { inlineData: { data: base64Data, mimeType } }
            ]
        })

        const responseText = response.text
        if (!responseText) return { success: false, error: 'AI returned an empty response' }

        const jsonResult = parseAIResponse(responseText)
        return { success: true, data: jsonResult }

    } catch (err: any) {
        console.error('AI Extraction exception:', err)
        return { success: false, error: err.message || 'Failed to process AI extraction' }
    }
}

// ── Server Action 2: Generate description from product name ───────────────────
export async function generateDescriptionByName(productName: string): Promise<string> {
    if (!productName?.trim()) throw new Error('Product name is required')
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key missing.')

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            DESC_SYSTEM_PROMPT,
            `Generate a product description for: "${productName.trim()}". Return only the description text, nothing else.`
        ]
    })

    const text = response.text
    if (!text) throw new Error('AI returned an empty response')

    return cleanDescriptionText(text)
}
