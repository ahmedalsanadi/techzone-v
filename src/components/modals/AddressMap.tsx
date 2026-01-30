// src/components/modals/AddressMap.tsx
'use client';

import React, { useEffect, useCallback, useRef, memo, useState } from 'react';
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
import { DEFAULT_COORDINATES } from '@/lib/address/constants';
import { forwardGeocode, reverseGeocode } from '@/lib/address/geocoding';

// Initialize Leaflet icon once at module level
const DEFAULT_ICON =
    typeof window !== 'undefined'
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

const SEARCH_DEBOUNCE_MS = 800;

interface AddressMapProps {
    center: [number, number];
    onLocationSelect: (location: [number, number], formatted: string) => void;
    searchQuery?: string;
}

const MapClickHandler = memo(
    ({
        onSelect,
        setHasInteracted,
    }: {
        onSelect: (loc: [number, number], formatted: string) => void;
        setHasInteracted: (v: boolean) => void;
    }) => {
        const abortControllerRef = useRef<AbortController | null>(null);

        useMapEvents({
            click: async (e) => {
                setHasInteracted(true);
                abortControllerRef.current?.abort();
                abortControllerRef.current = new AbortController();
                const { lat, lng } = e.latlng;
                try {
                    const formatted = await reverseGeocode(
                        lat,
                        lng,
                        abortControllerRef.current.signal,
                    );
                    onSelect([lat, lng], formatted);
                } catch (error) {
                    if (error instanceof Error && error.name !== 'AbortError') {
                        onSelect(
                            [lat, lng],
                            `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                        );
                    }
                }
            },
        });

        useEffect(() => () => abortControllerRef.current?.abort(), []);
        return null;
    },
);

const MapViewUpdater = memo(({ center }: { center: [number, number] }) => {
    const map = useMap();
    const prevCenterRef = useRef(center);
    useEffect(() => {
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

const MapSizeInvalidator = memo(() => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 150);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
});

const AddressMap: React.FC<AddressMapProps> = ({
    center,
    onLocationSelect,
    searchQuery,
}) => {
    const [hasInteracted, setHasInteracted] = useState(false);

    const isDefaultLocation =
        Math.abs(center[0] - DEFAULT_COORDINATES[0]) < 0.0001 &&
        Math.abs(center[1] - DEFAULT_COORDINATES[1]) < 0.0001;

    const handleLocationSelect = useCallback(
        (location: [number, number], formatted: string) => {
            setHasInteracted(true);
            onLocationSelect(location, formatted);
        },
        [onLocationSelect],
    );

    const abortRef = useRef<AbortController | null>(null);
    const lastQueryRef = useRef('');

    useEffect(() => {
        const q = searchQuery?.trim() || '';
        if (!q || q === lastQueryRef.current) return;
        const timer = setTimeout(async () => {
            abortRef.current?.abort();
            abortRef.current = new AbortController();
            try {
                const res = await forwardGeocode(q, abortRef.current.signal);
                if (res) {
                    handleLocationSelect([res.lat, res.lon], res.display_name);
                    lastQueryRef.current = q;
                }
            } catch {}
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            clearTimeout(timer);
            abortRef.current?.abort();
        };
    }, [searchQuery, handleLocationSelect]);

    if (typeof window === 'undefined') return null;

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={center}
                zoom={DEFAULT_MAP_ZOOM}
                className="w-full h-full rounded-2xl"
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                scrollWheelZoom>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapViewUpdater center={center} />
                <MapSizeInvalidator />
                <MapClickHandler
                    onSelect={handleLocationSelect}
                    setHasInteracted={setHasInteracted}
                />
                <Marker position={center} />
            </MapContainer>

            {!hasInteracted && isDefaultLocation && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-6">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-theme-primary/10 flex flex-col items-center gap-2 animate-bounce">
                        <div className="w-10 h-10 bg-theme-primary/10 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-theme-primary rounded-full animate-ping" />
                        </div>
                        <p className="text-sm font-black text-theme-primary uppercase tracking-tight text-center">
                            Pick Your Location on Map
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold">
                            Click anywhere to pinpoint your address
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(AddressMap);
