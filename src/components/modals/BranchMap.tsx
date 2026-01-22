// src/components/modals/BranchMap.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Branch } from '@/types/branches';
import {
    getMapCenter,
    getBranchCoordinates,
    DEFAULT_MAP_ZOOM,
} from '@/lib/branches';
import { useTranslations } from 'next-intl';

// Initialize Leaflet icons using local assets (no external CDN dependency)
// This ensures reliability and performance
const createDefaultIcon = () => {
    if (typeof window === 'undefined') return null;

    return L.icon({
        iconUrl: '/images/leaflet/marker-icon.png',
        iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
        shadowUrl: '/images/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

// Set default icon globally to avoid repeating in each Marker
if (typeof window !== 'undefined') {
    const defaultIcon = createDefaultIcon();
    if (defaultIcon) {
        L.Marker.prototype.options.icon = defaultIcon;
    }
}

interface BranchMapProps {
    branches: Branch[];
    selectedBranchId?: number;
    onBranchSelect: (branch: Branch) => void;
}

// Sub-component to handle map centering with smooth transition
const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom(), {
            animate: true,
            duration: 1.5,
        });
    }, [center, map]);
    return null;
};

const BranchMap: React.FC<BranchMapProps> = React.memo(
    ({ branches, selectedBranchId, onBranchSelect }) => {
        const t = useTranslations('Branches');
        const [mounted] = useState(() => typeof window !== 'undefined');

        // Calculate center dynamically from branches or selected branch
        const center = React.useMemo(
            () => getMapCenter(branches, selectedBranchId, true),
            [branches, selectedBranchId],
        );

        // Get all branches with coordinates (real or mock)
        const branchesWithCoords = React.useMemo(() => {
            return branches
                .map((branch) => {
                    const coords = getBranchCoordinates(branch, true);
                    return coords ? { branch, coords } : null;
                })
                .filter(
                    (
                        item,
                    ): item is { branch: Branch; coords: [number, number] } =>
                        item !== null,
                );
        }, [branches]);

        // Loading state
        if (!mounted) {
            return (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center">
                    <div className="text-sm text-gray-400">Loading map...</div>
                </div>
            );
        }

        return (
            <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
                <MapContainer
                    center={center}
                    zoom={DEFAULT_MAP_ZOOM}
                    scrollWheelZoom={true}
                    className="w-full h-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        errorTileUrl=""
                        maxZoom={19}
                    />
                    <ChangeView center={center} />
                    {branchesWithCoords.map(({ branch, coords }) => {
                        const [lat, lng] = coords;
                        const hasRealCoords =
                            branch.address?.latitude != null &&
                            branch.address?.longitude != null;

                        return (
                            <Marker
                                key={branch.id}
                                position={[lat, lng]}
                                eventHandlers={{
                                    click: () => onBranchSelect(branch),
                                }}>
                                <Popup>
                                    <div className="text-center p-1 min-w-[150px]">
                                        <h4 className="font-bold text-gray-900 text-sm">
                                            {branch.name || 'Branch'}
                                        </h4>
                                        {branch.address?.formatted && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {branch.address.formatted}
                                            </p>
                                        )}
                                        {!hasRealCoords && (
                                            <p className="text-[10px] text-gray-400 mt-1 italic">
                                                {t('map_unavailable_desc') ||
                                                    'Approximate location'}
                                            </p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        );
    },
);

BranchMap.displayName = 'BranchMap';

export default BranchMap;
