/**
 * Utility functions for geocoding and reverse geocoding using the local proxy.
 */

const PROXY_BASE_URL = '/proxy';

export interface GeocodingResult {
    lat: number;
    lon: number;
    display_name: string;
}

/**
 * Converts coordinates to a human-readable address string.
 */
export async function reverseGeocode(
    lat: number,
    lng: number,
    signal?: AbortSignal,
): Promise<string> {
    try {
        const response = await fetch(
            `${PROXY_BASE_URL}/nominatim/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
            { signal, headers: { 'Accept-Language': 'ar' } },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') throw error;
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

/**
 * Converts a search query string to coordinates.
 */
export async function forwardGeocode(
    query: string,
    signal?: AbortSignal,
): Promise<GeocodingResult | null> {
    try {
        const response = await fetch(
            `${PROXY_BASE_URL}/nominatim/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=ar`,
            { signal, headers: { 'Accept-Language': 'ar' } },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const first = data?.[0];
        if (!first) return null;

        return {
            lat: parseFloat(String(first.lat)),
            lon: parseFloat(String(first.lon)),
            display_name: first.display_name,
        };
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') throw error;
        return null;
    }
}
