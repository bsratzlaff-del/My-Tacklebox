import { TackleboxAdvisor } from '../ai-agent/advisor.js';
import { IGear, IWeatherSnapshot } from '../contracts/IGear.js';

async function runSimulation() {
    console.log("🎣 Starting Tacklebox AI Advisor Simulation...\n");

    const advisor = new TackleboxAdvisor();

    // 1. Imagine you are fishing a lake on a cold, overcast day
    const mockWeather: IWeatherSnapshot = {
        locationName: "Clearwater Lake",
        airTemperatureF: 55,
        waterTemperatureF: 52,
        condition: "Overcast",
        barometricPressureIn: 30.15 // High pressure after a cold front
    };

    // 2. This mimics the gear currently sitting in your MongoDB database
    const mockInventory: IGear[] = [
        {
            name: "PowerBait Floating Trout Worm (Pink)",
            category: "Lure",
            quantity: 3,
            notes: "Great for cold water trout"
        },
        {
            name: "Topwater Frog Lure (Green)",
            category: "Lure",
            quantity: 1,
            notes: "For heavy lily pads in summer"
        },
        {
            name: "Ugly Stik GX2 Spinning Rod",
            category: "Rod",
            quantity: 1
        }
    ];

    try {
        const plan = await advisor.generateFishingPlan(mockWeather, mockInventory);

        console.log("\n✨ ON THE WATER TELEMETRY: ✨");
        console.log("=========================================================");
        console.log(`RECOMMENDED OWNED GEAR:\n  ${plan.ownedLureRecommendations.join('\n  ')}\n`);
        console.log(`RECOMMENDED SHOPPING LIST:\n  ${plan.missingBuySuggestions.join('\n  ')}\n`);
        console.log(`TACTICAL TIP:\n  ${plan.onTheWaterTacticalTip}`);
        console.log("=========================================================");

    } catch (error) {
        console.error("❌ Simulation failed. Make sure your GEMINI_API_KEY is set in your .env file!");
    }
}

runSimulation();