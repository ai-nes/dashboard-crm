"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import DetailTabs, {
  type DetailTabItem,
} from "@/components/common/detail-tabs";
import type { SchoolUpdateFields } from "@/services/api/student-school-update";
import { deleteSchool } from "@/services/api/student-school-update";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import ActivityTimeline from "./activity-timeline";
import SchoolAcademicProfile from "./school-academic-profile";
import SchoolActionPlan from "./school-action-plan";
import SchoolHeader from "./school-header";
import SchoolInformationTab from "./school-information-tab";
import SchoolOutcomes from "./school-outcomes";
import SchoolExamScoreDistribution from "./school-exam-score-distribution";
import SchoolRelationshipCard from "./school-relationship-card";

interface SchoolIntelligenceDashboardProps {
  data: SchoolIntelligenceData;
}

/**
 * School 360 detail entry point.
 *
 * The order is intentionally kept aligned with docs/school360: context and
 * priority first, then outcomes, academic profile, relationship and activity
 * follow-up. Locality is summarized in the overview map.
 */
export default function SchoolIntelligenceDashboard({
  data,
}: SchoolIntelligenceDashboardProps) {
  const router = useRouter();
  const [updatedFields, setUpdatedFields] = useState<SchoolUpdateFields>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const currentData = mergeSchoolUpdates(data, updatedFields);

  const deleteMutation = useMutation({
    mutationFn: () => deleteSchool(data.school.id),
    onSuccess: () => {
      setDeleteDialogOpen(false);
      toast.success("Đã xóa hồ sơ trường học.");
      router.replace("/director/schools");
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể xóa hồ sơ trường học.",
      );
    },
  });

  const handleSchoolUpdated = (fields: SchoolUpdateFields) => {
    setUpdatedFields((current) => ({ ...current, ...fields }));
  };

  return (
    <main className="min-w-0 px-2 py-4 pb-8 lg:px-6">
      <SchoolHeader
        data={currentData}
        onDeleteRequest={() => setDeleteDialogOpen(true)}
      />
      <DetailTabs
        ariaLabel="Các phần trong hồ sơ trường học"
        className="mt-4"
        defaultSelectedKey="overview"
        tabs={getSchoolTabs(currentData, handleSchoolUpdated)}
      />
      <DeleteRecordDialog
        isDeleting={deleteMutation.isPending}
        isOpen={deleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        onOpenChange={setDeleteDialogOpen}
        recordName={currentData.school.name || data.school.id}
        recordType="hồ sơ trường học"
      />
    </main>
  );
}

function mergeSchoolUpdates(
  data: SchoolIntelligenceData,
  fields: SchoolUpdateFields,
): SchoolIntelligenceData {
  return {
    ...data,
    school: {
      ...data.school,
      ...(fields.school_name !== undefined && {
        name: fields.school_name?.toString() ?? "",
      }),
      ...(fields.school_area !== undefined && {
        area: fields.school_area?.toString() ?? "",
      }),
      ...(fields.school_type !== undefined && {
        schoolType: fields.school_type?.toString() ?? null,
      }),
      ...(fields.school_tier !== undefined && {
        schoolTier: fields.school_tier?.toString() ?? null,
      }),
      ...(fields.boarding_type !== undefined && {
        boardingType: fields.boarding_type?.toString() ?? null,
        isBoardingSchool: fields.boarding_type === "Boarding School",
      }),
      ...(fields.province !== undefined && {
        province: fields.province?.toString() ?? "",
      }),
      ...(fields.ward !== undefined && {
        district: fields.ward?.toString() ?? "",
      }),
      ...(fields.address !== undefined && {
        address: fields.address?.toString() ?? "",
      }),
      ...(fields.phone !== undefined && {
        phone: fields.phone?.toString() ?? null,
      }),
      ...(fields.email !== undefined && {
        email: fields.email?.toString() ?? null,
      }),
      ...(fields.latitude !== undefined && {
        latitude: typeof fields.latitude === "number" ? fields.latitude : null,
      }),
      ...(fields.longitude !== undefined && {
        longitude:
          typeof fields.longitude === "number" ? fields.longitude : null,
      }),
    },
  };
}

function getSchoolTabs(
  data: SchoolIntelligenceData,
  onSchoolUpdated: (fields: SchoolUpdateFields) => void,
): DetailTabItem[] {
  return [
    {
      id: "overview",
      label: "Hành động tiếp theo",
      content: <SchoolActionPlan data={data} />,
    },
    {
      id: "outcomes",
      label: "Kết quả tuyển sinh",
      content: <SchoolOutcomes data={data} />,
    },
    {
      id: "academic",
      label: "Khối ngành & Điểm thi THPT",
      content: (
        <div className="space-y-5">
          <SchoolAcademicProfile data={data} />
          <SchoolExamScoreDistribution data={data} />
        </div>
      ),
    },
    {
      id: "profile",
      label: "Thông tin trường",
      content: <SchoolInformationTab data={data} onUpdated={onSchoolUpdated} />,
    },
    {
      id: "relationship",
      label: "Quan hệ & hoạt động",
      content: (
        <div className="space-y-5">
          <SchoolRelationshipCard data={data} />
          <ActivityTimeline data={data} />
        </div>
      ),
    },
  ];
}
