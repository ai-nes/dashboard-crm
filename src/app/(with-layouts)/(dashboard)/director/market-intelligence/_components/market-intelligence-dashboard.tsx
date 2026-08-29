"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
import { toProvinceMetrics } from "./data";
import MarketMap from "./market-map";
import ProvinceInspector from "./province-inspector";
import type {
  MetricKey,
  ProvinceFeatureCollection,
  ProvinceGeometryDocument,
  ProvinceMetrics,
  RegionKey,
} from "./types";

export default function MarketIntelligenceDashboard() {
  const [documents, setDocuments] = useState<ProvinceGeometryDocument[]>([]);
  const [query, setQuery] = useState("");
  const [metric, setMetric] = useState<MetricKey>("opportunity");
  const [region, setRegion] = useState<RegionKey>("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [showCampuses, setShowCampuses] = useState(true);
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

  const provinces = useMemo(() => documents.map(toProvinceMetrics), [documents]);

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

  const handleReset = () => {
    setMetric("opportunity");
    setRegion("all");
    setQuery("");
    setShowCampuses(true);
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
    <div className="flex h-[calc(100vh-112px)] max-h-[calc(100vh-112px)] w-full flex-col overflow-hidden p-1">
      {error ? (
        <MapError />
      ) : loading ? (
        <div className="grid h-full grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="h-full animate-pulse rounded-2xl bg-card-background/60" />
          <div className="h-full animate-pulse rounded-2xl bg-card-background/60" />
        </div>
      ) : (
        <div className="grid h-full grid-cols-1 items-stretch gap-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)] overflow-hidden">
          {/* Map Canvas Card with Embedded Header & Controls */}
          <MarketMap
            activeMetric={metric}
            activeRegion={region}
            geoData={geoData}
            onExport={handleExport}
            onMetricChange={setMetric}
            onQueryChange={setQuery}
            onRegionChange={setRegion}
            onReset={handleReset}
            onSelectProvince={setSelectedCode}
            onToggleCampuses={setShowCampuses}
            provinces={provinces}
            query={query}
            selectedCode={selectedCode}
            showCampuses={showCampuses}
            totalProvinces={documents.length}
          />

          {/* 360° Province Inspector Card */}
          <ProvinceInspector
            onSelectProvince={setSelectedCode}
            province={selectedProvince}
          />
        </div>
      )}
    </div>
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
