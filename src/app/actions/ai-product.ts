'use server'

import { GoogleGenAI } from '@google/genai'

export async function extractProductDetailsWithAI(dataUri: string) {
    if (!process.env.GEMINI_API_KEY) {
        return { success: false, error: 'Gemini API key missing. Configure GEMINI_API_KEY.' }
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

        // Extract base64 part and mime type from dataUri
        const mimeTypeMatch = dataUri.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
        const base64Data = dataUri.split(',')[1] || dataUri;

        if (!base64Data) {
            return { success: false, error: 'Invalid image data' }
        }

        const prompt = `You are a strict product data extraction assistant analyzing retail packaging to ensure government e-commerce compliance. Extract the information from the provided image. The return MUST be strictly a RAW JSON object without any markdown formatting, backticks, or code blocks. The JSON must contain exactly these keys: "productName" (string), "description" (string), "mrp" (number), "netQuantityOrWeight" (string), "manufacturerDetails" (string), "countryOfOrigin" (string), "ageGroup" (string), "material" (string), "expiryDate" (string). If any field cannot be identified, return null for it.`

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]
        })

        const responseText = response.text

        // Clean up markdown in case the model ignored raw JSON instructions
        let cleanJsonStr = responseText.trim()
        if (cleanJsonStr.startsWith('```json')) {
            cleanJsonStr = cleanJsonStr.replace(/^```json/, '').replace(/```$/, '').trim()
        } else if (cleanJsonStr.startsWith('```')) {
            cleanJsonStr = cleanJsonStr.replace(/^```/, '').replace(/```$/, '').trim()
        }

        const jsonResult = JSON.parse(cleanJsonStr);
        return { success: true, data: jsonResult }

    } catch (err: any) {
        console.error('AI Extraction exception:', err);
        return { success: false, error: err.message || 'Failed to process AI extraction' }
    }
}
