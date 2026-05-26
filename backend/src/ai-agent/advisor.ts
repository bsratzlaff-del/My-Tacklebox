import { GoogleGenAI, Type, Schema } from '@google/genai';
import { IGear, IWeatherSnapshot, IRecEngineOutput } from '../contracts/IGear.js';
import dotenv from 'dotenv';

dotenv.config();

export class TackleboxAdvisor {
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    public async generateFishingPlan(
        weather: IWeatherSnapshot, 
        currentInventory: IGear[]
    ): Promise<IRecEngineOutput> {
        
        const ownedLures = currentInventory.filter(item => item.category === 'Lure');

        // 🛠️ REFACTORED PROMPT: Explicitly demanding short, high-impact telemetry
        const systemInstruction = `You are a minimalist, high-impact fishing guide app. 
Your goal is to provide punchy, ultra-brief data that a fisherman can read at a glance on a phone screen on a boat.

Rules:
1. "ownedLureRecommendations": Give an emoji, the name, and a 1-sentence action phrase (where/how to throw it). ONLY use owned inventory items.
2. "missingBuySuggestions": Give an emoji, the missing item name, and a brief parenthetical reason why.
3. "onTheWaterTacticalTip": Provide exactly ONE sentence summarizing fish depth and presentation speed. No fluff.`;

        const userPrompt = `
=== TELEMETRY ===
Target: ${weather.locationName}
Water: ${weather.waterTemperatureF}°F | Profile: ${weather.condition} | Pressure: ${weather.barometricPressureIn} inHg

=== INVENTORY ===
${JSON.stringify(ownedLures, null, 2)}
`;

        // 🛠️ REFACTORED SCHEMA: Matches your clean new interface shape
        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                ownedLureRecommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                missingBuySuggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                onTheWaterTacticalTip: { type: Type.STRING }
            },
            required: ["ownedLureRecommendations", "missingBuySuggestions", "onTheWaterTacticalTip"]
        };

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema
                }
            });

            const resultText = response.text;
            if (!resultText) throw new Error("Empty payload from model.");

            return JSON.parse(resultText) as IRecEngineOutput;

        } catch (error) {
            console.error("🚨 Advisor failed:", error);
            throw error;
        }
    }
}