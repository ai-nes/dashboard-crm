"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "@tailgrids/icons";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import {
  createAdmissionApplication,
  getAdmissionProfileCatalog,
  updateAdmissionApplication,
} from "@/services/api/admission-profile-catalog";
import type { AdmissionProfileCatalog } from "@/services/api/admission-profile-catalog";
import type {
  Student360Data,
  StudentAdmissionProfile,
} from "@/services/api/students/types";
import { studentsKeys } from "@/hooks/use-students-queries";

import StudentCardHeader from "./student-card-header";
import StudentProfileCardActions from "./student-profile-card-actions";

interface StudentAdmissionInformationProps {
  data: Student360Data;
  canEdit?: boolean;
}

const preferenceOptions: EditableDetailOption[] = [
  { id: "Primary", label: "Nguyện vọng chính" },
  { id: "Alternative", label: "Nguyện vọng khác" },
];

function latestProfile(data: Student360Data): StudentAdmissionProfile | null {
  return data.admissionProfiles?.[0] ?? null;
}

function applicationValue(data: Student360Data, label: string): string | null {
  return data.application.find((item) => item.label === label)?.value ?? null;
}

function selectedMethodCode(
  data: Student360Data,
  profile: StudentAdmissionProfile | null,
): string {
  return (
    profile?.admissionMethodCode ||
    data.student.admissionMethod ||
    data.academics.find((item) => item.label === "Phương thức xét tuyển")
      ?.value ||
    ""
  );
}

function selectedTemplateCode(profile: StudentAdmissionProfile | null): string {
  return profile?.profileTemplateCode || profile?.profileTemplate || "";
}

function selectedPreferenceCode(
  profile: StudentAdmissionProfile | null,
): "Primary" | "Alternative" {
  return profile?.preference === "Alternative" ? "Alternative" : "Primary";
}

export default function StudentAdmissionInformationMockup({
  data,
  canEdit = true,
}: StudentAdmissionInformationProps) {
  const profile = latestProfile(data);
  const queryClient = useQueryClient();
  const canonicalStudent =
    data.student.studentId || data.student.id || data.student.code;
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(
    selectedMethodCode(data, profile),
  );
  const [selectedTemplate, setSelectedTemplate] = useState(
    selectedTemplateCode(profile),
  );
  const [selectedPreference, setSelectedPreference] = useState(
    selectedPreferenceCode(profile),
  );

  const catalogQuery = useQuery<AdmissionProfileCatalog>({
    queryKey: [
      "admission-profile-catalog",
      data.student.admissionYear || "all",
    ],
    queryFn: () =>
      getAdmissionProfileCatalog({
        admissionYear: data.student.admissionYear || undefined,
      }),
    enabled: isEditing,
    staleTime: 5 * 60 * 1000,
  });

  const selectedTemplateRecord = catalogQuery.data?.templates.find(
    (item) => item.id === selectedTemplate || item.code === selectedTemplate,
  );
  const currentApplication = profile?.application || null;
  const initialMethod = selectedMethodCode(data, profile);
  const initialTemplate = selectedTemplateCode(profile);
  const initialPreference = selectedPreferenceCode(profile);
  const hasExistingApplication = Boolean(currentApplication);
  const methodChanged = hasExistingApplication && selectedMethod !== initialMethod;
  const templateChanged = hasExistingApplication && selectedTemplate !== initialTemplate;
  const preferenceChanged =
    hasExistingApplication &&
    selectedPreference !== initialPreference;
  const selectionChanged = methodChanged || templateChanged || preferenceChanged;
  const selectionKey = [
    selectedMethod,
    selectedTemplate,
    selectedPreference,
  ].join("|");

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedMethod || !selectedTemplateRecord) {
        throw new Error(
          "Vui lòng chọn đủ phương thức xét tuyển và loại hồ sơ nhập học.",
        );
      }
      if (!data.student.admissionYear) {
        throw new Error("Hồ sơ học sinh chưa có năm tuyển sinh.");
      }
      return createAdmissionApplication({
        student: canonicalStudent,
        values: {
          admission_method: selectedMethod,
          profile_template: selectedTemplateRecord.code,
          preference_order: selectedPreference === "Primary" ? 1 : 2,
          preference: selectedPreference,
          status: "Draft",
        },
        expectedRevision: data.student.engagementRevision ?? 0,
        idempotencyKey: `student-admission:${canonicalStudent}:${selectionKey}`,
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!currentApplication || !selectedTemplateRecord) {
        throw new Error("Chưa xác định được hồ sơ xét tuyển cần cập nhật.");
      }
      return updateAdmissionApplication({
        application: currentApplication,
        values: {
          admission_method: selectedMethod,
          profile_template: selectedTemplateRecord.code,
          preference: selectedPreference,
        },
      });
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const startEditing = () => {
    if (isSaving) return;
    createMutation.reset();
    updateMutation.reset();
    setSelectedMethod(selectedMethodCode(data, profile));
    setSelectedTemplate(selectedTemplateCode(profile));
    setSelectedPreference(selectedPreferenceCode(profile));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (isSaving) return;
    createMutation.reset();
    updateMutation.reset();
    setSelectedMethod(selectedMethodCode(data, profile));
    setSelectedTemplate(selectedTemplateCode(profile));
    setSelectedPreference(selectedPreferenceCode(profile));
    setIsEditing(false);
  };

  const saveAdmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasExistingApplication && !selectionChanged) {
      setIsEditing(false);
      return;
    }

    try {
      if (hasExistingApplication) {
        await updateMutation.mutateAsync();
      } else {
        await createMutation.mutateAsync();
      }
      await queryClient.invalidateQueries({
        queryKey: studentsKeys.student360(canonicalStudent),
      });
      setIsEditing(false);
      toast.success(
        hasExistingApplication
          ? "Đã cập nhật thông tin tuyển sinh."
          : "Đã tạo hồ sơ nhập học và danh sách giấy tờ cần nộp.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu thông tin tuyển sinh.",
      );
    }
  };

  const methodOptions: EditableDetailOption[] = (
    catalogQuery.data?.methods ?? []
  ).map((method) => ({ id: method.code, label: method.name }));
  const templateOptions: EditableDetailOption[] = (
    catalogQuery.data?.templates ?? []
  ).map((template) => ({ id: template.code, label: template.name }));
  const methodLabel =
    catalogQuery.data?.methods.find(
      (method) =>
        method.id === selectedMethod || method.code === selectedMethod,
    )?.name ||
    profile?.admissionMethodName ||
    selectedMethod;
  const templateLabel =
    selectedTemplateRecord?.name ||
    profile?.profileTemplateName ||
    selectedTemplate;
  const preferenceLabel =
    preferenceOptions.find((option) => option.id === selectedPreference)
      ?.label || selectedPreference;

  const content = (
    <>
      <StudentCardHeader
        description="Phương thức, loại hồ sơ và tiến độ đăng ký tuyển sinh."
        icon={<FileText size={18} aria-hidden="true" />}
        rightAction={
          <StudentProfileCardActions
            canEdit={canEdit}
            isEditing={isEditing}
            isSaving={isSaving}
            onCancel={cancelEditing}
            onEdit={startEditing}
          />
        }
        title="Thông tin tuyển sinh"
        titleBadge={
          profile ? (
            <Badge color="success" size="sm" className="shrink-0">
              Đã có hồ sơ nhập học
            </Badge>
          ) : undefined
        }
      />

      {isEditing && catalogQuery.isError && (
        <p className="mb-4 rounded-lg bg-badge-error-background p-3 text-sm text-badge-error-text">
          Không thể tải phương thức xét tuyển và Profile Template.
        </p>
      )}
      {isEditing && catalogQuery.isLoading && (
        <p className="mb-4 text-sm text-text-tertiary">
          Đang tải danh mục tuyển sinh...
        </p>
      )}

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        <EditableDetailField
          isEditing={isEditing}
          label="Mã hồ sơ TĐK"
          value={
            profile?.application || applicationValue(data, "Mã hồ sơ TĐK") || ""
          }
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Phương thức xét tuyển"
          onChange={setSelectedMethod}
          options={methodOptions}
          value={isEditing ? selectedMethod : methodLabel}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Loại hồ sơ nhập học"
          onChange={setSelectedTemplate}
          options={templateOptions}
          value={isEditing ? selectedTemplate : templateLabel}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Nguyện vọng FPT"
          onChange={(value) =>
            setSelectedPreference(
              value === "Alternative" ? "Alternative" : "Primary",
            )
          }
          options={preferenceOptions}
          value={isEditing ? selectedPreference : preferenceLabel}
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Họ và tên người liên hệ"
          value={
            data.student.profileDetails?.contact?.name ||
            data.parentProfile.name ||
            ""
          }
        />
        <EditableDetailField
          isEditing={isEditing}
          label="Email phụ huynh"
          value={data.student.email || ""}
        />
      </dl>
    </>
  );

  return (
    <Card className="p-5">
      {isEditing ? <form onSubmit={saveAdmission}>{content}</form> : content}
    </Card>
  );
}
