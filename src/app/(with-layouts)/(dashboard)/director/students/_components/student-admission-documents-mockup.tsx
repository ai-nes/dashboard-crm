"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Fragment,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { FileText, UploadCloud } from "@tailgrids/icons";
import { Radio, RadioGroup } from "react-aria-components";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { studentsKeys } from "@/hooks/use-students-queries";
import { uploadStudentAdmissionDocument } from "@/services/api/admission-profile-catalog";
import { readApiUrl } from "@/services/api/nest/nest-client";
import type {
  StudentAdmissionDocument,
  StudentAdmissionProfile,
  StudentAdmissionRequirement,
} from "@/services/api/students/types";

import StudentEnglishCertificateFields from "./student-english-certificate-fields";
import { useAuth } from "@/components/common/auth/auth-provider";
import {
  canAccessStudent,
  getCrmPermissions,
  canPerformStudentAction,
  getCrmDoctypePermissions,
} from "@/components/common/auth/permissions";
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
  const { user } = useAuth();
  const studentPermissions = getCrmPermissions(user).student;
  const studentOwnership = {
    owner: data.student.counselor,
    ownerId: data.student.ownerId,
  };
  const canReadStudent = canAccessStudent(
    studentPermissions,
    studentOwnership,
    user,
  );
  const canEdit = canPerformStudentAction(
    studentPermissions,
    "update",
    studentOwnership,
    user,
  );
  const canReadAdmissionProfile = getCrmDoctypePermissions(
    user,
    "CRM Student Admission Profile",
  ).canRead;
  const canCreateStudentDocument = getCrmDoctypePermissions(
    user,
    "CRM Student Document",
  ).canCreate;
  const canUploadDocument =
    canReadStudent && canReadAdmissionProfile && canCreateStudentDocument;
  const certificateFields = (
    <StudentEnglishCertificateFields
      key={data.student.studentId || data.student.code}
      studentId={data.student.studentId || data.student.code}
      canEdit={canEdit}
    />
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
    if (!profile || !canUploadDocument) return;
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

      {!canReadAdmissionProfile ? (
        <p className="rounded-lg border border-card-border bg-background-gray-secondary p-4 text-sm text-text-secondary">
          Bạn không có quyền xem hồ sơ nhập học.
        </p>
      ) : !profile ? (
        <EmptyAdmissionProfile />
      ) : (
        <>
          <AdmissionProfileChecklist
            certificateFields={certificateFields}
            isUploading={uploadingDocumentType}
            onUpload={canUploadDocument ? handleUpload : undefined}
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
  certificateFields,
  isUploading,
  onUpload,
}: {
  profile: StudentAdmissionProfile;
  certificateFields: ReactNode;
  isUploading: string | null;
  onUpload?: DocumentUploadHandler;
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
  const supplementaryAll = [
    ...methodRequirements,
    ...supplementaryGroups.flatMap((group) => group.requirements),
  ].sort((left, right) => left.orderDisplay - right.orderDisplay);
  const [supplementaryLeft, supplementaryRight] =
    splitRequirements(supplementaryAll);
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
                    showTitle
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
                    showTitle
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
                    colSpan={2}
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
                      certificateFields={certificateFields}
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
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdmissionChecklistItemList({
  requirements,
  certificateFields,
  isUploading,
  onUpload,
}: {
  requirements: StudentAdmissionRequirement[];
  certificateFields?: ReactNode;
  isUploading: string | null;
  onUpload?: DocumentUploadHandler;
}) {
  return (
    <div className="space-y-3">
      {requirements.map((requirement) => (
        <AdmissionChecklistItem
          certificateFields={certificateFields}
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
  certificateFields,
  isUploading,
  onUpload,
}: {
  requirement: StudentAdmissionRequirement;
  certificateFields?: ReactNode;
  isUploading: string | null;
  onUpload?: DocumentUploadHandler;
}) {
  return (
    <div>
      <Checkbox
        aria-label={requirement.documentLabel}
        className="items-start [&>div]:!ring-0 [&>div]:mt-1 [&>div]:size-4 [&>div]:min-w-4 [&>div]:shrink-0 [&>div]:border-text-secondary"
        isReadOnly
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
          certificateFields}
      </div>
    </div>
  );
}

function AdmissionAlternativeGroup({
  group,
  isUploading,
  onUpload,
  showTitle = false,
}: {
  group: RequirementGroup;
  isUploading: string | null;
  onUpload?: DocumentUploadHandler;
  showTitle?: boolean;
}) {
  const selected = group.requirements.find(
    (item) => item.hasDocument,
  )?.documentType;

  return (
    <div className={showTitle ? "mt-5 pl-2" : undefined}>
      {showTitle && (
        <p className="mb-3 text-sm leading-6 font-semibold text-text-primary">
          {group.title}
        </p>
      )}
      <RadioGroup
        aria-label={group.title}
        className="space-y-3 pl-2"
        isReadOnly
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
    </div>
  );
}

function RequirementDetails({
  requirement,
  isUploading,
  onUpload,
}: {
  requirement: StudentAdmissionRequirement;
  isUploading: string | null;
  onUpload?: DocumentUploadHandler;
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

function AdmissionDocumentUpload({
  requirement,
  isUploading,
  onUpload,
}: {
  requirement: StudentAdmissionRequirement;
  isUploading: string | null;
  onUpload?: DocumentUploadHandler;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUpload = isUploading === requirement.documentType;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file && onUpload) void onUpload(requirement, file);
  };

  if (!onUpload) return null;

  return (
    <div className="mt-2">
      <Button
        appearance="outline"
        aria-controls={inputId}
        className="h-auto rounded-md border-primary-200 px-2.5 py-1.5 text-xs text-primary-600 hover:bg-primary-50 [&>svg]:size-3.5"
        isDisabled={Boolean(isUploading)}
        onPress={() => inputRef.current?.click()}
        size="xs"
        type="button"
      >
        <UploadCloud size={14} aria-hidden="true" />
        {currentUpload
          ? "Đang tải lên..."
          : requirement.hasDocument
            ? "Tải bản mới"
            : "Tải tài liệu"}
      </Button>
      <input
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="sr-only"
        disabled={Boolean(isUploading)}
        id={inputId}
        onChange={handleChange}
        ref={inputRef}
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
  const filePath = document.file?.trim();
  const fileName = filePath?.split("/").pop() || document.documentType;
  if (!filePath) {
    return <p className="text-xs text-text-tertiary">Chưa có tài liệu</p>;
  }

  return (
    <a
      className="inline-flex items-center gap-1.5 text-xs text-primary-500 underline-offset-2 hover:underline"
      href={resolveAdmissionDocumentUrl(filePath)}
      rel="noreferrer"
      target="_blank"
    >
      <FileText size={14} aria-hidden="true" />
      {fileName}
    </a>
  );
}

function resolveAdmissionDocumentUrl(file: string): string {
  const normalizedFile = file.trim();
  if (!normalizedFile) return "";

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(normalizedFile)) {
    return normalizedFile;
  }

  const apiUrl = readApiUrl();
  return apiUrl
    ? `${apiUrl}/${normalizedFile.replace(/^\/+/, "")}`
    : normalizedFile;
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
