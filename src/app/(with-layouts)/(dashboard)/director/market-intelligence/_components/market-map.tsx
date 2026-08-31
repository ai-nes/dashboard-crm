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
  Check,
  ChevronDown,
  Download1,
  Filter,
  Search1,
  Target3,
} from "@tailgrids/icons";
import { averageAvailable, sumAvailable } from "@/services/api/market-intelligence";
import { formatMetricValue, getMetricColor, METRICS_CONFIG, REGION_CONFIGS } from "./data";
import HighSchoolMarkerLayer from "./high-school-marker-layer";
import { ZoomInIcon, ZoomOutIcon } from "./icons";
import type {
  MetricKey,
  MapBounds,
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

// Default viewport for the active southern market: Khánh Hoà, Đắk Lắk,
// Lâm Đồng, TP.HCM, Đồng Nai, Đồng Tháp and Tây Ninh.
const PRIORITY_MARKET_BOUNDS: MapBounds = {
  minLongitude: 104.9,
  maxLongitude: 109.8,
  minLatitude: 8.4,
  maxLatitude: 14.1,
};

const REGION_KEYS: RegionKey[] = ["all", "north", "central", "highlands", "south", "mekong"];

interface MarketMapProps {
  activeRegion: RegionKey;
  admissionYear: number | null;
  geoData: ProvinceFeatureCollection;
  onQueryChange: (query: string) => void;
  onRegionChange: (region: RegionKey) => void;
  onExport: () => void;
  onClearSelection: () => void;
  onSelectProvince: (code: string) => void;
  onSelectSchool: (provinceCode: string, schoolId: string) => void;
  provinces: ProvinceMetrics[];
  query: string;
  selectedCode: string | null;
  selectedSchoolId: string | null;
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

function getBoundsViewBox(bounds: MapBounds, zoom: number) {
  const [left, bottom] = projectPoint([bounds.minLongitude, bounds.minLatitude]);
  const [right, top] = projectPoint([bounds.maxLongitude, bounds.maxLatitude]);
  const padding = 30;
  const baseMinX = Math.max(0, Math.min(left, right) - padding);
  const baseMinY = Math.max(0, Math.min(top, bottom) - padding);
  const baseWidth = Math.min(MASTER_VIEWBOX.width, Math.abs(right - left) + padding * 2);
  const baseHeight = Math.min(MASTER_VIEWBOX.height, Math.abs(bottom - top) + padding * 2);
  const centerX = baseMinX + baseWidth / 2;
  const centerY = baseMinY + baseHeight / 2;
  const width = Math.min(MASTER_VIEWBOX.width, baseWidth / zoom);
  const height = Math.min(MASTER_VIEWBOX.height, baseHeight / zoom);
  const minX = Math.max(0, Math.min(MASTER_VIEWBOX.width - width, centerX - width / 2));
  const minY = Math.max(0, Math.min(MASTER_VIEWBOX.height - height, centerY - height / 2));

  return `${minX} ${minY} ${width} ${height}`;
}

function getProvinceMapValue(province: ProvinceMetrics | undefined, metric: MetricKey) {
  if (!province) return null;
  if (metric !== "opportunity" || province.opportunity !== null) return province[metric];

  // Some API responses only expose potential at school level. Use that
  // available signal so the province choropleth does not fall back to gray.
  return averageAvailable(province.highSchools.map((school) => school.potentialScore));
}

export default function MarketMap({
  activeRegion,
  admissionYear,
  geoData,
  onQueryChange,
  onRegionChange,
  onExport,
  onClearSelection,
  onSelectProvince,
  onSelectSchool,
  provinces,
  query,
  selectedCode,
  selectedSchoolId,
  totalProvinces,
}: MarketMapProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [manualZoom, setManualZoom] = useState<number>(1);
  const [isPriorityFocus, setIsPriorityFocus] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const provinceByCode = useMemo(
    () => new Map(provinces.map((province) => [province.code, province])),
    [provinces],
  );
  const totalSchools = useMemo(
    () => provinces.reduce((total, province) => total + province.highSchools.length, 0),
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

  const activeMetric: MetricKey = "opportunity";
  const config = METRICS_CONFIG.opportunity;

  // Embedded region summary statistics inside map card
  const regionStats = useMemo(() => {
    const filtered =
      activeRegion === "all"
        ? provinces
        : provinces.filter((p) => p.regionKey === activeRegion);

    const totalGrade12 = sumAvailable(filtered.map((province) => province.grade12Population));
    const totalLeads = sumAvailable(filtered.map((province) => province.leads));
    const average = averageAvailable(filtered.map((province) => province.conversion));
    const avgConversion = average === null ? null : Number(average.toFixed(1));
    const availableOpportunities = filtered
      .map((province) => getProvinceMapValue(province, "opportunity"))
      .filter((value): value is number => value !== null);
    const hotspotCount = availableOpportunities.length
      ? availableOpportunities.filter((value) => value >= 75).length
      : null;
    const totalRevenueValue = sumAvailable(filtered.map((province) => province.revenue));
    const totalRevenue = totalRevenueValue === null ? null : Number(totalRevenueValue.toFixed(1));

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
    if (activeRegion === "all" && isPriorityFocus) {
      return getBoundsViewBox(PRIORITY_MARKET_BOUNDS, manualZoom);
    }

    if (activeRegion === "all" || !regionConfig) {
      const baseW = MASTER_VIEWBOX.width / manualZoom;
      const baseH = MASTER_VIEWBOX.height / manualZoom;
      const offsetX = (MASTER_VIEWBOX.width - baseW) / 2;
      const offsetY = (MASTER_VIEWBOX.height - baseH) / 2;
      return `${offsetX} ${offsetY} ${baseW} ${baseH}`;
    }

    return getBoundsViewBox(regionConfig.bounds, manualZoom);
  }, [activeRegion, isPriorityFocus, manualZoom]);

  const searchResults = query.trim()
    ? provinces
        .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 5)
    : [];

  const handleZoomIn = () => setManualZoom((z) => Math.min(2.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setManualZoom((z) => Math.max(0.8, Number((z - 0.25).toFixed(2))));
  const handleResetZoom = () => {
    setManualZoom(1);
    setIsPriorityFocus((isFocused) => !isFocused);
    onRegionChange("all");
  };

  const getGradientCss = () => {
    return "bg-linear-to-r from-rose-500 via-amber-500 via-blue-500 via-teal-500 to-emerald-500";
  };

  return (
    <div className="flex h-full min-h-[640px] min-w-0 flex-col overflow-hidden rounded-2xl bg-card-background p-3 xl:min-h-0">
      {/* ========================================================================= */}
      {/* 1. LEVEL 1 HEADER: Context & Primary Metric Dimension Selector */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Bản đồ thị trường & trường THPT
          </h2>
          <span className="rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-500">
            {totalProvinces > 0 ? `${totalProvinces} tỉnh` : "-"}
          </span>
          <span className="hidden text-xs text-text-tertiary sm:inline">
            • {totalSchools} trường nổi bật · {admissionYear === null ? "Kỳ hiện hành" : `Niên khóa ${admissionYear}`}
          </span>
        </div>

        <span className="rounded-full bg-badge-primary-background px-2.5 py-1 text-[11px] font-semibold text-badge-primary-text">Xếp theo tiềm năng</span>
      </div>

      {/* ========================================================================= */}
      {/* 2. LEVEL 2 TOOLBAR: Filters on Left | Search & Utilities on Right */}
      {/* ========================================================================= */}
      <div className="mb-2 flex items-center justify-between gap-2 border-t border-card-surface-border/50 pt-2">
        {/* Left: Region Filter Dropdown */}
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

        </div>

        {/* Right: Quick Search + Reset + Export */}
        <div className="flex items-center gap-1.5">
          {/* Quick Search */}
          <div className="relative w-36 sm:w-44">
            <Search1 className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input
              aria-label="Tìm nhanh tỉnh thành"
              className="h-7.5 w-full rounded-lg bg-background-gray-primary/80 py-0.5 pr-2.5 pl-7.5 text-xs font-medium border-0 placeholder:text-text-tertiary"
              id="market-province-search"
              name="province"
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm tỉnh/thành..."
              value={query}
            />

            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full right-0 z-50 mt-1 max-h-48 w-48 overflow-y-auto rounded-xl bg-card-background p-1 shadow-theme-md">
                {searchResults.map((p) => {
                  const opportunity = getProvinceMapValue(p, "opportunity");
                  return (
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
                        {opportunity === null ? "-" : `${Math.round(opportunity)} /100`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
        <div className="pointer-events-none absolute top-2.5 right-2.5 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-x-3 gap-y-1 rounded-lg bg-card-background/90 px-2.5 py-1.5 text-[10px] shadow-xs backdrop-blur-md">
          <span className="flex items-center gap-1.5 text-text-secondary"><span className="size-2.5 animate-pulse rounded-full bg-success-500" aria-hidden="true" />Trọng điểm</span>
          <span className="flex items-center gap-1.5 text-text-secondary"><span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />Mở rộng</span>
          <span className="flex items-center gap-1.5 text-text-secondary"><span className="size-1.5 rounded-full bg-warning-500" aria-hidden="true" />Duy trì</span>
          <span className="flex items-center gap-1.5 text-text-secondary"><span className="size-1 rounded-full bg-text-tertiary" aria-hidden="true" />Sàng lọc</span>
        </div>

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
            aria-label={isPriorityFocus ? "Về toàn quốc" : "Về 7 tỉnh trọng điểm"}
            className="flex size-6 items-center justify-center rounded text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
            onClick={handleResetZoom}
            title={isPriorityFocus ? "Về toàn quốc" : "Về 7 tỉnh trọng điểm"}
            type="button"
          >
            <Target3 className="size-3.5 text-brand-500" />
          </button>
        </div>

        {/* SVG Map */}
        <svg
          aria-label={isPriorityFocus && activeRegion === "all"
            ? "Bản đồ phân bố dữ liệu tuyển sinh tại 7 tỉnh trọng điểm phía Nam"
            : "Bản đồ phân bố dữ liệu tuyển sinh Việt Nam"}
          className="h-full w-auto max-h-full max-w-full drop-shadow-theme-sm transition-all duration-700 ease-out"
          onClick={onClearSelection}
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
              const isSelected = selectedCode === path.code;
              const isHovered = hoveredCode === path.code;
              const metricVal = getProvinceMapValue(province, activeMetric);
              const metricLabel =
                province && activeMetric === "opportunity" && metricVal !== null && province.opportunity === null
                  ? `${Math.round(metricVal)} /100`
                  : province
                    ? formatMetricValue(province, activeMetric)
                    : "-";
              const fillColor = getMetricColor(activeMetric, metricVal, isHovered, isSelected);

              return (
                <path
                  aria-label={`${path.name}: ${metricLabel}`}
                  className={`${province ? "cursor-pointer" : "cursor-default"} transition-all duration-150 focus:outline-none`}
                  d={path.d}
                  fill={fillColor}
                  filter={isSelected ? "url(#active-glow-clean)" : undefined}
                  key={path.code}
                  onBlur={() => setHoveredCode(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (province) onSelectProvince(path.code);
                  }}
                  onFocus={() => setHoveredCode(path.code)}
                  onMouseEnter={() => setHoveredCode(path.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  role={province ? "button" : undefined}
                  stroke={isSelected ? "#2563eb" : isHovered ? "rgba(37,99,235,0.7)" : "var(--color-card-background, #ffffff)"}
                  strokeLinejoin="round"
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.6 : 0.75}
                  style={{
                    transformOrigin: "center",
                    transform: isHovered && !isSelected ? "scale(1.008)" : undefined,
                  }}
                  tabIndex={province ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (province) onSelectProvince(path.code);
                    }
                  }}
                />
              );
            })}
          </g>

          <HighSchoolMarkerLayer
            activeRegion={activeRegion}
            geoData={geoData}
            onSelectSchool={onSelectSchool}
            projectPoint={projectPoint}
            provinces={provinces}
            selectedProvinceCode={selectedCode}
            selectedSchoolId={selectedSchoolId}
          />

        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 4. LEVEL 4 FOOTER: Regional Summary Stats (Left) & Color Ramp (Right) */}
      {/* ========================================================================= */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Quick Regional Stats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-text-tertiary">Dung lượng:</span>
            <span className="font-semibold text-text-primary">
              {formatNullableNumber(regionStats.totalGrade12, " HS")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-tertiary">Leads:</span>
            <span className="font-semibold text-text-primary">
              {formatNullableNumber(regionStats.totalLeads)}
            </span>
            <span className="text-text-tertiary">(CR {regionStats.avgConversion === null ? "-" : `${regionStats.avgConversion}%`})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-tertiary">Doanh thu:</span>
            <span className="font-semibold text-text-primary">
              {regionStats.totalRevenue === null ? "-" : `${regionStats.totalRevenue} Tỷ`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-brand-500 font-medium">
              {regionStats.hotspotCount === null ? "-" : `${regionStats.hotspotCount}/${regionStats.count}`} Hotspots
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

function formatNullableNumber(value: number | null, suffix = "") {
  return value === null ? "-" : `${new Intl.NumberFormat("vi-VN").format(value)}${suffix}`;
}
