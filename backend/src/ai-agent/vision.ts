import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { IGear } from '../contracts/IGear.ts';
import dotenv from 'dotenv';

dotenv.config();

export class TackleboxVision {
    private ai: GoogleGenAI;

    constructor() {
        console.log("🔑 Checking API Key Presence:", !!process.env.GEMINI_API_KEY);
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("❌ CRITICAL: GEMINI_API_KEY is not loaded into the Node process! Check your .env file location.");
        }
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    /**
     * Analyzes a raw image of physical fishing gear and extracts a strongly-typed 
     * array of inventory data matching our database schema.
     * @param imageBuffer - The raw file buffer captured from the user's camera
     * @param mimeType - The file type (e.g., 'image/jpeg' or 'image/png')
     */
    public async scanImageToInventory(imageBuffer: Buffer, mimeType: string): Promise<IGear[]> {
        
        // Convert the raw image data into the format the Gemini SDK expects
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType
            },
        };

        // 🛠️ SYSTEM INSTRUCTIONS: Explicit data separation and strict counting rules
        const systemInstruction = `You are a highly precise industrial computer vision agent specialized in fishing tackle inventory processing.
Your job is to analyze the image provided, identify all fishing gear/lures visible, count their quantities, and classify them.

CRITICAL DATA MAPPING RULES:
1. "category" must strictly be one of these exact strings: 'Rod', 'Reel', 'Line', 'Lure', 'Terminal Tackle', 'Accessory'.
2. DO NOT include color description words in the "name" field (e.g., instead of "Green Pumpkin Senko Worm", write "Senko Worm").
3. Extract the visual color, pattern, or finish characteristics and isolate them strictly into the "color" field (e.g., "Chartreuse", "Green Pumpkin", "Chrome/Blue"). If color is completely unidentifiable, use "N/A".
4. Be extremely conservative with quantities. Only count soft plastic worms if you can see a distinct, individual head or whole body. If items overlap and are ambiguous, under-count rather than over-count.
5. Try to identify the brand name if logos or packaging text are visible. Default to "Generic" if unknown.`;

        const userPrompt = "Analyze this image and catalog all fishing gear found into the specified JSON schema structure.";

        // Strict Schema Definition: Enforces an ARRAY of items that perfectly match our IGear database contract
        const responseSchema: Schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { 
                        type: Type.STRING,
                        enum: ['Rod', 'Reel', 'Line', 'Lure', 'Terminal Tackle', 'Accessory'] // Database validation sync
                    },
                    brand: { type: Type.STRING },
                    color: { type: Type.STRING }, 
                    quantity: { type: Type.NUMBER },
                    notes: { type: Type.STRING }
                },
                required: ["name", "category", "color", "quantity"] // Enforce color extraction
            }
        };

        try {
            console.log("📸 Sending pixel data to Gemini Vision Engine...");
            
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [userPrompt, imagePart],
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                    // 🛠️ FORCES DETERMINISTIC COUNTING: Removes "creative guessing" from ambiguous pixels
                    temperature: 0.1 
                }
            });

            const resultText = response.text;
            if (!resultText) throw new Error("Vision engine returned an empty data payload.");

            const inventoryItems: IGear[] = JSON.parse(resultText);
            return inventoryItems;

        } catch (error) {
            console.error("🚨 TackleboxVision failed to scan image:", error);
            throw error;
        }
    }
}