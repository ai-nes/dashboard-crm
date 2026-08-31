"use client";

import { InfoTriangle } from "@tailgrids/icons";
import { circleMarker, latLngBounds, map as createLeafletMap, polyline, tileLayer, type Map as LeafletMap, type Polyline as LeafletPolyline } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/utils/cn";

import type { LocalityCoordinate, SchoolLocalityContext } from "./school-locality-data";

interface SchoolLocalityMapProps {
  context: SchoolLocalityContext;
  className?: string;
}

interface RouteResponse {
  routes?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
}

const routePathOptions = {
  color: "var(--primary-500)",
  dashArray: "8 8",
  opacity: 0.9,
  weight: 4,
};

export default function SchoolLocalityMap({ context, className }: SchoolLocalityMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const routeLayerRef = useRef<LeafletPolyline | null>(null);
  const source = context.source.coordinates;
  const destination = context.campus.coordinates;
  const sourceLatitude = source[0];
  const sourceLongitude = source[1];
  const destinationLatitude = destination[0];
  const destinationLongitude = destination[1];
  const sourceName = context.source.name;
  const routeKey = `${sourceLatitude},${sourceLongitude};${destinationLatitude},${destinationLongitude}`;
  const fallbackRoute = useMemo<LocalityCoordinate[]>(
    () => [
      [sourceLatitude, sourceLongitude],
      [destinationLatitude, destinationLongitude],
    ],
    [destinationLatitude, destinationLongitude, sourceLatitude, sourceLongitude],
  );
  const [route, setRoute] = useState<{ key: string; coordinates: LocalityCoordinate[] }>({ key: routeKey, coordinates: fallbackRoute });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    fetch(`https://router.project-osrm.org/route/v1/driving/${sourceLongitude},${sourceLatitude};${destinationLongitude},${destinationLatitude}?overview=full&geometries=geojson`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() as Promise<RouteResponse> : Promise.reject(new Error("route unavailable"))))
      .then((result) => {
        const coordinates = result.routes?.[0]?.geometry?.coordinates;
        if (cancelled || !coordinates?.length) return;
        setRoute({ key: routeKey, coordinates: coordinates.map(([longitude, latitude]) => [latitude, longitude]) });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [destinationLatitude, destinationLongitude, routeKey, sourceLatitude, sourceLongitude]);

  useEffect(() => {
    const element = mapElementRef.current;
    if (!element) return;

    const map = createLeafletMap(element, {
      attributionControl: false,
      scrollWheelZoom: false,
      zoomControl: false,
    });
    mapRef.current = map;

    tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    routeLayerRef.current = polyline(
      fallbackRoute,
      routePathOptions,
    ).addTo(map);

    circleMarker([sourceLatitude, sourceLongitude], {
      color: "var(--card-background)",
      fillColor: "var(--warning-500)",
      fillOpacity: 1,
      radius: 10,
      weight: 3,
    }).bindTooltip(createTooltipNode(sourceName, "Nguồn học sinh"), { direction: "top", offset: [0, -8] }).addTo(map);

    circleMarker([destinationLatitude, destinationLongitude], {
      color: "var(--card-background)",
      fillColor: "var(--primary-500)",
      fillOpacity: 1,
      radius: 10,
      weight: 3,
    }).bindTooltip(createTooltipNode("FPTU TP.HCM", "Campus đích"), { direction: "top", offset: [0, -8] }).addTo(map);

    const bounds = latLngBounds([
      [sourceLatitude, sourceLongitude],
      [destinationLatitude, destinationLongitude],
    ]);
    map.fitBounds(bounds, { padding: [38, 38], maxZoom: 10 });
    const resizeFrame = window.requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [38, 38], maxZoom: 10 });
    });

    return () => {
      window.cancelAnimationFrame(resizeFrame);
      routeLayerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, [destinationLatitude, destinationLongitude, fallbackRoute, sourceLatitude, sourceLongitude, sourceName]);

  useEffect(() => {
    if (route.key === routeKey) routeLayerRef.current?.setLatLngs(route.coordinates);
  }, [route, routeKey]);

  return (
    <div className={cn("relative h-80 min-h-80 overflow-hidden rounded-2xl border border-card-border bg-background-soft-50 sm:h-104 sm:min-h-104", className)}>
      <div ref={mapElementRef} className="h-full w-full" role="application" aria-label={`Bản đồ tuyến ${context.routeLabel}`} />

      <div className="pointer-events-none absolute top-3 left-3 z-1000 rounded-lg border border-card-border bg-card-background/95 px-3 py-2 shadow-sm backdrop-blur-sm">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-text-tertiary uppercase">Kết nối địa bàn</p>
        <p className="mt-1 text-xs font-semibold text-text-primary">{context.routeLabel}</p>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-1000 max-w-[min(75%,19rem)] rounded-lg border border-card-border bg-card-background/95 px-3 py-2.5 shadow-sm backdrop-blur-sm">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-warning-500 uppercase"><InfoTriangle size={12} aria-hidden="true" />Điểm cần lưu ý</p>
        <p className="mt-1 text-[11px] leading-4 text-text-primary"><strong>Rủi ro:</strong> {context.risks[0]}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-text-secondary"><strong className="font-semibold text-text-primary">Cơ hội:</strong> {context.opportunity}</p>
      </div>

      <div className="absolute right-3 bottom-3 z-1000 flex flex-col overflow-hidden rounded-lg border border-card-border bg-card-background shadow-sm">
        <button type="button" className="flex size-8 items-center justify-center border-b border-card-border text-lg leading-none text-text-secondary transition hover:bg-background-soft-50 hover:text-text-primary" onClick={() => mapRef.current?.zoomIn()} aria-label="Phóng to bản đồ">+</button>
        <button type="button" className="flex size-8 items-center justify-center text-lg leading-none text-text-secondary transition hover:bg-background-soft-50 hover:text-text-primary" onClick={() => mapRef.current?.zoomOut()} aria-label="Thu nhỏ bản đồ">−</button>
      </div>

      <p className="pointer-events-none absolute right-14 bottom-2 z-1000 rounded bg-card-background/90 px-1.5 py-0.5 text-[10px] text-text-tertiary">© OpenStreetMap</p>
    </div>
  );
}

function createTooltipNode(title: string, detail: string) {
  const container = document.createElement("div");
  const titleElement = document.createElement("strong");
  titleElement.textContent = title;
  container.append(titleElement, document.createElement("br"), document.createTextNode(detail));
  return container;
}
