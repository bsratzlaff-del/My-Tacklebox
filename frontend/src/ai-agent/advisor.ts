import { GoogleGenAI } from '@google/genai';
import { IGear, IWeatherSnapshot, IRecEngineOutput } from '../contracts/IGear.js';
import dotenv from 'dotenv';

// Load environment variables for the API keys
dotenv.config();

export class TackleboxAdvisor {
    private ai: GoogleGenAI;

    constructor() {
        // Initializes the SDK. It will automatically look for process.env.GEMINI_API_KEY
        this.ai = new GoogleGenAI({});
    }

    /**
     * Analyzes current environmental factors against your local inventory to deliver tactical fishing insights.
     */
    public async generateFishingPlan(
        weather: IWeatherSnapshot, 
        currentInventory: IGear[]
    ): Promise<IRecEngineOutput> {
        
        // Filter out only the lures the user currently owns
        const ownedLures = currentInventory.filter(item => item.category === 'Lure');

        // Construct the prompt with raw context data
        const systemPrompt = `You are an expert bass and trout fishing guide AI. 
Analyze the current environmental data and cross-reference it with the user's current inventory of lures. 

Deliver a tactical fishing plan in strict JSON formatting that matches this structure:
{
  "recommendedOwnedLures": [{ "lureName": "string", "reasoning": "string" }],
  "shoppingSuggestions": [{ "itemName": "string", "whyYouNeedIt": "string" }],
  "tacticalTip": "string"
}

Rules:
1. "recommendedOwnedLures" must ONLY pull from the list of items the user currently owns.
2. If they don't own the perfect lure for the weather conditions, add a high-value suggestion to "shoppingSuggestions".
3. Use barometric pressure and water temperature trends to dictate the "tacticalTip".`;

        const userContext = `
=== ENVIRONMENTAL DATA ===
Location: ${weather.locationName}
Air Temp: ${weather.airTemperatureF}°F
Water Temp: ${weather.waterTemperatureF}°F
Conditions: ${weather.condition}
Barometric Pressure: ${weather.barometricPressureIn} inHg

=== USER'S OWNED LURES ===
${JSON.stringify(ownedLures, null, 2)}
`;

        try {
            console.log("🧠 Querying AI Advisor Engine...");
            
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userContext,
                config: {
                    systemInstruction: systemPrompt,
                    // Forces the model to reply in pure, compilable JSON format
                    responseMimeType: 'application/json'
                }
            });

            const rawText = response.text;
            if (!rawText) throw new Error("AI returned an empty response.");

            // Parse the verified JSON directly into our UI contract
            const structuredResult: IRecEngineOutput = JSON.parse(rawText);
            return structuredResult;

        } catch (error) {
            console.error("🚨 Advisor Engine Failed to generate insights:", error);
            throw error;
        }
    }
}