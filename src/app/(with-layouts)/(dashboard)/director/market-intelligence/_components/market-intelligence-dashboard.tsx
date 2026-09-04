"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { sortByAvailableScore } from "@/services/api/market-intelligence";
import type { DirectorMarketOverview } from "@/services/api/market-intelligence";
import AllSchoolsInspector from "./all-schools-inspector";
import MarketMap from "./market-map";
import ProvinceInspector from "./province-inspector";
import type {
  SchoolEngagementOption,
  SchoolMarkerFilters,
} from "./school-engagement-filter";
import type {
  ProvinceFeatureCollection,
  ProvinceGeometryDocument,
  ProvinceMetrics,
  RegionKey,
} from "./types";

interface Props {
  overview?: DirectorMarketOverview;
  error?: string;
}

export default function MarketIntelligenceDashboard({
  overview,
  error: apiError,
}: Props) {
  const provinces = useMemo(
    () => (overview?.provinces ?? []) as ProvinceMetrics[],
    [overview],
  );
  const [documents, setDocuments] = useState<ProvinceGeometryDocument[]>([]);
  const [query, setQuery] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [region, setRegion] = useState<RegionKey>("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schoolFilters, setSchoolFilters] = useState<SchoolMarkerFilters>({
    schoolGroups: [],
    engagementIds: [],
    potentialBand: "all",
  });
  const [geometryError, setGeometryError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/market-intelligence/vietnam-provinces-2025.json")
      .then((response) => {
        if (!response.ok) throw new Error("geometry unavailable");
        return response.json() as Promise<ProvinceGeometryDocument[]>;
      })
      .then((data) => {
        setDocuments(data);
      })
      .catch(() => setGeometryError(true))
      .finally(() => setLoading(false));
  }, [provinces]);

  const geoData = useMemo<ProvinceFeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: documents.map((document) => ({
        type: "Feature",
        properties: { code: document.Code, name: document.Name },
        geometry: document.GIS.Geometry,
      })),
    }),
    [documents],
  );

  const engagementOptions = useMemo<SchoolEngagementOption[]>(() => {
    const schoolsByEngagement = new Map<string, SchoolEngagementOption>();

    provinces
      .flatMap((province) => province.highSchools)
      .forEach((school) => {
        school.participations.forEach((participation) => {
          const existing = schoolsByEngagement.get(participation.id);
          if (existing) {
            existing.schoolCount += 1;
            return;
          }
          schoolsByEngagement.set(participation.id, {
            id: participation.id,
            name: participation.name,
            type: participation.type,
            schoolCount: 1,
          });
        });
      });

    return [...schoolsByEngagement.values()].sort(
      (left, right) =>
        right.schoolCount - left.schoolCount ||
        left.name.localeCompare(right.name, "vi"),
    );
  }, [provinces]);
  const filteredProvinces = useMemo(() => {
    return provinces.map((province) => {
      const highSchools = province.highSchools.filter((school) => {
        const matchesEngagement =
          schoolFilters.engagementIds.length === 0 ||
          school.participations.some((participation) =>
            schoolFilters.engagementIds.includes(participation.id),
          );
        const matchesSchoolGroup =
          schoolFilters.schoolGroups.length === 0 ||
          (school.classification !== null &&
            schoolFilters.schoolGroups.includes(school.classification));
        const matchesPotentialBand =
          schoolFilters.potentialBand === "all" ||
          (school.potentialScore !== null &&
            (schoolFilters.potentialBand === "80-plus"
              ? school.potentialScore >= 80
              : schoolFilters.potentialBand === "60-to-79"
                ? school.potentialScore >= 60 && school.potentialScore < 80
                : school.potentialScore < 60));
        const matchesName =
          !schoolQuery.trim() ||
          school.name
            .toLocaleLowerCase("vi")
            .includes(schoolQuery.trim().toLocaleLowerCase("vi"));
        return (
          matchesEngagement &&
          matchesSchoolGroup &&
          matchesPotentialBand &&
          matchesName
        );
      });
      return { ...province, highSchools, schoolCount: highSchools.length };
    });
  }, [provinces, schoolFilters, schoolQuery]);
  const filteredSelectedProvince = selectedCode
    ? (filteredProvinces.find((province) => province.code === selectedCode) ??
      null)
    : null;

  const visibleSelectedSchoolId =
    selectedSchoolId &&
    filteredProvinces.some((province) =>
      province.highSchools.some((school) => school.id === selectedSchoolId),
    )
      ? selectedSchoolId
      : null;
  const selectProvince = (code: string) => {
    setSelectedCode(code);
    setSelectedSchoolId(null);
  };
  const selectSchool = (provinceCode: string, schoolId: string) => {
    setSelectedCode(provinceCode);
    setSelectedSchoolId(schoolId);
  };
  const changeRegion = (nextRegion: RegionKey) => {
    setRegion(nextRegion);
    setSelectedSchoolId(null);
    if (nextRegion === "all") {
      setSelectedCode(null);
      return;
    }
    const first = sortByAvailableScore(
      provinces.filter((province) => province.regionKey === nextRegion),
      "opportunity",
    )[0];
    setSelectedCode(first?.code ?? null);
  };
  if (apiError || geometryError) return <MapError message={apiError} />;
  if (loading)
    return (
      <div className="h-[640px] animate-pulse rounded-2xl bg-card-background/60" />
    );
  return (
    <main className="min-w-0 px-2 py-3 lg:px-6 xl:h-[calc(100vh-112px)] xl:overflow-hidden">
      <div className="grid min-h-[640px] min-w-0 grid-cols-1 items-stretch gap-2 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <MarketMap
          activeRegion={region}
          admissionYear={overview?.admissionYear ?? null}
          engagementOptions={engagementOptions}
          geoData={geoData}
          onClearSelection={() => {
            setSelectedCode(null);
            setSelectedSchoolId(null);
          }}
          onEngagementChange={setSchoolFilters}
          onQueryChange={setQuery}
          onRegionChange={changeRegion}
          onSelectProvince={selectProvince}
          onSelectSchool={selectSchool}
          provinces={filteredProvinces}
          query={query}
          schoolFilters={schoolFilters}
          selectedCode={selectedCode}
          selectedSchoolId={visibleSelectedSchoolId}
          totalProvinces={overview?.totalProvinces ?? documents.length}
        />
        {region === "all" && !selectedCode ? (
          <AllSchoolsInspector
            onSchoolQueryChange={setSchoolQuery}
            onSelectSchool={selectSchool}
            provinces={filteredProvinces}
            schoolQuery={schoolQuery}
          />
        ) : (
          <ProvinceInspector
            onSelectSchool={selectSchool}
            province={filteredSelectedProvince}
            selectedSchoolId={visibleSelectedSchoolId}
          />
        )}
      </div>
    </main>
  );
}

function MapError({ message }: { message?: string }) {
  return (
    <div
      className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl bg-card-background px-6 text-center"
      role="alert"
    >
      <span className="text-3xl" aria-hidden="true">
        ⚠️
      </span>
      <h2 className="mt-3 text-base font-bold text-text-primary">
        Không thể tải dữ liệu bản đồ thị trường
      </h2>
      <p className="mt-1 max-w-md text-xs text-text-secondary">
        {message ?? "Không thể tải ranh giới hành chính."}
      </p>
      <Button
        className="mt-4"
        onPress={() => window.location.reload()}
        size="sm"
        variant="primary"
      >
        Tải lại trang
      </Button>
    </div>
  );
}
