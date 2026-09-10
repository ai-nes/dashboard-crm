"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState, type ChangeEvent } from "react";

import { FileText, UploadCloud } from "@tailgrids/icons";
import { Radio, RadioGroup } from "react-aria-components";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { studentsKeys } from "@/hooks/use-students-queries";
import { uploadStudentAdmissionDocument } from "@/services/api/admission-profile-catalog";
import type {
  StudentAdmissionDocument,
  StudentAdmissionProfile,
  StudentAdmissionRequirement,
} from "@/services/api/students/types";

import StudentCardHeader from "./student-card-header";
import type { Student360SectionProps } from "./types";

interface RequirementGroup {
  id: string;
  sectionCode: string;
  title: string;
  mode: "ALL" | "ANY";
  minimumRequired: number;
  requirements: StudentAdmissionRequirement[];
}

type DocumentUploadHandler = (
  requirement: StudentAdmissionRequirement,
  file: File,
) => Promise<void>;

function sectionTitle(sectionCode: string): string {
  switch (sectionCode) {
    case "special_program":
      return "Hồ sơ bổ sung";
    default:
      return "Hồ sơ nhập học";
  }
}

function requirementGroupTitle(
  sectionCode: string,
  requirementGroup: string,
): string {
  const group = requirementGroup.toLowerCase();
  if (group.includes("identity")) {
    return "Một trong các giấy tờ tùy thân sau";
  }
  if (group.includes("graduation")) {
    return "Một trong các giấy tờ xác nhận tốt nghiệp THPT sau";
  }
  return sectionTitle(sectionCode);
}

function getGroups(profile: StudentAdmissionProfile): RequirementGroup[] {
  const groups = new Map<string, RequirementGroup>();
  for (const requirement of profile.requirements) {
    const existing = groups.get(requirement.requirementGroup);
    if (existing) {
      existing.requirements.push(requirement);
      continue;
    }
    groups.set(requirement.requirementGroup, {
      id: requirement.requirementGroup,
      sectionCode: requirement.sectionCode,
      title: requirementGroupTitle(
        requirement.sectionCode,
        requirement.requirementGroup,
      ),
      mode: requirement.requirementMode,
      minimumRequired: requirement.minimumRequired,
      requirements: [requirement],
    });
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    requirements: [...group.requirements].sort(
      (left, right) => left.orderDisplay - right.orderDisplay,
    ),
  }));
}

function latestProfile(
  data: Student360SectionProps["data"],
): StudentAdmissionProfile | null {
  return data.admissionProfiles?.[0] ?? null;
}

function splitRequirements(requirements: StudentAdmissionRequirement[]) {
  return [
    requirements.filter((_, index) => index % 2 === 0),
    requirements.filter((_, index) => index % 2 === 1),
  ] as const;
}

function groupCompleted(group: RequirementGroup): number {
  return group.requirements.filter((item) => item.hasDocument).length;
}

function ProgressBadge({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  return (
    <Badge color={total > 0 && completed >= total ? "success" : "warning"}>
      {completed}/{total}
    </Badge>
  );
}

export default function StudentAdmissionDocumentsMockup({
  data,
}: Student360SectionProps) {
  const profile = latestProfile(data);
  const queryClient = useQueryClient();
  const [uploadingDocumentType, setUploadingDocumentType] = useState<
    string | null
  >(null);
  const uploadMutation = useMutation({
    mutationFn: ({
      requirement,
      file,
    }: {
      requirement: StudentAdmissionRequirement;
      file: File;
    }) =>
      uploadStudentAdmissionDocument({
        student:
          profile?.student || data.student.studentId || data.student.code,
        profile: profile?.id || "",
        application: profile?.application,
        documentType: requirement.documentType,
        file,
      }),
  });

  const handleUpload: DocumentUploadHandler = async (requirement, file) => {
    if (!profile) return;
    setUploadingDocumentType(requirement.documentType);
    try {
      await uploadMutation.mutateAsync({ requirement, file });
      await queryClient.invalidateQueries({
        queryKey: studentsKeys.student360(profile.student),
      });
      toast.success(`Đã tải lên ${requirement.documentLabel}.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể tải tài liệu lên hồ sơ nhập học.",
      );
    } finally {
      setUploadingDocumentType(null);
    }
  };

  return (
    <Card className="min-w-0 w-full max-w-full p-5">
      <StudentCardHeader
        description="Theo dõi giấy tờ đã nộp và tiến độ hoàn tất hồ sơ."
        icon={<FileText size={18} aria-hidden="true" />}
        title="Thủ tục và Hồ sơ Nhập học"
      />

      {!profile ? (
        <EmptyAdmissionProfile />
      ) : (
        <AdmissionProfileChecklist
          isUploading={uploadingDocumentType}
          onUpload={handleUpload}
          profile={profile}
        />
      )}
    </Card>
  );
}

function EmptyAdmissionProfile() {
  return (
    <div className="rounded-xl border border-dashed border-card-border bg-background-gray-secondary p-6 text-center">
      <p className="text-sm font-medium text-text-primary">
        Chưa có hồ sơ nhập học
      </p>
      <p className="mt-1 text-sm text-text-tertiary">
        Chọn đủ Admission Offering, phương thức xét tuyển và Profile Template ở
        tab Học tập và tuyển sinh.
      </p>
    </div>
  );
}

function AdmissionProfileChecklist({
  profile,
  isUploading,
  onUpload,
}: {
  profile: StudentAdmissionProfile;
  isUploading: string | null;
  onUpload: DocumentUploadHandler;
}) {
  const groups = getGroups(profile);
  const standardGroups = groups.filter(
    (group) => group.sectionCode !== "special_program",
  );
  const supplementaryGroups = groups.filter(
    (group) => group.sectionCode === "special_program",
  );
  const standardAll = standardGroups
    .filter((group) => group.mode === "ALL")
    .flatMap((group) => group.requirements);
  const [standardLeft, standardRight] = splitRequirements(standardAll);
  const standardAny = standardGroups.filter((group) => group.mode === "ANY");
  const supplementaryAll = supplementaryGroups
    .filter((group) => group.mode === "ALL")
    .flatMap((group) => group.requirements);
  const [supplementaryLeft, supplementaryRight] =
    splitRequirements(supplementaryAll);
  const supplementaryAny = supplementaryGroups.filter(
    (group) => group.mode === "ANY",
  );
  const completeness = profile.documentCompleteness;
  const completed = Number(completeness?.completed ?? 0);
  const total = Number(completeness?.total ?? 0);
  const standardCompleted = standardAll.filter(
    (requirement) => requirement.hasDocument,
  ).length;
  const supplementaryCompleted = supplementaryAll.filter(
    (requirement) => requirement.hasDocument,
  ).length;

  if (!groups.length) {
    return (
      <div className="rounded-xl border border-dashed border-card-border bg-background-gray-secondary p-6 text-center">
        <p className="text-sm font-medium text-text-primary">
          Template chưa có danh mục giấy tờ
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          Liên hệ Admissions Director để cấu hình Profile Template.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-card-border bg-background-gray-secondary px-4 py-3">
        <Badge color="primary">
          {profile.profileTemplateName ||
            profile.profileTemplateCode ||
            profile.profileTemplate}
        </Badge>
        <span className="text-sm text-text-primary">
          {profile.admissionMethodName ||
            profile.admissionMethodCode ||
            "Chưa có phương thức xét tuyển"}
        </span>
        <span className="text-sm text-text-secondary">
          {total
            ? `${completed}/${total} giấy tờ đã nộp`
            : "Chưa có dữ liệu tiến độ"}
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse border border-card-border">
          <thead>
            <tr>
              <th
                className="border border-card-border bg-background-gray-primary px-4 py-3 text-base font-semibold text-text-primary"
                colSpan={2}
                scope="colgroup"
              >
                <div className="flex items-center justify-between gap-3">
                  <span>Hồ sơ nhập học</span>
                  <ProgressBadge
                    completed={standardCompleted}
                    total={standardAll.length}
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-1/2 align-top border border-card-border p-4">
                <AdmissionChecklistItemList
                  isUploading={isUploading}
                  onUpload={onUpload}
                  requirements={standardLeft}
                />
              </td>
              <td className="w-1/2 align-top border border-card-border p-4">
                <AdmissionChecklistItemList
                  isUploading={isUploading}
                  onUpload={onUpload}
                  requirements={standardRight}
                />
              </td>
            </tr>

            {standardAny.map((group) => (
              <Fragment key={group.id}>
                <tr>
                  <th
                    className="border border-card-border bg-background-gray-primary px-4 py-3 text-left text-base font-semibold text-text-primary"
                    colSpan={2}
                    scope="colgroup"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        {group.title} · Chọn ít nhất {group.minimumRequired}
                      </span>
                      <ProgressBadge
                        completed={groupCompleted(group)}
                        total={group.minimumRequired}
                      />
                    </div>
                  </th>
                </tr>
                <tr>
                  <td
                    className="align-top border border-card-border p-4"
                    colSpan={2}
                  >
                    <AdmissionAlternativeGroup
                      group={group}
                      isUploading={isUploading}
                      onUpload={onUpload}
                    />
                  </td>
                </tr>
              </Fragment>
            ))}

            {supplementaryGroups.length > 0 && (
              <>
                <tr>
                  <th
                    className="border border-card-border bg-background-gray-primary px-4 py-3 text-base font-semibold uppercase tracking-wide text-text-primary"
                    scope="col"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>Hồ sơ bổ sung</span>
                      <ProgressBadge
                        completed={supplementaryCompleted}
                        total={supplementaryAll.length}
                      />
                    </div>
                  </th>
                  <th
                    className="border border-card-border bg-background-gray-primary px-4 py-3 text-base font-semibold uppercase tracking-wide text-text-primary"
                    scope="col"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        Hồ sơ bổ sung
                        <span className="block normal-case">
                          (diện học bổng/Học trước – Trả sau/ưu đãi)
                        </span>
                      </span>
                      <ProgressBadge
                        completed={supplementaryCompleted}
                        total={supplementaryAll.length}
                      />
                    </div>
                  </th>
                </tr>
                <tr>
                  <td className="align-top border border-card-border p-4">
                    <AdmissionChecklistItemList
                      isUploading={isUploading}
                      onUpload={onUpload}
                      requirements={supplementaryLeft}
                    />
                  </td>
                  <td className="align-top border border-card-border p-4">
                    <AdmissionChecklistItemList
                      isUploading={isUploading}
                      onUpload={onUpload}
                      requirements={supplementaryRight}
                    />
                  </td>
                </tr>
              </>
            )}

            {supplementaryAny.map((group) => (
              <Fragment key={group.id}>
                <tr>
                  <th
                    className="border border-card-border bg-background-gray-primary px-4 py-3 text-left text-base font-semibold text-text-primary"
                    colSpan={2}
                    scope="colgroup"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        {group.title} · Chọn ít nhất {group.minimumRequired}
                      </span>
                      <ProgressBadge
                        completed={groupCompleted(group)}
                        total={group.minimumRequired}
                      />
                    </div>
                  </th>
                </tr>
                <tr>
                  <td
                    className="align-top border border-card-border p-4"
                    colSpan={2}
                  >
                    <AdmissionAlternativeGroup
                      group={group}
                      isUploading={isUploading}
                      onUpload={onUpload}
                    />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdmissionChecklistItemList({
  requirements,
  isUploading,
  onUpload,
}: {
  requirements: StudentAdmissionRequirement[];
  isUploading: string | null;
  onUpload: DocumentUploadHandler;
}) {
  return (
    <div className="space-y-3">
      {requirements.map((requirement) => (
        <AdmissionChecklistItem
          isUploading={isUploading}
          key={requirement.documentType}
          onUpload={onUpload}
          requirement={requirement}
        />
      ))}
    </div>
  );
}

function AdmissionChecklistItem({
  requirement,
  isUploading,
  onUpload,
}: {
  requirement: StudentAdmissionRequirement;
  isUploading: string | null;
  onUpload: DocumentUploadHandler;
}) {
  return (
    <div>
      <Checkbox
        aria-label={requirement.documentLabel}
        className="items-start [&>div]:!ring-0 [&>div]:mt-1 [&>div]:size-4 [&>div]:min-w-4 [&>div]:shrink-0 [&>div]:border-text-secondary"
        isDisabled
        isSelected={requirement.hasDocument}
        size="sm"
      >
        <span className="text-sm leading-6 font-medium text-text-primary">
          {requirement.documentLabel}
        </span>
      </Checkbox>
      <div className="ml-7">
        <RequirementDetails
          isUploading={isUploading}
          onUpload={onUpload}
          requirement={requirement}
        />
      </div>
    </div>
  );
}

function AdmissionAlternativeGroup({
  group,
  isUploading,
  onUpload,
}: {
  group: RequirementGroup;
  isUploading: string | null;
  onUpload: DocumentUploadHandler;
}) {
  const selected = group.requirements.find(
    (item) => item.hasDocument,
  )?.documentType;

  return (
    <RadioGroup
      aria-label={group.title}
      className="space-y-3"
      isDisabled
      value={selected}
    >
      {group.requirements.map((requirement) => (
        <div key={requirement.documentType}>
          <AdmissionRadio value={requirement.documentType}>
            {requirement.documentLabel}
          </AdmissionRadio>
          <div className="ml-7">
            <RequirementDetails
              isUploading={isUploading}
              onUpload={onUpload}
              requirement={requirement}
            />
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}

function RequirementDetails({
  requirement,
  isUploading,
  onUpload,
}: {
  requirement: StudentAdmissionRequirement;
  isUploading: string | null;
  onUpload: DocumentUploadHandler;
}) {
  return (
    <div className="mt-2 space-y-1">
      {requirement.instruction && (
        <p className="text-xs leading-5 text-text-tertiary">
          {requirement.instruction}
        </p>
      )}
      {requirement.description && !requirement.instruction && (
        <p className="text-xs leading-5 text-text-tertiary">
          {requirement.description}
        </p>
      )}
      {requirement.documents.length ? (
        requirement.documents.map((document) => (
          <AdmissionDocumentLink key={document.id} document={document} />
        ))
      ) : (
        <p className="text-xs text-text-tertiary">Chưa có tài liệu</p>
      )}
      <AdmissionDocumentUpload
        isUploading={isUploading}
        onUpload={onUpload}
        requirement={requirement}
      />
    </div>
  );
}

function AdmissionDocumentUpload({
  requirement,
  isUploading,
  onUpload,
}: {
  requirement: StudentAdmissionRequirement;
  isUploading: string | null;
  onUpload: DocumentUploadHandler;
}) {
  const inputId = `admission-document-upload-${requirement.documentType.replace(
    /[^a-zA-Z0-9_-]/g,
    "-",
  )}`;
  const currentUpload = isUploading === requirement.documentType;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) void onUpload(requirement, file);
  };

  return (
    <div className="mt-2">
      <label
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
          isUploading
            ? "pointer-events-none border-button-outline-disabled-border text-button-outline-disabled-text"
            : "border-primary-200 text-primary-600 hover:bg-primary-50"
        }`}
        htmlFor={inputId}
      >
        <UploadCloud size={14} aria-hidden="true" />
        {currentUpload
          ? "Đang tải lên..."
          : requirement.hasDocument
            ? "Tải bản mới"
            : "Tải tài liệu"}
      </label>
      <input
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="sr-only"
        disabled={Boolean(isUploading)}
        id={inputId}
        onChange={handleChange}
        type="file"
      />
    </div>
  );
}

function AdmissionDocumentLink({
  document,
}: {
  document: StudentAdmissionDocument;
}) {
  const fileName = document.file?.split("/").pop() || document.documentType;
  if (!document.file) {
    return <p className="text-xs text-text-tertiary">Chưa có tài liệu</p>;
  }

  return (
    <a
      className="inline-flex items-center gap-1.5 text-xs text-primary-500 underline-offset-2 hover:underline"
      href={document.file}
      rel="noreferrer"
      target="_blank"
    >
      <FileText size={14} aria-hidden="true" />
      {fileName}
    </a>
  );
}

function AdmissionRadio({
  children,
  value,
}: {
  children: string;
  value: string;
}) {
  return (
    <Radio
      className="group flex items-start gap-2 text-sm text-text-secondary outline-none"
      value={value}
    >
      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-text-secondary bg-card-background group-data-[selected=true]:border-primary-500 group-data-[selected=true]:bg-primary-500">
        <span className="size-1.5 rounded-full bg-white-100 opacity-0 group-data-[selected=true]:opacity-100" />
      </span>
      {children}
    </Radio>
  );
}
