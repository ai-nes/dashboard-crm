"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { toProvinceMetrics } from "./data";
import MarketMap from "./market-map";
import ProvinceInspector from "./province-inspector";
import type {
  ProvinceFeatureCollection,
  ProvinceGeometryDocument,
  ProvinceMetrics,
  RegionKey,
} from "./types";

interface MarketDirectorySchool {
  id: string;
  provinceCode: string;
  district: string;
  name: string;
}

interface MarketIntelligenceDashboardProps {
  schoolDirectory: MarketDirectorySchool[];
}

export default function MarketIntelligenceDashboard({ schoolDirectory }: MarketIntelligenceDashboardProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<ProvinceGeometryDocument[]>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionKey>("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/market-intelligence/vietnam-provinces-2025.json")
      .then((response) => {
        if (!response.ok) throw new Error("Không thể tải ranh giới hành chính.");
        return response.json() as Promise<ProvinceGeometryDocument[]>;
      })
      .then((data) => {
        setDocuments(data);
        const hn = data.find((d) => d.Name.includes("Hà Nội"));
        setSelectedCode(hn?.Code ?? data[0]?.Code ?? null);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const schoolsByProvince = useMemo(() => {
    const map = new Map<string, MarketDirectorySchool[]>();

    for (const school of schoolDirectory) {
      map.set(school.provinceCode, [...(map.get(school.provinceCode) ?? []), school]);
    }

    return map;
  }, [schoolDirectory]);

  const provinces = useMemo(
    () => documents.map((document) => toProvinceMetrics(document, schoolsByProvince.get(document.Code))),
    [documents, schoolsByProvince],
  );

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

  const selectedProvince = useMemo<ProvinceMetrics | null>(() => {
    if (!selectedCode) return null;
    return provinces.find((p) => p.code === selectedCode) ?? null;
  }, [provinces, selectedCode]);

  const handleSelectProvince = (code: string) => {
    setSelectedCode(code);
    setSelectedSchoolId(null);
  };

  const handleClearSelection = () => {
    setSelectedCode(null);
    setSelectedSchoolId(null);
  };

  const handleSelectSchool = (provinceCode: string, schoolId: string) => {
    setSelectedCode(provinceCode);
    setSelectedSchoolId(schoolId);

    const school = provinces
      .find((province) => province.code === provinceCode)
      ?.highSchools.find((item) => item.id === schoolId);

    if (school?.directoryId) {
      router.push(`/director/schools/${school.directoryId}`);
    }
  };

  const handleRegionChange = (nextRegion: RegionKey) => {
    setRegion(nextRegion);
    setSelectedSchoolId(null);

    if (nextRegion === "all") return;

    const firstProvince = provinces
      .filter((province) => province.regionKey === nextRegion)
      .sort((left, right) => right.opportunity - left.opportunity)[0];

    if (firstProvince) setSelectedCode(firstProvince.code);
  };

  const handleReset = () => {
    setRegion("all");
    setQuery("");
    setSelectedSchoolId(null);
    const hn = documents.find((d) => d.Name.includes("Hà Nội"));
    setSelectedCode(hn?.Code ?? documents[0]?.Code ?? null);
    toast.success("Đã đặt lại bộ lọc bản đồ!");
  };

  const handleExport = () => {
    const csvContent = [
      ["Mã Tỉnh", "Tên Tỉnh", "Vùng", "Dung lượng Lớp 12", "Điểm Tiềm Năng", "Leads", "Tỷ lệ CR (%)", "Cạnh Tranh", "Doanh Thu (Tỷ VND)"].join(","),
      ...provinces.map((p) =>
        [
          p.code,
          `"${p.name}"`,
          `"${p.regionKey}"`,
          p.grade12Population,
          p.opportunity,
          p.leads,
          p.conversion,
          p.competition,
          p.revenue,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao-cao-thi-truong-tuyen-sinh-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất dữ liệu bản đồ thị trường thành công!");
  };

  return (
    <main className="min-w-0 px-2 py-3 lg:px-6 xl:h-[calc(100vh-112px)] xl:overflow-hidden">
      {error ? (
        <MapError />
      ) : loading ? (
        <div className="grid h-full grid-cols-1 gap-2 xl:min-h-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
          <div className="h-full animate-pulse rounded-2xl bg-card-background/60" />
          <div className="h-full animate-pulse rounded-2xl bg-card-background/60" />
        </div>
      ) : (
        <div className="grid min-h-[640px] min-w-0 grid-cols-1 items-stretch gap-2 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
          <MarketMap
            activeRegion={region}
            geoData={geoData}
            onExport={handleExport}
            onClearSelection={handleClearSelection}
            onQueryChange={setQuery}
            onRegionChange={handleRegionChange}
            onReset={handleReset}
            onSelectProvince={handleSelectProvince}
            onSelectSchool={handleSelectSchool}
            provinces={provinces}
            query={query}
            selectedCode={selectedCode}
            selectedSchoolId={selectedSchoolId}
            totalProvinces={documents.length}
          />

          <ProvinceInspector
            onSelectSchool={handleSelectSchool}
            province={selectedProvince}
            selectedSchoolId={selectedSchoolId}
          />
        </div>
      )}
    </main>
  );
}

function MapError() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl bg-card-background px-6 text-center">
      <span className="text-3xl">⚠️</span>
      <h2 className="mt-3 text-base font-bold text-text-primary">
        Không thể tải dữ liệu bản đồ thị trường
      </h2>
      <p className="mt-1 max-w-md text-xs text-text-secondary">
        Vui lòng kiểm tra lại kết nối hoặc tệp ranh giới hành chính địa phương.
      </p>
      <Button className="mt-4" onPress={() => window.location.reload()} size="sm" variant="primary">
        Tải lại trang
      </Button>
    </div>
  );
}
