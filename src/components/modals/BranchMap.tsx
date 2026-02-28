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

// Sub-component to handle map centering with smooth transition.
// Defer until map pane has _leaflet_pos to avoid "Cannot read _leaflet_pos" during zoom.
const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                const container = map.getContainer();
                if (!container?.parentElement) return;
                map.flyTo(center, map.getZoom(), {
                    animate: true,
                    duration: 1.5,
                });
            } catch {
                // ignore if map pane not ready
            }
        };
        const id = requestAnimationFrame(() => {
            if (cancelled) return;
            run();
        });
        return () => {
            cancelled = true;
            cancelAnimationFrame(id);
        };
    }, [center, map]);
    return null;
};

// Enable scroll zoom after map pane is ready to avoid _leaflet_pos undefined during wheel zoom.
const ScrollWheelZoomEnabler: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        let cancelled = false;
        const enable = () => {
            if (cancelled) return;
            try {
                if (map.scrollWheelZoom && !map.scrollWheelZoom.enabled()) {
                    map.scrollWheelZoom.enable();
                }
            } catch {
                // ignore if pane not ready
            }
        };
        const id = window.setTimeout(enable, 400);
        return () => {
            cancelled = true;
            window.clearTimeout(id);
        };
    }, [map]);
    return null;
};

// Fix Leaflet on small screens: container can have 0 size at first paint; invalidateSize() redraws when layout is ready.
// Defer first run to avoid _leaflet_pos undefined when map pane isn't ready.
const MapInvalidateSize: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        let cancelled = false;
        const run = () => {
            if (cancelled) return;
            try {
                map.invalidateSize();
            } catch {
                // ignore if map pane not ready
            }
        };
        const t0 = requestAnimationFrame(() => run());
        const t1 = window.setTimeout(run, 100);
        const t2 = window.setTimeout(run, 350);
        const el = map.getContainer();
        const ro =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(() => requestAnimationFrame(run))
                : null;
        if (ro && el) ro.observe(el);
        const onResize = () => requestAnimationFrame(run);
        window.addEventListener('resize', onResize);
        return () => {
            cancelled = true;
            cancelAnimationFrame(t0);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            ro?.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, [map]);
    return null;
};

const BranchMap: React.FC<BranchMapProps> = React.memo(
    ({ branches, selectedBranchId, onBranchSelect }) => {
        const t = useTranslations('Branches');
        const wrapperRef = React.useRef<HTMLDivElement>(null);
        const [mounted] = useState(() => typeof window !== 'undefined');
        const [containerReady, setContainerReady] = useState(false);

        // Defer Leaflet mount until container has non-zero height (fixes blank map on small screens)
        useEffect(() => {
            if (!mounted || !wrapperRef.current) return;
            const el = wrapperRef.current;
            const check = () => {
                if (el.offsetHeight > 0 && !containerReady) setContainerReady(true);
            };
            check();
            const t1 = requestAnimationFrame(check);
            const t2 = setTimeout(check, 50);
            const t3 = setTimeout(check, 200);
            const ro =
                typeof ResizeObserver !== 'undefined'
                    ? new ResizeObserver(check)
                    : null;
            if (ro) ro.observe(el);
            return () => {
                cancelAnimationFrame(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                ro?.disconnect();
            };
        }, [mounted, containerReady]);

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

        // Loading state (SSR / not mounted)
        if (!mounted) {
            return (
                <div className="w-full h-full min-h-[250px] bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center">
                    <div className="text-sm text-gray-400">Loading map...</div>
                </div>
            );
        }

        // Placeholder until container has height (avoids Leaflet init at 0 size on small screens)
        if (!containerReady) {
            return (
                <div
                    ref={wrapperRef}
                    className="w-full h-full min-h-[250px] bg-gray-100 animate-pulse rounded-2xl md:rounded-3xl flex items-center justify-center border border-gray-100">
                    <div className="text-sm text-gray-400">Loading map...</div>
                </div>
            );
        }

        return (
            <div
                ref={wrapperRef}
                className="w-full h-full min-h-[250px] rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
                <MapContainer
                    center={center}
                    zoom={DEFAULT_MAP_ZOOM}
                    scrollWheelZoom={false}
                    className="w-full h-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        errorTileUrl=""
                        maxZoom={19}
                    />
                    <ChangeView center={center} />
                    <MapInvalidateSize />
                    <ScrollWheelZoomEnabler />
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
