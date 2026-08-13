/**
 * -----------------------------------------------------------------------------
 * API Client Service
 * -----------------------------------------------------------------------------
 * This is the proper, centralized way to handle API communications.
 *
 * 1. It reads the backend URL from environment variables, making it flexible.
 * 2. It provides strongly-typed functions for each API endpoint.
 * 3. It centralizes error handling and request/response logic.
 */

import { Capacitor } from '@capacitor/core';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * Determines the correct API base URL based on the runtime platform.
 * This is the crucial fix for mobile connectivity.
 */
const getApiBaseUrl = () => {
  // Check if the app is running on a native mobile platform
  if (Capacitor.isNativePlatform()) {
    // Android emulators use a special IP to access the host machine's localhost.
    if (Capacitor.getPlatform() === 'android') {
      return 'http://10.0.2.2:3000';
    }
    // For physical iOS devices, you would need to use your computer's local network IP.
    // The iOS simulator can usually access localhost directly.
  }
  // For web builds and the iOS simulator, default to localhost or the Vite env variable.
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};

// This is the single source of truth for the backend's location.
const API_BASE_URL = getApiBaseUrl();

// Define TypeScript interfaces for your data structures for app-wide type safety.
export interface Gear {
  _id: string;
  userId: string;
  name:string;
  category: string;
  brand?: string;
  color?: string;
}

export interface UserProfile {
    _id: { $oid: string } | string;
    name: string;
    username: string;
}

export interface ScanResponse {
    message: string;
    itemsSavedCount: number;
    data: Gear[];
}

/**
 * A generic wrapper around the native fetch API.
 * @param endpoint The API path to call (e.g., '/api/gear/123').
 * @param options Optional fetch options (method, body, etc.).
 * @returns The parsed JSON response.
 * @throws An error if the network response is not ok.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
    throw new Error(errorBody.error || `API request failed with status ${response.status}`);
  }

  // Handle 204 No Content for successful DELETE requests
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * A fetch wrapper for sending multipart/form-data, like file uploads.
 * @param endpoint The API path to call.
 * @param formData The FormData object to send.
 * @returns The parsed JSON response.
 */
async function apiFetchWithFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // NOTE: Do NOT set 'Content-Type' for FormData. The browser must set it
    // automatically to include the multipart boundary.
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
    throw new Error(errorBody.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

// Export dedicated, typed functions for each API action.
export const getUserGear = (userId: string): Promise<Gear[]> => apiFetch(`/api/gear/${userId}`);
export const deleteGearItem = (itemId: string): Promise<void> => apiFetch(`/api/gear/${itemId}`, { method: 'DELETE' });
export const scanTackleboxPhoto = (formData: FormData): Promise<ScanResponse> => apiFetchWithFormData('/api/tacklebox/scan', formData);