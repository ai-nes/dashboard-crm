"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/tailgrids/core/input";
import { Button } from "@/components/tailgrids/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import {
  ArrowUpward,
  Check,
  ChevronDown,
  Download1,
  Filter,
  RefreshCircle1Clockwise,
  Search1,
  Target3,
} from "@tailgrids/icons";
import {
  formatMetricValue,
  getMetricColor,
  METRICS_CONFIG,
  opportunityLabel,
  REGION_CONFIGS,
} from "./data";
import CampusMarkerLayer from "./campus-marker-layer";
import { ZoomInIcon, ZoomOutIcon } from "./icons";
import type {
  MetricKey,
  ProvinceFeatureCollection,
  ProvinceMetrics,
  RegionKey,
} from "./types";

const MASTER_VIEWBOX = { width: 620, height: 780, padding: 16 };
const MASTER_BOUNDS = {
  minLongitude: 101.8,
  maxLongitude: 110.2,
  minLatitude: 8.2,
  maxLatitude: 23.6,
};

const REGION_KEYS: RegionKey[] = ["all", "north", "central", "highlands", "south", "mekong"];

const METRIC_TABS: Array<{ key: MetricKey; label: string }> = [
  { key: "opportunity", label: "Cơ hội" },
  { key: "leads", label: "Leads" },
  { key: "conversion", label: "Chuyển đổi" },
  { key: "competition", label: "Cạnh tranh" },
  { key: "revenue", label: "Doanh thu" },
];

interface MarketMapProps {
  activeMetric: MetricKey;
  activeRegion: RegionKey;
  geoData: ProvinceFeatureCollection;
  onMetricChange: (metric: MetricKey) => void;
  onQueryChange: (query: string) => void;
  onRegionChange: (region: RegionKey) => void;
  onReset: () => void;
  onExport: () => void;
  onSelectProvince: (code: string) => void;
  provinces: ProvinceMetrics[];
  query: string;
  selectedCode: string | null;
  showCampuses: boolean;
  onToggleCampuses: (show: boolean) => void;
  totalProvinces: number;
}

interface MapPath {
  code: string;
  d: string;
  name: string;
}

function projectPoint([longitude, latitude]: number[]): [number, number] {
  const usableWidth = MASTER_VIEWBOX.width - MASTER_VIEWBOX.padding * 2;
  const usableHeight = MASTER_VIEWBOX.height - MASTER_VIEWBOX.padding * 2;

  const x =
    MASTER_VIEWBOX.padding +
    ((longitude - MASTER_BOUNDS.minLongitude) /
      (MASTER_BOUNDS.maxLongitude - MASTER_BOUNDS.minLongitude)) *
      usableWidth;

  const y =
    MASTER_VIEWBOX.padding +
    ((MASTER_BOUNDS.maxLatitude - latitude) /
      (MASTER_BOUNDS.maxLatitude - MASTER_BOUNDS.minLatitude)) *
      usableHeight;

  return [x, y];
}

function toMapPath(coordinates: GeoJSON.MultiPolygon["coordinates"]) {
  return coordinates
    .filter((polygon) =>
      polygon.some((ring) =>
        ring.some(
          ([longitude, latitude]) =>
            longitude >= MASTER_BOUNDS.minLongitude &&
            longitude <= MASTER_BOUNDS.maxLongitude &&
            latitude >= MASTER_BOUNDS.minLatitude &&
            latitude <= MASTER_BOUNDS.maxLatitude,
        ),
      ),
    )
    .flatMap((polygon) =>
      polygon.map((ring) => {
        const points = ring.map(projectPoint);
        return points
          .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(" ")
          .concat(" Z");
      }),
    )
    .join(" ");
}

export default function MarketMap({
  activeMetric,
  activeRegion,
  geoData,
  onMetricChange,
  onQueryChange,
  onRegionChange,
  onReset,
  onExport,
  onSelectProvince,
  provinces,
  query,
  selectedCode,
  showCampuses,
  onToggleCampuses,
  totalProvinces,
}: MarketMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [manualZoom, setManualZoom] = useState<number>(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const provinceByCode = useMemo(
    () => new Map(provinces.map((province) => [province.code, province])),
    [provinces],
  );

  const paths = useMemo<MapPath[]>(
    () =>
      geoData.features
        .map((feature) => ({
          code: feature.properties.code,
          d: toMapPath(feature.geometry.coordinates),
          name: feature.properties.name,
        }))
        .filter((feature) => feature.d.length > 0),
    [geoData],
  );

  const hoveredProvince = hoveredCode ? provinceByCode.get(hoveredCode) : null;
  const config = METRICS_CONFIG[activeMetric];

  // Embedded region summary statistics inside map card
  const regionStats = useMemo(() => {
    const filtered =
      activeRegion === "all"
        ? provinces
        : provinces.filter((p) => p.regionKey === activeRegion);

    if (filtered.length === 0) {
      return {
        totalGrade12: 605502,
        totalLeads: 175102,
        avgConversion: 13.8,
        hotspotCount: 13,
        totalRevenue: 1420.9,
        count: 34,
      };
    }

    const totalGrade12 = filtered.reduce((acc, p) => acc + p.grade12Population, 0);
    const totalLeads = filtered.reduce((acc, p) => acc + p.leads, 0);
    const avgConversion = Number(
      (filtered.reduce((acc, p) => acc + p.conversion, 0) / filtered.length).toFixed(1),
    );
    const hotspotCount = filtered.filter((p) => p.opportunity >= 75).length;
    const totalRevenue = Number(
      filtered.reduce((acc, p) => acc + p.revenue, 0).toFixed(1),
    );

    return {
      totalGrade12,
      totalLeads,
      avgConversion,
      hotspotCount,
      totalRevenue,
      count: filtered.length,
    };
  }, [provinces, activeRegion]);

  // Dynamic animated viewBox
  const computedViewBox = useMemo(() => {
    const regionConfig = REGION_CONFIGS[activeRegion];
    if (activeRegion === "all" || !regionConfig) {
      const baseW = MASTER_VIEWBOX.width / manualZoom;
      const baseH = MASTER_VIEWBOX.height / manualZoom;
      const offsetX = (MASTER_VIEWBOX.width - baseW) / 2;
      const offsetY = (MASTER_VIEWBOX.height - baseH) / 2;
      return `${offsetX} ${offsetY} ${baseW} ${baseH}`;
    }

    const [x1, y2] = projectPoint([
      regionConfig.bounds.minLongitude,
      regionConfig.bounds.minLatitude,
    ]);
    const [x2, y1] = projectPoint([
      regionConfig.bounds.maxLongitude,
      regionConfig.bounds.maxLatitude,
    ]);

    const pad = 30;
    const minX = Math.max(0, Math.min(x1, x2) - pad);
    const minY = Math.max(0, Math.min(y1, y2) - pad);
    const width = Math.min(MASTER_VIEWBOX.width, Math.abs(x2 - x1) + pad * 2);
    const height = Math.min(MASTER_VIEWBOX.height, Math.abs(y2 - y1) + pad * 2);

    return `${minX} ${minY} ${width} ${height}`;
  }, [activeRegion, manualZoom]);

  const searchResults = query.trim()
    ? provinces
        .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 5)
    : [];

  const handleZoomIn = () => setManualZoom((z) => Math.min(2.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setManualZoom((z) => Math.max(0.8, Number((z - 0.25).toFixed(2))));
  const handleResetZoom = () => {
    setManualZoom(1);
    onRegionChange("all");
  };

  const getGradientCss = () => {
    switch (activeMetric) {
      case "opportunity":
        return "bg-linear-to-r from-rose-500 via-amber-500 via-blue-500 via-teal-500 to-emerald-500";
      case "leads":
        return "bg-linear-to-r from-slate-400 via-cyan-500 via-sky-500 to-blue-600";
      case "conversion":
        return "bg-linear-to-r from-red-400 via-amber-400 via-teal-400 to-emerald-500";
      case "competition":
        return "bg-linear-to-r from-emerald-500 via-teal-500 via-amber-500 to-rose-600";
      case "revenue":
        return "bg-linear-to-r from-slate-400 via-amber-500 via-emerald-500 to-purple-600";
      default:
        return "bg-linear-to-r from-blue-200 to-blue-600";
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card-background p-3">
      {/* ========================================================================= */}
      {/* 1. LEVEL 1 HEADER: Context & Primary Metric Dimension Selector */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Bản đồ thị trường
          </h2>
          <span className="rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-500">
            {totalProvinces > 0 ? `${totalProvinces} Tỉnh` : "34 Tỉnh"}
          </span>
          <span className="hidden text-xs text-text-tertiary sm:inline">
            • Niên khóa 2026
          </span>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 rounded-xl bg-background-gray-primary/90 p-0.5">
          {METRIC_TABS.map(({ key, label }) => {
            const active = activeMetric === key;
            return (
              <button
                aria-pressed={active}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-card-background text-text-primary shadow-xs font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-gray-primary"
                }`}
                key={key}
                onClick={() => onMetricChange(key)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LEVEL 2 TOOLBAR: Filters on Left | Search & Utilities on Right */}
      {/* ========================================================================= */}
      <div className="mb-2 flex items-center justify-between gap-2 border-t border-card-surface-border/50 pt-2">
        {/* Left: Region Filter Dropdown + Campus Toggle */}
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7.5 items-center gap-1.5 rounded-lg bg-background-gray-primary/80 px-2.5 text-xs font-medium text-text-primary hover:bg-background-gray-primary">
              <Filter className="text-text-tertiary" size={12} />
              <span>{REGION_CONFIGS[activeRegion].label}</span>
              <ChevronDown className="text-text-tertiary" size={11} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-xl border border-card-border bg-card-background p-1 shadow-theme-md"
              placement="bottom start"
            >
              {REGION_KEYS.map((key) => {
                const isSelected = activeRegion === key;
                return (
                  <DropdownMenuItem
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                      isSelected
                        ? "bg-brand-500/10 font-semibold text-brand-500"
                        : "text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
                    }`}
                    key={key}
                    onAction={() => onRegionChange(key)}
                  >
                    <span>{REGION_CONFIGS[key].label}</span>
                    {isSelected && <Check className="text-brand-500" size={13} />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Toggle Campuses */}
          <button
            aria-pressed={showCampuses}
            className={`flex h-7.5 items-center rounded-lg px-2.5 text-xs font-medium transition-colors ${
              showCampuses
                ? "bg-brand-500/10 text-brand-500 font-semibold"
                : "bg-background-gray-primary/80 text-text-secondary hover:text-text-primary"
            }`}
            onClick={() => onToggleCampuses(!showCampuses)}
            type="button"
          >
            🎓 Campus FPT
          </button>
        </div>

        {/* Right: Quick Search + Reset + Export */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search */}
          <div className="relative w-36 sm:w-44">
            <Search1 className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input
              aria-label="Tìm nhanh tỉnh thành"
              className="h-7.5 w-full rounded-lg bg-background-gray-primary/80 py-0.5 pr-2.5 pl-7.5 text-xs font-medium border-0 placeholder:text-text-tertiary"
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm tỉnh/thành..."
              value={query}
            />

            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full right-0 z-50 mt-1 max-h-48 w-48 overflow-y-auto rounded-xl bg-card-background p-1 shadow-theme-md">
                {searchResults.map((p) => (
                  <button
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-background-gray-primary"
                    key={p.code}
                    onClick={() => {
                      onSelectProvince(p.code);
                      onQueryChange("");
                      setIsSearchFocused(false);
                    }}
                    type="button"
                  >
                    <span className="font-medium text-text-primary">{p.name}</span>
                    <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-500">
                      {p.opportunity} đ
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            appearance="ghost"
            className="h-7.5 gap-1 px-2 text-xs text-text-secondary hover:text-text-primary"
            onPress={onReset}
            size="sm"
          >
            <RefreshCircle1Clockwise size={12} />
            <span>Đặt lại</span>
          </Button>

          <Button
            className="h-7.5 gap-1 px-2.5 text-xs"
            onPress={onExport}
            size="sm"
            variant="primary"
          >
            <Download1 size={12} />
            <span>Xuất</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAP CANVAS: 100% Unobstructed SVG Viewport with Light/Dark Support */}
      {/* ========================================================================= */}
      <div className="relative flex flex-1 min-h-0 items-center justify-center overflow-hidden rounded-xl bg-background-gray-primary/40 p-1">
        {/* Quick Zoom Buttons (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 rounded-lg bg-card-background/90 p-0.5 shadow-xs backdrop-blur-md">
          <button
            aria-label="Phóng to"
            className="flex size-6 items-center justify-center rounded text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
            onClick={handleZoomIn}
            title="Phóng to"
            type="button"
          >
            <ZoomInIcon className="size-3.5" />
          </button>
          <button
            aria-label="Thu nhỏ"
            className="flex size-6 items-center justify-center rounded text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
            onClick={handleZoomOut}
            title="Thu nhỏ"
            type="button"
          >
            <ZoomOutIcon className="size-3.5" />
          </button>
          <button
            aria-label="Đặt lại góc nhìn"
            className="flex size-6 items-center justify-center rounded text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
            onClick={handleResetZoom}
            title="Về toàn quốc"
            type="button"
          >
            <Target3 className="size-3.5 text-brand-500" />
          </button>
        </div>

        {/* SVG Map */}
        <svg
          aria-label="Bản đồ phân bố dữ liệu tuyển sinh Việt Nam"
          className="h-full w-auto max-h-full max-w-full drop-shadow-theme-sm transition-all duration-700 ease-out"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox={computedViewBox}
        >
          <defs>
            <filter id="active-glow-clean" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Maritime Sovereign Territory */}
          <g className="maritime-sovereignty pointer-events-none select-none">
            <text
              fill="var(--color-text-tertiary, #94a3b8)"
              fillOpacity={0.3}
              fontSize={11}
              fontWeight={800}
              letterSpacing="0.25em"
              transform="rotate(65 420 450)"
              x={400}
              y={440}
            >
              BIỂN ĐÔNG VIỆT NAM
            </text>

            <g transform="translate(460, 270)">
              <circle cx={0} cy={0} r={2.5} fill="var(--color-brand-500, #3b82f6)" />
              <circle cx={8} cy={-5} r={1.8} fill="var(--color-brand-500, #3b82f6)" />
              <circle cx={-6} cy={6} r={1.8} fill="var(--color-brand-500, #3b82f6)" />
              <text
                fill="var(--color-text-secondary, #475569)"
                fontSize={8.5}
                fontWeight="bold"
                x={14}
                y={2}
              >
                QĐ. Hoàng Sa (Đà Nẵng)
              </text>
            </g>

            <g transform="translate(475, 590)">
              <circle cx={0} cy={0} r={2.5} fill="var(--color-brand-500, #3b82f6)" />
              <circle cx={12} cy={-8} r={1.8} fill="var(--color-brand-500, #3b82f6)" />
              <circle cx={-8} cy={14} r={2} fill="var(--color-brand-500, #3b82f6)" />
              <text
                fill="var(--color-text-secondary, #475569)"
                fontSize={8.5}
                fontWeight="bold"
                x={-14}
                y={32}
              >
                QĐ. Trường Sa (Khánh Hòa)
              </text>
            </g>

            <g transform="translate(145, 690)">
              <circle cx={0} cy={0} r={3} fill="#10b981" />
              <text
                fill="var(--color-text-tertiary, #94a3b8)"
                fontSize={7.5}
                fontWeight="600"
                x={-36}
                y={12}
              >
                Đảo Phú Quốc
              </text>
            </g>
          </g>

          {/* Provinces */}
          <g className="provinces-layer">
            {paths.map((path) => {
              const province = provinceByCode.get(path.code);
              if (!province) return null;

              const isSelected = selectedCode === path.code;
              const isHovered = hoveredCode === path.code;
              const metricVal = province[activeMetric];
              const fillColor = getMetricColor(activeMetric, metricVal, isHovered, isSelected);

              return (
                <path
                  aria-label={`${path.name}: ${formatMetricValue(province, activeMetric)}`}
                  className="cursor-pointer transition-all duration-150 focus:outline-none"
                  d={path.d}
                  fill={fillColor}
                  filter={isSelected ? "url(#active-glow-clean)" : undefined}
                  key={path.code}
                  onBlur={() => setHoveredCode(null)}
                  onClick={() => onSelectProvince(path.code)}
                  onFocus={() => setHoveredCode(path.code)}
                  onMouseEnter={() => setHoveredCode(path.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  role="button"
                  stroke={isSelected ? "#2563eb" : isHovered ? "rgba(37,99,235,0.7)" : "var(--color-card-background, #ffffff)"}
                  strokeLinejoin="round"
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.6 : 0.75}
                  style={{
                    transformOrigin: "center",
                    transform: isHovered && !isSelected ? "scale(1.008)" : undefined,
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectProvince(path.code);
                    }
                  }}
                />
              );
            })}
          </g>

          {/* Campus Pins */}
          {showCampuses && (
            <CampusMarkerLayer
              onSelectCampus={(campus) => {
                const prov = provinces.find((p) =>
                  p.name.toLowerCase().includes(campus.city.toLowerCase()),
                );
                if (prov) onSelectProvince(prov.code);
              }}
              projectPoint={projectPoint}
            />
          )}
        </svg>

        {/* Hover Tooltip HUD (Works cleanly in both Light & Dark modes) */}
        {hoveredProvince && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 min-w-48 -translate-x-1/2 rounded-xl border border-card-border bg-card-background/95 p-2 shadow-theme-md backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-text-primary">{hoveredProvince.name}</p>
              <span className="text-[10px] font-semibold text-brand-500">
                {opportunityLabel(hoveredProvince.opportunity)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-4 text-xs text-text-secondary">
              <span>{config.label}</span>
              <span className="font-bold text-text-primary">
                {formatMetricValue(hoveredProvince, activeMetric)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. LEVEL 4 FOOTER: Regional Summary Stats (Left) & Color Ramp (Right) */}
      {/* ========================================================================= */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Quick Regional Stats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center text-success-500 font-medium">
              +3.8% <ArrowUpward aria-hidden="true" className="ml-0.5" size={11} />
            </span>
            <span className="text-text-tertiary">Dung lượng:</span>
            <span className="font-semibold text-text-primary">
              {new Intl.NumberFormat("vi-VN").format(regionStats.totalGrade12)} HS
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="flex items-center text-success-500 font-medium">
              +14.2% <ArrowUpward aria-hidden="true" className="ml-0.5" size={11} />
            </span>
            <span className="text-text-tertiary">Leads:</span>
            <span className="font-semibold text-text-primary">
              {new Intl.NumberFormat("vi-VN").format(regionStats.totalLeads)}
            </span>
            <span className="text-text-tertiary">(CR {regionStats.avgConversion}%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="flex items-center text-success-500 font-medium">
              +14.5% <ArrowUpward aria-hidden="true" className="ml-0.5" size={11} />
            </span>
            <span className="text-text-tertiary">Doanh thu:</span>
            <span className="font-semibold text-text-primary">
              {regionStats.totalRevenue} Tỷ
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-brand-500 font-medium">
              {regionStats.hotspotCount}/{regionStats.count} Hotspots
            </span>
          </div>
        </div>

        {/* Right: Color Ramp Legend */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-secondary">{config.label}:</span>
          <span className="text-[11px] text-text-tertiary">Thấp</span>
          <div className={`h-1.5 w-20 rounded-full ${getGradientCss()}`} />
          <span className="text-[11px] text-text-tertiary">Cao</span>
        </div>
      </div>
    </div>
  );
}
