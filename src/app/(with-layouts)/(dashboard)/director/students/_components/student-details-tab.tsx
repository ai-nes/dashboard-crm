"use client";

import { CheckCircle1, Envelope1, MapMarker5, Phone } from "@tailgrids/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { CopyableId } from "@/components/common/copyable-id";
import { EditableCard } from "@/components/common/editable-card";
import { SchoolCombobox } from "@/components/common/school-combobox";
import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Badge } from "@/components/tailgrids/core/badge";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import {
  updateStudent,
  type StudentUpdateFields,
} from "@/services/api/student-school-update";
import {
  deriveStudentStudyStage,
  getStudentStudyStageForPayload,
  getStudentStudyStageLabel,
  studentStudyStageOptions,
} from "@/services/api/student-school-update/student-study-stage";
import type {
  Student360Data,
  StudentContactConsent,
} from "@/services/api/students/types";
import { studentsKeys } from "@/hooks/use-students-queries";
import { formatDateTime } from "@/utils/format-date";

import type { Student360SectionProps } from "./types";

type EditableStudentCard = "personal" | "academic";

interface StudentDetailsTabProps extends Student360SectionProps {
  studentId: string;
  canEdit?: boolean;
}

interface PersonalForm {
  student_name: string;
  date_of_birth: string;
  gender: string;
  province: string;
  ward: string;
  phone: string;
  email: string;
}

interface AcademicForm {
  high_school: string;
  current_grade: string;
  study_stage: string;
  aspiration: string;
}

const genderOptions: EditableDetailOption[] = [
  { id: "", label: "Chưa xác định" },
  { id: "Nam", label: "Nam" },
  { id: "Nữ", label: "Nữ" },
];

const gradeOptions: EditableDetailOption[] = [
  { id: "", label: "Chưa xác định" },
  { id: "10", label: "Lớp 10" },
  { id: "11", label: "Lớp 11" },
  { id: "12", label: "Lớp 12" },
  { id: "post_exam", label: "Sau kỳ thi" },
];

export default function StudentDetailsTab({
  data,
  studentId,
  canEdit = true,
}: StudentDetailsTabProps) {
  const { student } = data;
  const queryClient = useQueryClient();
  const [editingCard, setEditingCard] = useState<EditableStudentCard | null>(
    null,
  );
  const [personalForm, setPersonalForm] = useState<PersonalForm>(() =>
    getPersonalForm(data),
  );
  const [academicForm, setAcademicForm] = useState<AcademicForm>(() =>
    getAcademicForm(data),
  );
  const verificationStatus = student.verificationStatus || "Chưa xác thực";
  const contactConsent = student.contactConsent;
  const consentIsGranted = contactConsent?.status === "Đã đồng ý";
  const updatedAt = student.lastUpdatedAt
    ? formatDateTime(student.lastUpdatedAt)
    : "-";
  const personalEditing = editingCard === "personal";
  const academicEditing = editingCard === "academic";
  const provinceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Student", fieldname: "province" },
    personalEditing,
  );
  const wardOptionsQuery = useStudentSchoolFieldOptions(
    personalForm.province
      ? {
          doctype: "CRM Student",
          fieldname: "ward",
          province: personalForm.province,
        }
      : null,
    personalEditing,
  );
  const provinceOptions =
    provinceOptionsQuery.data?.options.map(({ value, label }) => ({
      id: value,
      label,
    })) ?? [];
  const wardOptions =
    wardOptionsQuery.data?.options.map(({ value, label }) => ({
      id: value,
      label,
    })) ?? [];

  const updateMutation = useMutation({
    mutationFn: (variables: { fields: StudentUpdateFields; message: string }) =>
      updateStudent(studentId, variables.fields),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: studentsKeys.student360(studentId),
      });
      setEditingCard(null);
      toast.success(variables.message);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Chưa thể lưu thay đổi.",
      );
    },
  });

  const startEditing = (card: EditableStudentCard) => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    if (card === "personal") setPersonalForm(getPersonalForm(data));
    if (card === "academic") setAcademicForm(getAcademicForm(data));
    setEditingCard(card);
  };

  const cancelEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setEditingCard(null);
  };

  const savePersonal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!personalForm.student_name.trim()) {
      toast.error("Họ và tên không được để trống.");
      return;
    }

    const initial = getPersonalForm(data);
    const fields: StudentUpdateFields = {};
    if (personalForm.student_name !== initial.student_name)
      fields.student_name = nullable(personalForm.student_name);
    if (personalForm.date_of_birth !== initial.date_of_birth)
      fields.date_of_birth = nullable(personalForm.date_of_birth);
    if (personalForm.gender !== initial.gender)
      fields.gender = nullable(personalForm.gender);
    if (personalForm.province !== initial.province)
      fields.province = nullable(personalForm.province);
    if (personalForm.ward !== initial.ward)
      fields.ward = nullable(personalForm.ward);
    if (
      personalForm.province !== initial.province ||
      personalForm.ward !== initial.ward
    ) {
      fields.high_school = null;
    }
    if (personalForm.phone !== initial.phone)
      fields.phone = nullable(personalForm.phone);
    if (personalForm.email !== initial.email)
      fields.email = nullable(personalForm.email);

    if (Object.keys(fields).length === 0) {
      setEditingCard(null);
      return;
    }

    updateMutation.mutate({
      fields,
      message: "Đã cập nhật thông tin cá nhân.",
    });
  };

  const saveAcademic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getAcademicForm(data);
    const fields: StudentUpdateFields = {};
    const gradeChanged = academicForm.current_grade !== initial.current_grade;
    const studyStageChanged = academicForm.study_stage !== initial.study_stage;
    if (gradeChanged || studyStageChanged) {
      fields.current_grade = nullable(academicForm.current_grade);
      const studyStage = getStudentStudyStageForPayload(
        academicForm.current_grade,
        academicForm.study_stage,
      );
      if (studyStage) fields.study_stage = studyStage;
    }
    if (academicForm.aspiration !== initial.aspiration)
      fields.aspiration = nullable(academicForm.aspiration);
    if (academicForm.high_school !== initial.high_school)
      fields.high_school = nullable(academicForm.high_school);
    if (Object.keys(fields).length === 0) {
      setEditingCard(null);
      return;
    }

    updateMutation.mutate({
      fields,
      message: "Đã cập nhật định hướng học tập.",
    });
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <EditableCard
        canEdit={canEdit}
        editLabel="Chỉnh sửa thông tin cá nhân"
        headerContent={
          <Badge color={getVerificationColor(verificationStatus)}>
            <CheckCircle1 size={13} />
            {verificationStatus}
          </Badge>
        }
        isEditing={personalEditing}
        isSaving={updateMutation.isPending}
        onCancel={cancelEditing}
        onEdit={() => startEditing("personal")}
        onSave={savePersonal}
        title="Thông tin cá nhân"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableDetailField
            isEditing={personalEditing}
            label="Họ và tên"
            onChange={(value) =>
              setPersonalForm((form) => ({ ...form, student_name: value }))
            }
            value={personalEditing ? personalForm.student_name : student.name}
          />
          <div className="min-w-0">
            <dt className="text-xs text-text-tertiary">Mã hồ sơ</dt>
            <CopyableId
              className="mt-1"
              label="mã hồ sơ"
              value={student.code}
            />
          </div>
          <EditableDetailField
            isEditing={personalEditing}
            label="Ngày sinh"
            onChange={(value) =>
              setPersonalForm((form) => ({ ...form, date_of_birth: value }))
            }
            type="date"
            value={
              personalEditing
                ? personalForm.date_of_birth
                : getProfileValue(data, "Ngày sinh")
            }
          />
          <EditableDetailField
            isEditing={personalEditing}
            label="Giới tính"
            onChange={(value) =>
              setPersonalForm((form) => ({ ...form, gender: value }))
            }
            options={genderOptions}
            value={
              personalEditing
                ? personalForm.gender
                : getProfileValue(data, "Giới tính")
            }
          />
          <EditableDetailField
            isEditing={personalEditing}
            label="Tỉnh / thành phố"
            options={provinceOptions}
            isDisabled={
              provinceOptionsQuery.isLoading || provinceOptions.length === 0
            }
            onChange={(value) =>
              setPersonalForm((form) => ({
                ...form,
                province: value,
                ward: "",
              }))
            }
            value={personalEditing ? personalForm.province : student.province}
          />
          <EditableDetailField
            isEditing={personalEditing}
            label="Phường / xã"
            options={wardOptions}
            isDisabled={
              !personalForm.province ||
              wardOptionsQuery.isLoading ||
              wardOptions.length === 0
            }
            onChange={(value) =>
              setPersonalForm((form) => ({
                ...form,
                ward: value,
              }))
            }
            value={personalEditing ? personalForm.ward : student.ward || ""}
          />
          <EditableDetailField
            icon={<Phone size={14} className="text-icon-tertiary" />}
            isEditing={personalEditing}
            label="Số điện thoại"
            onChange={(value) =>
              setPersonalForm((form) => ({ ...form, phone: value }))
            }
            type="tel"
            value={personalEditing ? personalForm.phone : student.phone}
          />
          <EditableDetailField
            icon={<Envelope1 size={14} className="text-icon-tertiary" />}
            isEditing={personalEditing}
            label="Email"
            onChange={(value) =>
              setPersonalForm((form) => ({ ...form, email: value }))
            }
            type="email"
            value={personalEditing ? personalForm.email : student.email}
          />
        </dl>
        {contactConsent && (
          <div
            className={`mt-5 flex items-center justify-between gap-3 rounded-xl p-3 ${consentIsGranted ? "bg-badge-success-background" : "bg-badge-warning-background"}`}
          >
            <p
              className={`text-xs font-medium ${consentIsGranted ? "text-badge-success-text" : "text-badge-warning-text"}`}
            >
              {formatConsentMessage(contactConsent)}
            </p>
            <Badge color={consentIsGranted ? "success" : "warning"}>
              {contactConsent.status}
            </Badge>
          </div>
        )}
      </EditableCard>

      <EditableCard
        canEdit={canEdit}
        className="border-info-500/20"
        editLabel="Chỉnh sửa học tập và định hướng"
        headerContent={<Badge color="sky">Phù hợp cao</Badge>}
        isEditing={academicEditing}
        isSaving={updateMutation.isPending}
        onCancel={cancelEditing}
        onEdit={() => startEditing("academic")}
        onSave={saveAcademic}
        title="Học tập & định hướng"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-xs text-text-tertiary">Trường THPT</dt>
            {academicEditing ? (
              <SchoolCombobox
                isDisabled={!personalForm.province || !personalForm.ward}
                province={personalForm.province}
                value={academicForm.high_school}
                ward={personalForm.ward}
                onChange={(value) =>
                  setAcademicForm((form) => ({ ...form, high_school: value }))
                }
              />
            ) : (
              <dd
                className="mt-1 flex items-start gap-1.5 text-sm font-medium text-text-primary"
                title={getSchoolName(student.school, student.province) || "-"}
              >
                <MapMarker5
                  size={15}
                  className="mt-0.5 shrink-0 text-icon-tertiary"
                />
                {getSchoolName(student.school, student.province) || "-"}
              </dd>
            )}
          </div>
          {data.academics
            .filter((item) => !isSchoolAcademicItem(item.label))
            .map((item) => (
              <EditableDetailField
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          <EditableDetailField
            isEditing={academicEditing}
            label="Lớp hiện tại"
            onChange={(value) =>
              setAcademicForm((form) => ({
                ...form,
                current_grade: value,
                study_stage: value === "12" ? form.study_stage : "",
              }))
            }
            options={gradeOptions}
            value={
              academicEditing
                ? academicForm.current_grade
                : formatGradeDisplay(
                    getAcademicForm(data).current_grade,
                    student.grade,
                  )
            }
          />
          <EditableDetailField
            isEditing={academicEditing}
            isDisabled={academicForm.current_grade !== "12"}
            label="Giai đoạn học tập"
            onChange={(value) =>
              setAcademicForm((form) => ({ ...form, study_stage: value }))
            }
            options={studentStudyStageOptions}
            placeholder="Chưa xác định"
            value={
              academicEditing
                ? academicForm.study_stage
                : getStudentStudyStageLabel(
                    getAcademicForm(data).study_stage,
                    getAcademicForm(data).current_grade,
                  )
            }
          />
          <EditableDetailField
            isEditing={academicEditing}
            label="Nguyện vọng ưu tiên"
            onChange={(value) =>
              setAcademicForm((form) => ({ ...form, aspiration: value }))
            }
            value={academicEditing ? academicForm.aspiration : student.major}
          />
          <EditableDetailField
            label="Cập nhật gần nhất"
            readOnly
            value={updatedAt}
          />
        </dl>
        {academicEditing && (
          <p className="mt-4 text-xs leading-5 text-text-tertiary">
            Các chỉ số GPA, tiếng Anh, điểm mạnh và sở thích đang được đồng bộ
            từ nguồn học tập.
          </p>
        )}
      </EditableCard>
    </div>
  );
}

function getPersonalForm(data: Student360Data): PersonalForm {
  const gender = getProfileValue(data, "Giới tính");
  return {
    student_name: data.student.name || "",
    date_of_birth: toDateInputValue(getProfileValue(data, "Ngày sinh")),
    gender: gender === "-" ? "" : gender,
    province: data.student.province || "",
    ward: data.student.ward || "",
    phone: data.student.phone || "",
    email: data.student.email || "",
  };
}

function getAcademicForm(data: Student360Data): AcademicForm {
  const currentGrade = deriveGradeValue(data.student.grade);
  const rawStudyStage =
    deriveStudentStudyStage(data.student.studyStage) ??
    deriveStudentStudyStage(data.segmentation.learningStage);
  const studyStage = getStudentStudyStageForPayload(
    currentGrade,
    rawStudyStage,
  );

  return {
    high_school: getSchoolName(data.student.school, data.student.province),
    current_grade: currentGrade,
    study_stage: studyStage ?? "",
    aspiration: data.student.major || "",
  };
}

function isSchoolAcademicItem(label: string) {
  const normalizedLabel = label.trim().toLowerCase();
  return normalizedLabel === "trường" || normalizedLabel === "trường thpt";
}

function getProfileValue(data: Student360Data, label: string) {
  return data.profile?.find((item) => item.label === label)?.value || "-";
}

function getSchoolName(
  value: string | null | undefined,
  province: string | null | undefined,
) {
  if (!value) return "";
  if (!province) return value;
  const suffix = new RegExp(`,\\s*${escapeRegExp(province)}$`, "i");
  return value.replace(suffix, "").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveGradeValue(value: string | null | undefined) {
  const normalizedValue = value ?? "";
  if (/sau kỳ thi/i.test(normalizedValue)) return "post_exam";
  return normalizedValue.match(/\b(10|11|12)\b/)?.[1] ?? "";
}

function formatGradeDisplay(
  value: string,
  fallback: string | null | undefined,
) {
  if (value === "post_exam") return "Sau kỳ thi";
  if (value) return `Lớp ${value}`;
  return fallback || "-";
}

function toDateInputValue(value: string) {
  if (!value || value === "-") return "";
  const vietnameseDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vietnameseDate) {
    return `${vietnameseDate[3]}-${vietnameseDate[2].padStart(2, "0")}-${vietnameseDate[1].padStart(2, "0")}`;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function nullable(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function formatConsentMessage(consent: StudentContactConsent) {
  const channels = consent.channels.filter((channel) => channel !== "Zalo");
  return channels.length
    ? `Trạng thái liên hệ: ${channels.join(" và ")}.`
    : "Chưa ghi nhận kênh liên hệ được phép.";
}

function getVerificationColor(status: string) {
  if (status === "Đã xác thực") return "success" as const;
  if (status === "Cần xác minh") return "warning" as const;
  return "gray" as const;
}
