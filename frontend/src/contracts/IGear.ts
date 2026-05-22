export interface IGear {
    id?: string;
    name: string;
    category: 'Rod' | 'Reel' | 'Line' | 'Lure' | 'Terminal Tackle' | 'Accessory';
    brand?: string;
    quantity: number;
    notes?: string;
    createdAt?: Date;
}

// 🛠️ ADD THIS: Strict contract for the incoming weather data
export interface IWeatherSnapshot {
    locationName: string;
    waterTemperatureF: number;
    airTemperatureF: number;
    condition: 'Sunny' | 'Overcast' | 'Rainy' | 'Windy';
    barometricPressureIn: number; // e.g., 29.92 (Crucial for fish activity!)
}

    // 🛠️ REFACTORED: Stripped out long prose blocks for quick mobile readability
export interface IRecEngineOutput {
    ownedLureRecommendations: string[]; // e.g. ["🎣 Pink Trout Worm: Fish deep along points.", "🎣 Green Frog: Skip under overhanging trees."]
    missingBuySuggestions: string[];    // e.g. ["🛒 Suspending Jerkbait (Targeting cold-water pre-spawn bass)"]
    onTheWaterTacticalTip: string;       // ONE single, punchy, high-impact sentence.
}
