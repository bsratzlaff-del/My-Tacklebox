import { GoogleGenAI, Type, Schema } from '@google/genai';
import { IGear, IWeatherSnapshot, IRecEngineOutput } from '../contracts/IGear.js';
import dotenv from 'dotenv';

// Load environmental variables for API authentication
dotenv.config();

export class TackleboxAdvisor {
    private ai: GoogleGenAI;

    constructor() {
        // Automatically picks up process.env.GEMINI_API_KEY
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    /**
     * Evaluates real-time weather datasets against live tacklebox inventory items
     * to engineer a strategic, context-aware fishing recommendation.
     */
    public async generateFishingPlan(
        weather: IWeatherSnapshot, 
        currentInventory: IGear[]
    ): Promise<IRecEngineOutput> {
        
        // Isolate only the lures the user currently owns
        const ownedLures = currentInventory.filter(item => item.category === 'Lure');

        // High-level behavior guidelines for our digital fishing guide
        const systemInstruction = `You are a professional, elite bass and trout fishing guide.
Your mission is to analyze weather conditions and cross-reference them with the user's available inventory.

Rules:
1. "recommendedOwnedLures" must ONLY include items explicitly provided in the user's inventory.
2. If their current inventory lacks the optimal tool for the current barometric pressure or water temperature, suggest a critical addition to "shoppingSuggestions".
3. Provide a highly technical, brief "tacticalTip" explaining how fish behave under these exact barometric and temperature conditions.`;

        // Stringified context passed cleanly as user input
        const userPrompt = `
=== LOCAL CONDITIONS ===
Location Target: ${weather.locationName}
Air Temp: ${weather.airTemperatureF}°F
Water Temp: ${weather.waterTemperatureF}°F
Weather Profile: ${weather.condition}
Barometric Pressure: ${weather.barometricPressureIn} inHg

=== USER INVENTORY (LURES ONLY) ===
${JSON.stringify(ownedLures, null, 2)}
`;

        // 🛠️ Strict Schema Definition (Forces Gemini to return the exact type shape we require)
        const responseSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                recommendedOwnedLures: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            lureName: { type: Type.STRING },
                            reasoning: { type: Type.STRING }
                        },
                        required: ["lureName", "reasoning"]
                    }
                },
                shoppingSuggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            itemName: { type: Type.STRING },
                            whyYouNeedIt: { type: Type.STRING }
                        },
                        required: ["itemName", "whyYouNeedIt"]
                    }
                },
                tacticalTip: { type: Type.STRING }
            },
            required: ["recommendedOwnedLures", "shoppingSuggestions", "tacticalTip"]
        };

        try {
            console.log("🧠 Analyzing elements and engineering fishing strategy via Gemini...");
            
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema // Enforces structural adherence at the API level
                }
            });

            const resultText = response.text;
            if (!resultText) throw new Error("The AI model returned an unexpected empty text payload.");

            // Parse and deliver our guaranteed type-safe output
            const finalizedPlan: IRecEngineOutput = JSON.parse(resultText);
            return finalizedPlan;

        } catch (error) {
            console.error("🚨 TackleboxAdvisor failed to calculate a tactical strategy:", error);
            throw error;
        }
    }
}