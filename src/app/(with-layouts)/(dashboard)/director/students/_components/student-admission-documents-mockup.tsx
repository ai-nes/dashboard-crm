"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState, type ChangeEvent } from "react";

import { FileText, UploadCloud } from "@tailgrids/icons";
import { Radio, RadioGroup } from "react-aria-components";
import { toast } from "sonner";

import { DatePickerField } from "@/components/common/date-picker-field";
import { Card } from "@/components/tailgrids/core/card";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
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

interface AdmissionDocumentField {
  label: string;
  type?: "date" | "number" | "text";
  value?: string;
  placeholder?: string;
}

const englishCertificateFields: AdmissionDocumentField[] = [
  { label: "Loại chứng chỉ", placeholder: "Ví dụ: IELTS, TOEIC" },
  { label: "Điểm chứng chỉ", type: "number" },
  { label: "Ngày cấp", type: "date" },
  { label: "Ngày hết hạn", type: "date" },
];

type DocumentUploadHandler = (
  requirement: StudentAdmissionRequirement,
  file: File,
) => Promise<void>;

function sectionTitle(sectionCode: string): string {
  switch (sectionCode) {
    case "special_program":
      return "Hồ sơ bổ sung";
    default:
      return "Hồ sơ thông thường";
  }
}

function requirementGroupTitle(
  sectionCode: string,
  requirementGroup: string,
): string {
  const group = requirementGroup.toLowerCase();
  if (group.includes("identity")) {
    return "Một trong các giấy tờ tùy thân sau:";
  }
  if (group.includes("graduation")) {
    return "Một trong các giấy tờ xác nhận tốt nghiệp THPT sau:";
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

export default function StudentAdmissionDocumentsMockup({
  data,
}: Student360SectionProps) {
  const profile = latestProfile(data);
  const queryClient = useQueryClient();
  const [uploadingDocumentType, setUploadingDocumentType] = useState<
    string | null
  >(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      englishCertificateFields.map((field) => [field.label, field.value ?? ""]),
    ),
  );
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
        <>
          <AdmissionProfileChecklist
            certificateValues={fieldValues}
            isUploading={uploadingDocumentType}
            onCertificateChange={(label, value) =>
              setFieldValues((current) => ({
                ...current,
                [label]: value,
              }))
            }
            onUpload={handleUpload}
            profile={profile}
          />
        </>
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
  certificateValues,
  isUploading,
  onCertificateChange,
  onUpload,
}: {
  profile: StudentAdmissionProfile;
  certificateValues: Record<string, string>;
  isUploading: string | null;
  onCertificateChange: (label: string, value: string) => void;
  onUpload: DocumentUploadHandler;
}) {
  const groups = getGroups(profile);
  const standardGroups = groups.filter(
    (group) => group.sectionCode === "basic_admission",
  );
  const methodGroups = groups.filter((group) => group.sectionCode === "method");
  const supplementaryGroups = groups.filter(
    (group) =>
      group.sectionCode === "special_program" ||
      group.sectionCode === "scholarship",
  );
  const standardAll = standardGroups
    .filter((group) => group.mode === "ALL")
    .flatMap((group) => group.requirements);
  const [standardLeft, standardRight] = splitRequirements(standardAll);
  const standardAny = standardGroups.filter((group) => group.mode === "ANY");
  const graduationGroup = standardAny.find((group) =>
    group.id.toLowerCase().includes("graduation"),
  );
  const identityGroup = standardAny.find((group) =>
    group.id.toLowerCase().includes("identity"),
  );
  const otherStandardAny = standardAny.filter(
    (group) => group !== graduationGroup && group !== identityGroup,
  );
  const methodRequirements = methodGroups
    .flatMap((group) => group.requirements)
    .sort((left, right) => left.orderDisplay - right.orderDisplay);
  const supplementaryLeft = [
    ...methodRequirements,
    ...supplementaryGroups
      .filter((group) => isLeftSupplementaryGroup(group))
      .flatMap((group) => group.requirements),
  ].sort((left, right) => left.orderDisplay - right.orderDisplay);
  const supplementaryRight = supplementaryGroups
    .filter((group) => !isLeftSupplementaryGroup(group))
    .flatMap((group) => group.requirements)
    .sort((left, right) => left.orderDisplay - right.orderDisplay);
  const hasSupplementary =
    supplementaryLeft.length > 0 || supplementaryRight.length > 0;

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
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse border border-card-border">
          <thead>
            <tr>
              <th
                className="border border-card-border bg-background-gray-primary px-4 py-3 text-center text-base font-semibold uppercase tracking-wide text-text-primary"
                colSpan={2}
                scope="colgroup"
              >
                Hồ sơ thông thường
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
                {graduationGroup && (
                  <AdmissionAlternativeGroup
                    group={graduationGroup}
                    isUploading={isUploading}
                    onUpload={onUpload}
                  />
                )}
              </td>
              <td className="w-1/2 align-top border border-card-border p-4">
                <AdmissionChecklistItemList
                  isUploading={isUploading}
                  onUpload={onUpload}
                  requirements={standardRight}
                />
                {identityGroup && (
                  <AdmissionAlternativeGroup
                    group={identityGroup}
                    isUploading={isUploading}
                    onUpload={onUpload}
                  />
                )}
              </td>
            </tr>

            {otherStandardAny.map((group) => (
              <Fragment key={group.id}>
                <tr>
                  <th
                    className="border border-card-border bg-background-gray-primary px-4 py-3 text-left text-base font-semibold text-text-primary"
                    colSpan={2}
                    scope="colgroup"
                  >
                    {group.title}
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

            {hasSupplementary && (
              <>
                <tr>
                  <th
                    className="border border-card-border bg-background-gray-primary px-4 py-3 text-center text-base font-semibold uppercase tracking-wide text-text-primary"
                    scope="col"
                  >
                    Hồ sơ bổ sung
                  </th>
                  <th
                    className="border border-card-border bg-background-gray-primary px-4 py-3 text-center text-base font-semibold uppercase tracking-wide text-text-primary"
                    scope="col"
                  >
                    Hồ sơ bổ sung
                    <span className="block normal-case">
                      (diện học bổng/Học trước – Trả sau/ưu đãi)
                    </span>
                  </th>
                </tr>
                <tr>
                  <td className="align-top border border-card-border p-4">
                    <AdmissionChecklistItemList
                      certificateValues={certificateValues}
                      isUploading={isUploading}
                      onCertificateChange={onCertificateChange}
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
          </tbody>
        </table>
      </div>
    </>
  );
}

function isLeftSupplementaryGroup(group: RequirementGroup): boolean {
  const groupCode = group.id.toUpperCase();
  return [
    "FIRST_GENERATION",
    "LANGUAGE_CERTIFICATE",
    "INTERNATIONAL_PROGRAM",
    "FPT_POLYTECHNIC",
    "ACHIEVEMENT",
  ].some((code) => groupCode.includes(code));
}

function AdmissionChecklistItemList({
  requirements,
  certificateValues,
  isUploading,
  onCertificateChange,
  onUpload,
}: {
  requirements: StudentAdmissionRequirement[];
  certificateValues?: Record<string, string>;
  isUploading: string | null;
  onCertificateChange?: (label: string, value: string) => void;
  onUpload: DocumentUploadHandler;
}) {
  return (
    <div className="space-y-3">
      {requirements.map((requirement) => (
        <AdmissionChecklistItem
          certificateValues={certificateValues}
          isUploading={isUploading}
          key={requirement.documentType}
          onCertificateChange={onCertificateChange}
          onUpload={onUpload}
          requirement={requirement}
        />
      ))}
    </div>
  );
}

function AdmissionChecklistItem({
  requirement,
  certificateValues,
  isUploading,
  onCertificateChange,
  onUpload,
}: {
  requirement: StudentAdmissionRequirement;
  certificateValues?: Record<string, string>;
  isUploading: string | null;
  onCertificateChange?: (label: string, value: string) => void;
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
        {requirement.documentCode === "ENGLISH_EXEMPTION_CERTIFICATE" &&
          certificateValues &&
          onCertificateChange && (
            <AdmissionCertificateFields
              onChange={onCertificateChange}
              values={certificateValues}
            />
          )}
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

function AdmissionDocumentField({
  field,
  value,
  onChange,
}: {
  field: AdmissionDocumentField;
  value: string;
  onChange: (label: string, value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs leading-5 font-medium text-text-primary">
        {field.label}
      </span>
      {field.type === "date" ? (
        <div className="mt-1">
          <DatePickerField
            ariaLabel={field.label}
            className="h-8 px-2 text-xs"
            onChange={(nextValue) => onChange(field.label, nextValue)}
            value={value}
          />
        </div>
      ) : (
        <Input
          aria-label={field.label}
          className="mt-1 h-8 w-full px-2 text-xs"
          inputMode={field.type === "number" ? "decimal" : undefined}
          min={field.type === "number" ? 0 : undefined}
          onChange={(event) => onChange(field.label, event.target.value)}
          placeholder={field.placeholder ?? "Nhấn để nhập thông tin"}
          type={field.type ?? "text"}
          value={value}
        />
      )}
    </label>
  );
}

function AdmissionCertificateFields({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (label: string, value: string) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
      {englishCertificateFields.map((field) => (
        <AdmissionDocumentField
          field={field}
          key={field.label}
          onChange={onChange}
          value={values[field.label] ?? ""}
        />
      ))}
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
