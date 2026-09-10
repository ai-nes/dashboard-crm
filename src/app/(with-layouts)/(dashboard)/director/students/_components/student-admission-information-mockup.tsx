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
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
} from "@/components/tailgrids/core/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
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

function selectedPreferenceCode(
  profile: StudentAdmissionProfile | null,
): "Primary" | "Alternative" {
  return profile?.preference === "Alternative" ? "Alternative" : "Primary";
}

function selectedSpecialProfileCodes(
  profile: StudentAdmissionProfile | null,
): string[] {
  return (
    profile?.specialProfileOptions
      ?.map((option) => option.code || option.id)
      .filter(Boolean) || []
  );
}

function sameSelection(left: string[], right: string[]): boolean {
  return [...left].sort().join("|") === [...right].sort().join("|");
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
  const [selectedPreference, setSelectedPreference] = useState(
    selectedPreferenceCode(profile),
  );
  const [selectedSpecialProfiles, setSelectedSpecialProfiles] = useState(() =>
    selectedSpecialProfileCodes(profile),
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
    (item) => item.code === "STANDARD",
  );
  const effectiveTemplate = selectedTemplateRecord?.code || "STANDARD";
  const specialProfileOptions = catalogQuery.data?.specialTemplates ?? [];
  const selectedSpecialProfile = specialProfileOptions.find(
    (item) =>
      item.code === selectedSpecialProfiles[0] ||
      item.id === selectedSpecialProfiles[0],
  );
  const firstSavedSpecialProfile = profile?.specialProfileOptions?.[0];
  const additionalSelectedSpecialProfiles = selectedSpecialProfiles
    .slice(1)
    .map(
      (code) =>
        specialProfileOptions.find(
          (item) => item.code === code || item.id === code,
        )?.name || code,
    );
  const additionalSavedSpecialProfiles =
    profile?.specialProfileOptions?.slice(1).map((option) => option.name) ?? [];
  const currentApplication = profile?.application || null;
  const initialMethod = selectedMethodCode(data, profile);
  const initialPreference = selectedPreferenceCode(profile);
  const initialSpecialProfiles = selectedSpecialProfileCodes(profile);
  const hasExistingApplication = Boolean(currentApplication);
  const methodChanged =
    hasExistingApplication && selectedMethod !== initialMethod;
  const preferenceChanged =
    hasExistingApplication && selectedPreference !== initialPreference;
  const specialProfilesChanged =
    hasExistingApplication &&
    !sameSelection(selectedSpecialProfiles, initialSpecialProfiles);
  const selectionChanged =
    methodChanged || preferenceChanged || specialProfilesChanged;
  const selectionKey = [
    selectedMethod,
    effectiveTemplate,
    selectedPreference,
    ...[...selectedSpecialProfiles].sort(),
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
          special_profile_options: selectedSpecialProfiles,
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
          special_profile_options: selectedSpecialProfiles,
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
    setSelectedPreference(selectedPreferenceCode(profile));
    setSelectedSpecialProfiles(selectedSpecialProfileCodes(profile));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (isSaving) return;
    createMutation.reset();
    updateMutation.reset();
    setSelectedMethod(selectedMethodCode(data, profile));
    setSelectedPreference(selectedPreferenceCode(profile));
    setSelectedSpecialProfiles(selectedSpecialProfileCodes(profile));
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
  const methodLabel =
    catalogQuery.data?.methods.find(
      (method) =>
        method.id === selectedMethod || method.code === selectedMethod,
    )?.name ||
    profile?.admissionMethodName ||
    selectedMethod;
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
        <div className="min-w-0">
          <dt className="text-xs text-text-tertiary">Loại hồ sơ</dt>
          {isEditing ? (
            <dd className="mt-1.5">
              <Select
                aria-label="Loại hồ sơ"
                className="w-full gap-0"
                isDisabled={
                  isSaving ||
                  catalogQuery.isLoading ||
                  specialProfileOptions.length === 0
                }
                onChange={(value) =>
                  setSelectedSpecialProfiles(
                    Array.from(value as Iterable<string>, String),
                  )
                }
                selectionMode="multiple"
                value={selectedSpecialProfiles}
              >
                <SelectTrigger className="h-auto min-h-9 w-full flex-wrap justify-between gap-1.5 px-3 py-1.5 text-sm">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    {selectedSpecialProfiles.length === 0 ? (
                      <span className="text-input-placeholder-text">
                        Hồ sơ thông thường
                      </span>
                    ) : (
                      <>
                        <span
                          className="inline-flex max-w-full items-center rounded-md border border-card-border bg-background-white-primary px-2 py-1 text-xs font-medium text-text-primary"
                          title={
                            selectedSpecialProfile?.name ||
                            selectedSpecialProfiles[0]
                          }
                        >
                          <span className="truncate">
                            {selectedSpecialProfile?.name ||
                              selectedSpecialProfiles[0]}
                          </span>
                        </span>
                        {selectedSpecialProfiles.length > 1 && (
                          <MoreSpecialProfiles
                            profiles={additionalSelectedSpecialProfiles}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <SelectIndicator />
                </SelectTrigger>
                <SelectContent
                  className="max-h-60 min-w-(--trigger-width)"
                  header={
                    <p className="border-b border-card-border px-3 py-2 text-xs leading-5 text-text-tertiary">
                      Chọn hồ sơ bổ sung (có thể chọn nhiều).
                    </p>
                  }
                >
                  {specialProfileOptions.length > 0 ? (
                    specialProfileOptions.map((option) => (
                      <SelectItem
                        key={option.id}
                        id={option.code}
                        textValue={option.name}
                      >
                        <span className="block min-w-0 truncate text-text-primary">
                          {option.name}
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem
                      id="no-special-profile-options"
                      isDisabled
                      textValue="Chưa có hồ sơ bổ sung"
                    >
                      Chưa có hồ sơ bổ sung đang hoạt động.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </dd>
          ) : (
            <dd className="mt-1 flex min-h-6 flex-wrap items-center gap-1.5 text-sm font-medium text-text-primary">
              {firstSavedSpecialProfile ? (
                <>
                  <span className="inline-flex max-w-full items-center rounded-md border border-card-border bg-background-white-primary px-2 py-1 text-xs font-medium text-text-primary">
                    <span className="truncate">
                      {firstSavedSpecialProfile.name}
                    </span>
                  </span>
                  {additionalSavedSpecialProfiles.length > 0 && (
                    <MoreSpecialProfiles
                      profiles={additionalSavedSpecialProfiles}
                    />
                  )}
                </>
              ) : (
                <span className="text-text-tertiary">Hồ sơ thông thường</span>
              )}
            </dd>
          )}
        </div>
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

function MoreSpecialProfiles({ profiles }: { profiles: string[] }) {
  if (profiles.length === 0) return null;

  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <span
          aria-label={`Xem ${profiles.length} hồ sơ bổ sung khác`}
          className="cursor-help text-xs text-text-tertiary underline decoration-dotted underline-offset-2"
          tabIndex={0}
        >
          +{profiles.length}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm p-3">
        <ul className="space-y-1 text-left text-xs leading-5">
          {profiles.map((profile, index) => (
            <li key={`${profile}-${index}`}>{profile}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
