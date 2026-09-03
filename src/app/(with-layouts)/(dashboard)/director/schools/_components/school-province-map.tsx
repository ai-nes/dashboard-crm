"use client";

import { MapMarker5 } from "@tailgrids/icons";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/utils/cn";

interface ProvinceGeometryDocument {
  Code: string;
  GIS: {
    Geometry: GeoJSON.MultiPolygon;
    BoundingBox: {
      MinLongitude: number;
      MinLatitude: number;
      MaxLongitude: number;
      MaxLatitude: number;
    };
  };
}

interface SchoolProvinceMapProps {
  provinceCode: string;
  provinceName: string;
  coordinates?: [number, number];
  className?: string;
  showOverlay?: boolean;
}

export default function SchoolProvinceMap({
  provinceCode,
  provinceName,
  coordinates,
  className,
  showOverlay = true,
}: SchoolProvinceMapProps) {
  const [province, setProvince] = useState<ProvinceGeometryDocument | null>();

  useEffect(() => {
    let isCancelled = false;
    fetch("/market-intelligence/vietnam-provinces-2025.json")
      .then((response) => {
        if (!response.ok) throw new Error("province geometry unavailable");
        return response.json() as Promise<ProvinceGeometryDocument[]>;
      })
      .then((documents) => {
        if (!isCancelled)
          setProvince(
            documents.find((document) => document.Code === provinceCode) ??
              null,
          );
      })
      .catch(() => {
        if (!isCancelled) setProvince(null);
      });
    return () => {
      isCancelled = true;
    };
  }, [provinceCode]);

  const map = useMemo(
    () => (province ? createProvinceMap(province) : undefined),
    [province],
  );
  if (province === undefined)
    return (
      <div className="flex h-76 min-h-76 items-center justify-center rounded-xl bg-background-soft-50 text-xs text-text-tertiary sm:h-92 sm:min-h-92">
        Đang tải ranh giới {provinceName}…
      </div>
    );
  if (!map)
    return (
      <div className="flex h-76 min-h-76 items-center justify-center rounded-xl bg-background-soft-50 px-6 text-center text-xs text-text-tertiary sm:h-92 sm:min-h-92">
        Chưa có ranh giới hành chính cho {provinceName}.
      </div>
    );

  const marker =
    coordinates && isWithinBounds(coordinates, province!.GIS.BoundingBox);
  return (
    <div
      className={cn(
        "relative h-76 min-h-76 overflow-hidden rounded-xl bg-background-soft-50 sm:h-92 sm:min-h-92",
        className,
      )}
    >
      <svg
        aria-label={`Bản đồ tỉnh ${provinceName}`}
        className="h-full w-full p-5"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={map.viewBox}
      >
        <path
          d={map.path}
          fill="var(--badge-primary-background)"
          stroke="var(--primary-500)"
          strokeLinejoin="round"
          strokeWidth={map.strokeWidth}
        />
        {marker && (
          <circle
            cx={coordinates![1]}
            cy={-coordinates![0]}
            fill="var(--warning-500)"
            r={map.markerRadius}
            stroke="var(--card-background)"
            strokeWidth={map.markerStrokeWidth}
          />
        )}
      </svg>
      {showOverlay && (
        <div className="pointer-events-none absolute top-3 left-3 rounded-lg bg-card-background px-2.5 py-1.5 text-xs font-semibold text-text-primary shadow-sm">
          {provinceName}
        </div>
      )}
      {showOverlay && marker && (
        <div className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg bg-card-background px-2.5 py-1.5 text-xs text-text-secondary shadow-sm">
          <MapMarker5 size={13} className="text-warning-500" />
          Vị trí trường
        </div>
      )}
    </div>
  );
}

function createProvinceMap(province: ProvinceGeometryDocument) {
  const { MinLatitude, MinLongitude, MaxLatitude, MaxLongitude } =
    province.GIS.BoundingBox;
  const width = MaxLongitude - MinLongitude;
  const height = MaxLatitude - MinLatitude;
  const padding = Math.max(width, height) * 0.08;
  const mainland =
    [...province.GIS.Geometry.coordinates].sort(
      (left, right) => getPolygonArea(right) - getPolygonArea(left),
    )[0] ?? [];
  const path = mainland
    .map((ring) =>
      ring
        .map(
          ([longitude, latitude], index) =>
            `${index === 0 ? "M" : "L"}${longitude} ${-latitude}`,
        )
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");
  return {
    path,
    viewBox: `${MinLongitude - padding} ${-MaxLatitude - padding} ${width + padding * 2} ${height + padding * 2}`,
    strokeWidth: Math.max(width, height) * 0.008,
    markerRadius: Math.max(width, height) * 0.025,
    markerStrokeWidth: Math.max(width, height) * 0.008,
  };
}

function getPolygonArea(polygon: GeoJSON.Position[][]) {
  const ring = polygon[0] ?? [];
  return Math.abs(
    ring.reduce((area, [longitude, latitude], index) => {
      const [nextLongitude, nextLatitude] = ring[(index + 1) % ring.length] ?? [
        longitude,
        latitude,
      ];
      return area + longitude * nextLatitude - nextLongitude * latitude;
    }, 0) / 2,
  );
}

function isWithinBounds(
  [latitude, longitude]: [number, number],
  bounds: ProvinceGeometryDocument["GIS"]["BoundingBox"],
) {
  return (
    latitude >= bounds.MinLatitude &&
    latitude <= bounds.MaxLatitude &&
    longitude >= bounds.MinLongitude &&
    longitude <= bounds.MaxLongitude
  );
}
