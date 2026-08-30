"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { sortByAvailableScore } from "@/services/api/market-intelligence";
import type { DirectorMarketOverview } from "@/services/api/market-intelligence";
import MarketMap from "./market-map";
import ProvinceInspector from "./province-inspector";
import type { ProvinceFeatureCollection, ProvinceGeometryDocument, ProvinceMetrics, RegionKey } from "./types";

interface Props { overview?: DirectorMarketOverview; error?: string }

export default function MarketIntelligenceDashboard({ overview, error: apiError }: Props) {
  const router = useRouter();
  const provinces = useMemo(() => (overview?.provinces ?? []) as ProvinceMetrics[], [overview]);
  const [documents, setDocuments] = useState<ProvinceGeometryDocument[]>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionKey>("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
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
        const first = provinces.find((province) => province.name.includes("Hà Nội")) ?? provinces[0];
        setSelectedCode(first?.code ?? null);
      })
      .catch(() => setGeometryError(true))
      .finally(() => setLoading(false));
  }, [provinces]);

  const geoData = useMemo<ProvinceFeatureCollection>(() => ({
    type: "FeatureCollection",
    features: documents.map((document) => ({
      type: "Feature",
      properties: { code: document.Code, name: document.Name },
      geometry: document.GIS.Geometry,
    })),
  }), [documents]);

  const selectedProvince = selectedCode ? provinces.find((province) => province.code === selectedCode) ?? null : null;
  const selectProvince = (code: string) => { setSelectedCode(code); setSelectedSchoolId(null); };
  const selectSchool = (provinceCode: string, schoolId: string) => {
    setSelectedCode(provinceCode);
    setSelectedSchoolId(schoolId);
    const school = provinces.find((province) => province.code === provinceCode)?.highSchools.find((item) => item.id === schoolId);
    if (school?.directoryId) router.push(`/director/schools/${school.directoryId}`);
  };
  const changeRegion = (nextRegion: RegionKey) => {
    setRegion(nextRegion);
    setSelectedSchoolId(null);
    if (nextRegion === "all") return;
    const first = sortByAvailableScore(provinces.filter((province) => province.regionKey === nextRegion), "opportunity")[0];
    setSelectedCode(first?.code ?? null);
  };
  const reset = () => {
    setRegion("all"); setQuery(""); setSelectedSchoolId(null);
    setSelectedCode(provinces.find((province) => province.name.includes("Hà Nội"))?.code ?? provinces[0]?.code ?? null);
    toast.success("Đã đặt lại bộ lọc bản đồ.");
  };
  const exportData = () => {
    const columns = ["code", "name", "regionKey", "grade12Population", "opportunity", "leads", "conversion", "competition", "revenue"] as const;
    const csv = [columns.join(","), ...provinces.map((province) => columns.map((key) => province[key] === null ? "" : JSON.stringify(province[key])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `market-intelligence-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  if (apiError || geometryError) return <MapError message={apiError} />;
  if (loading) return <div className="h-[640px] animate-pulse rounded-2xl bg-card-background/60" />;
  return (
    <main className="min-w-0 px-2 py-3 lg:px-6 xl:h-[calc(100vh-112px)] xl:overflow-hidden">
      <div className="grid min-h-[640px] min-w-0 grid-cols-1 items-stretch gap-2 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <MarketMap activeRegion={region} admissionYear={overview?.admissionYear ?? null} geoData={geoData} onExport={exportData} onClearSelection={() => { setSelectedCode(null); setSelectedSchoolId(null); }} onQueryChange={setQuery} onRegionChange={changeRegion} onReset={reset} onSelectProvince={selectProvince} onSelectSchool={selectSchool} provinces={provinces} query={query} selectedCode={selectedCode} selectedSchoolId={selectedSchoolId} totalProvinces={overview?.totalProvinces ?? documents.length} />
        <ProvinceInspector onSelectSchool={selectSchool} province={selectedProvince} selectedSchoolId={selectedSchoolId} />
      </div>
    </main>
  );
}

function MapError({ message }: { message?: string }) {
  return <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl bg-card-background px-6 text-center" role="alert"><span className="text-3xl" aria-hidden="true">⚠️</span><h2 className="mt-3 text-base font-bold text-text-primary">Không thể tải dữ liệu bản đồ thị trường</h2><p className="mt-1 max-w-md text-xs text-text-secondary">{message ?? "Không thể tải ranh giới hành chính."}</p><Button className="mt-4" onPress={() => window.location.reload()} size="sm" variant="primary">Tải lại trang</Button></div>;
}
