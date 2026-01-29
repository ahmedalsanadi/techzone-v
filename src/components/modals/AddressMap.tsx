// src/components/modals/AddressMap.tsx
'use client';

import React, { useEffect, useCallback, useRef, memo } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_MAP_ZOOM } from '@/lib/branches';

// Initialize Leaflet icon once at module level
const DEFAULT_ICON = typeof window !== 'undefined' 
    ? L.icon({
        iconUrl: '/images/leaflet/marker-icon.png',
        iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
        shadowUrl: '/images/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })
    : null;

if (typeof window !== 'undefined' && DEFAULT_ICON) {
    L.Marker.prototype.options.icon = DEFAULT_ICON;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const SEARCH_DEBOUNCE_MS = 800;

interface AddressMapProps {
    center: [number, number];
    onLocationSelect: (location: [number, number], formatted: string) => void;
    searchQuery?: string;
}

interface LocationSelectHandler {
    (location: [number, number], formatted: string): void;
}

// Reverse geocode a location
async function reverseGeocode(
    lat: number, 
    lng: number, 
    signal?: AbortSignal
): Promise<string> {
    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
            { signal }
        );
        const data = await response.json();
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        console.error('Reverse geocoding error:', error);
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

// Forward geocode a search query
async function forwardGeocode(
    query: string, 
    signal?: AbortSignal
): Promise<{ lat: number; lon: number; display_name: string } | null> {
    try {
        const response = await fetch(
            `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=ar`,
            { signal }
        );
        const data = await response.json();
        return data?.[0] || null;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        console.error('Geocoding error:', error);
        return null;
    }
}

// Map click handler component
const MapClickHandler = memo(({ 
    onSelect 
}: { 
    onSelect: LocationSelectHandler 
}) => {
    const abortControllerRef = useRef<AbortController | null>(null);

    useMapEvents({
        click: async (e) => {
            // Cancel any pending request
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            const { lat, lng } = e.latlng;
            try {
                const formatted = await reverseGeocode(
                    lat, 
                    lng, 
                    abortControllerRef.current.signal
                );
                onSelect([lat, lng], formatted);
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    onSelect([lat, lng], formatted);
                }
            }
        },
    });

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    return null;
});
MapClickHandler.displayName = 'MapClickHandler';

// Map view updater component
const MapViewUpdater = memo(({ center }: { center: [number, number] }) => {
    const map = useMap();
    const prevCenterRef = useRef(center);

    useEffect(() => {
        // Only update if center actually changed
        if (
            prevCenterRef.current[0] !== center[0] || 
            prevCenterRef.current[1] !== center[1]
        ) {
            map.setView(center, map.getZoom());
            prevCenterRef.current = center;
        }
    }, [center, map]);

    return null;
});
MapViewUpdater.displayName = 'MapViewUpdater';

// Map size invalidator for container visibility
const MapSizeInvalidator = memo(() => {
    const map = useMap();
    
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
});
MapSizeInvalidator.displayName = 'MapSizeInvalidator';

// Search handler hook
function useSearchHandler(
    searchQuery: string | undefined,
    onLocationSelect: LocationSelectHandler
) {
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastQueryRef = useRef<string>('');

    useEffect(() => {
        const trimmedQuery = searchQuery?.trim() || '';
        
        // Skip if query is empty or unchanged
        if (!trimmedQuery || trimmedQuery === lastQueryRef.current) {
            return;
        }

        const timer = setTimeout(async () => {
            // Cancel any pending request
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            try {
                const result = await forwardGeocode(
                    trimmedQuery,
                    abortControllerRef.current.signal
                );

                if (result) {
                    const newLocation: [number, number] = [
                        parseFloat(String(result.lat)),
                        parseFloat(String(result.lon)),
                    ];
                    lastQueryRef.current = trimmedQuery;
                    onLocationSelect(newLocation, result.display_name);
                }
            } catch (error) {
                // Silently ignore abort errors
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            abortControllerRef.current?.abort();
        };
    }, [searchQuery, onLocationSelect]);
}

// Loading placeholder component
const MapLoadingPlaceholder = memo(() => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading map...</span>
    </div>
));
MapLoadingPlaceholder.displayName = 'MapLoadingPlaceholder';

const AddressMap: React.FC<AddressMapProps> = ({
    center,
    onLocationSelect,
    searchQuery,
}) => {
    // Stable callback reference
    const handleLocationSelect = useCallback<LocationSelectHandler>(
        (location, formatted) => {
            onLocationSelect(location, formatted);
        },
        [onLocationSelect]
    );

    // Handle search geocoding
    useSearchHandler(searchQuery, handleLocationSelect);

    // SSR guard
    if (typeof window === 'undefined') {
        return <MapLoadingPlaceholder />;
    }

    return (
        <MapContainer
            center={center}
            zoom={DEFAULT_MAP_ZOOM}
            className="w-full h-full rounded-2xl"
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewUpdater center={center} />
            <MapSizeInvalidator />
            <MapClickHandler onSelect={handleLocationSelect} />
            <Marker position={center} />
        </MapContainer>
    );
};

export default memo(AddressMap);