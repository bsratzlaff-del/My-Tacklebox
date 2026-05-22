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

// 🛠️ ADD THIS: Strict contract for what the AI must return to the UI
export interface IRecEngineOutput {
    recommendedOwnedLures: {
        lureName: string;
        reasoning: string;
    }[];
    shoppingSuggestions: {
        itemName: string;
        whyYouNeedIt: string;
    }[];
    tacticalTip: string; // Global advice based on the barometric pressure/weather
}