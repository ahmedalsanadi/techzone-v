// src/app/[locale]/my-orders/utils/components/LiveTrackingMap.tsx
'use client';

import React, { useEffect, memo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const courierIcon =
    typeof window !== 'undefined'
        ? L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="bg-theme-primary p-2 rounded-full shadow-lg border-2 border-white text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
           </div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
          })
        : null;

const destinationIcon =
    typeof window !== 'undefined'
        ? L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="bg-green-600 p-2 rounded-full shadow-lg border-2 border-white text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
           </div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
          })
        : null;

interface LiveTrackingMapProps {
    courierCoords: [number, number];
    destinationCoords: [number, number];
}

const MapSizeInvalidator = memo(() => {
    const map = useMap();
    useEffect(() => {
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                map.invalidateSize();
            } catch {
                // ignore if map pane not ready (_leaflet_pos)
            }
        };
        const timer = setTimeout(run, 150);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [map]);
    return null;
});
MapSizeInvalidator.displayName = 'MapSizeInvalidator';

const FitBounds = memo(({ coords }: { coords: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (coords.length === 0) return;
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                if (!map.getContainer()?.parentElement) return;
                const bounds = L.latLngBounds(coords);
                map.fitBounds(bounds, { padding: [50, 50] });
            } catch {
                // ignore if map pane not ready (_leaflet_pos)
            }
        };
        const id = requestAnimationFrame(() => run());
        const fallback = setTimeout(run, 200);
        return () => {
            cancelled = true;
            cancelAnimationFrame(id);
            clearTimeout(fallback);
        };
    }, [coords, map]);
    return null;
});
FitBounds.displayName = 'FitBounds';

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
    courierCoords,
    destinationCoords,
}) => {
    if (typeof window === 'undefined') return null;

    return (
        <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border-2 border-gray-100 shadow-sm">
            <MapContainer
                center={courierCoords}
                zoom={15}
                className="w-full h-full"
                scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapSizeInvalidator />
                <FitBounds coords={[courierCoords, destinationCoords]} />

                {courierIcon && (
                    <Marker position={courierCoords} icon={courierIcon} />
                )}
                {destinationIcon && (
                    <Marker
                        position={destinationCoords}
                        icon={destinationIcon}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default memo(LiveTrackingMap);
