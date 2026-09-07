"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import SchoolCreateDialog from "./school-create-dialog";
import PrioritySchoolsTable from "./priority-schools-table";
import ProvinceRankingChart from "./province-ranking-chart";
import RegionalDistributionChart from "./regional-distribution-chart";
import SchoolReportHeader from "./school-report-header";
import SchoolReportKpis from "./school-report-kpis";

import {
  createSchool,
  type SchoolCreateFields,
} from "@/services/api/student-school-update";
import type {
  SchoolRegion,
  SchoolReportData,
} from "@/services/api/schools/types";

interface SchoolReportDashboardProps {
  data: SchoolReportData;
}

export default function SchoolReportDashboard({
  data,
}: SchoolReportDashboardProps) {
  const router = useRouter();
  const [region, setRegion] = useState<SchoolRegion | "all">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const createMutation = useMutation({
    mutationFn: (fields: SchoolCreateFields) => createSchool(fields),
    onSuccess: (response) => {
      setCreateDialogOpen(false);
      toast.success("Đã tạo hồ sơ trường học.");
      router.push(`/director/schools/${encodeURIComponent(response.name)}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể tạo hồ sơ trường học.",
      );
    },
  });
  const filtered = useMemo(() => {
    if (region === "all") return data;
    const provinces = data.provinces.filter((item) => item.region === region);
    const priorityList = data.priorityList.filter(
      (item) => item.region === region,
    );
    const regionalData = data.regions.filter((item) => item.region === region);
    const totalSchools = provinces.reduce(
      (total, item) => total + item.schools,
      0,
    );
    const prioritySchools = provinces.reduce(
      (total, item) => total + item.prioritySchools,
      0,
    );
    const averagePotential = totalSchools
      ? Math.round(
          provinces.reduce(
            (total, item) => total + item.averagePotential * item.schools,
            0,
          ) / totalSchools,
        )
      : 0;
    return {
      totalSchools,
      totalProvinces: provinces.length,
      prioritySchools,
      averagePotential,
      regions: regionalData,
      provinces,
      priorityList,
    };
  }, [data, region]);

  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <SchoolReportHeader
        onCreateSchool={() => {
          createMutation.reset();
          setCreateDialogOpen(true);
        }}
        onRegionChange={setRegion}
        region={region}
      />
      <SchoolCreateDialog
        isOpen={createDialogOpen}
        isSubmitting={createMutation.isPending}
        onCreate={(fields) =>
          createMutation.mutateAsync(fields).then(() => undefined)
        }
        onOpenChange={setCreateDialogOpen}
      />
      <SchoolReportKpis data={filtered} />
      <section className="grid min-w-0 gap-5 xl:grid-cols-2">
        <RegionalDistributionChart data={data.regions} />
        <ProvinceRankingChart provinces={filtered.provinces} />
      </section>
      <PrioritySchoolsTable schools={filtered.priorityList.slice(0, 10)} />
    </main>
  );
}
