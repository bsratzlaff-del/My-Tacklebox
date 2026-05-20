// The prefix 'I' is a standard C# pattern for Interfaces
export interface IGear {
    id?: string;               // Optional because MongoDB generates this on save
    name: string;
    category: 'Rod' | 'Reel' | 'Line' | 'Lure' | 'Terminal Tackle' | 'Accessory'; // Strict enum enforcement
    brand?: string;
    quantity: number;
    notes?: string;
    createdAt?: Date;
}