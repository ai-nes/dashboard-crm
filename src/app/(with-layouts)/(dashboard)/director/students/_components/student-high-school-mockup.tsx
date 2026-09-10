"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book4 } from "@tailgrids/icons";
import { toast } from "sonner";

import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { SchoolCombobox } from "@/components/common/school-combobox";
import { Card } from "@/components/tailgrids/core/card";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import { studentsKeys } from "@/hooks/use-students-queries";
import {
  getStudentHighSchoolScore,
  updateStudentHighSchoolScore,
  type StudentHighSchoolScoreFields,
  type StudentHighSchoolScoreUpdateFields,
  type StudentUpdateFields,
} from "@/services/api/student-school-update";
import type { Student360Data } from "@/services/api/students/types";

import StudentCardHeader from "./student-card-header";
import StudentProfileCardActions from "./student-profile-card-actions";
import { useStudentProfileUpdate } from "./use-student-profile-update";

interface HighSchoolForm {
  province: string;
  ward: string;
  high_school: string;
  graduation_score: string;
  is_high_school_graduate: string;
  graduation_year: string;
  academic_rank: string;
  priority_group: string;
  graduation_classification: string;
  conduct_rank: string;
}

const graduationStatusOptions: EditableDetailOption[] = [
  { id: "1", label: "Có" },
  { id: "0", label: "Không" },
];

const academicRankOptions: EditableDetailOption[] = [
  { id: "Giỏi", label: "Giỏi" },
  { id: "Khá", label: "Khá" },
  { id: "Trung bình", label: "Trung bình" },
  { id: "Yếu", label: "Yếu" },
];

const graduationClassificationOptions: EditableDetailOption[] = [
  { id: "Xuất sắc", label: "Xuất sắc" },
  { id: "Giỏi", label: "Giỏi" },
  { id: "Khá", label: "Khá" },
  { id: "Trung bình", label: "Trung bình" },
  { id: "Yếu", label: "Yếu" },
];

const conductRankOptions: EditableDetailOption[] = [
  { id: "Tốt", label: "Tốt" },
  { id: "Khá", label: "Khá" },
  { id: "Trung bình", label: "Trung bình" },
  { id: "Yếu", label: "Yếu" },
];

interface StudentHighSchoolMockupProps {
  data: Student360Data;
  studentId: string;
  canEdit?: boolean;
}

export default function StudentHighSchoolMockup({
  canEdit = true,
  data,
  studentId,
}: StudentHighSchoolMockupProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<HighSchoolForm>(() =>
    getHighSchoolForm(data),
  );
  const updateMutation = useStudentProfileUpdate(studentId);
  const scoreQuery = useQuery({
    queryKey: studentsKeys.studentHighSchoolScore(
      studentId,
      data.student.admissionYear,
    ),
    queryFn: () =>
      getStudentHighSchoolScore(
        studentId,
        data.student.admissionYear || undefined,
      ),
    enabled: Boolean(studentId),
    staleTime: 60_000,
  });
  const scoreUpdateMutation = useMutation({
    mutationFn: (fields: StudentHighSchoolScoreUpdateFields) =>
      updateStudentHighSchoolScore(
        studentId,
        fields,
        data.student.admissionYear || undefined,
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentsKeys.studentHighSchoolScore(
            studentId,
            data.student.admissionYear,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.student360(studentId),
        }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.directorStudentsRoot,
        }),
        queryClient.invalidateQueries({
          queryKey: studentsKeys.assignedStudentsRoot,
        }),
      ]);
    },
  });

  const provinceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Student", fieldname: "province" },
    isEditing,
  );
  const wardOptionsQuery = useStudentSchoolFieldOptions(
    form.province
      ? { doctype: "CRM Student", fieldname: "ward", province: form.province }
      : null,
    isEditing,
  );
  const selectedSchool = isEditing
    ? form.high_school
    : data.student.schoolId || "";
  const areaOptionsQuery = useStudentSchoolFieldOptions(
    selectedSchool
      ? {
          doctype: "CRM High School",
          fieldname: "school_area",
          high_school: selectedSchool,
          limit: 1,
        }
      : null,
    Boolean(selectedSchool),
  );

  const provinceOptions = toEditableOptions(provinceOptionsQuery.data?.options);
  const wardOptions = toEditableOptions(wardOptionsQuery.data?.options);
  const areaOptions = toValueOptions(areaOptionsQuery.data?.options);
  const areaValue = areaOptions[0]?.id || "";
  const scoreFields = scoreQuery.data?.fields;
  const hasAdmissionProfile = Boolean(scoreQuery.data?.admission_profile);
  const isSaving = updateMutation.isPending || scoreUpdateMutation.isPending;

  const startEditing = () => {
    if (isSaving || scoreQuery.isLoading) return;
    if (scoreQuery.isError) {
      toast.error("Chưa thể tải dữ liệu học tập để chỉnh sửa.");
      return;
    }
    updateMutation.reset();
    scoreUpdateMutation.reset();
    setForm(getHighSchoolForm(data, scoreFields));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (isSaving) return;
    updateMutation.reset();
    scoreUpdateMutation.reset();
    setForm(getHighSchoolForm(data, scoreFields));
    setIsEditing(false);
  };

  const saveHighSchool = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getHighSchoolForm(data, scoreFields);
    const fields: StudentUpdateFields = {};
    const scoreUpdates: StudentHighSchoolScoreUpdateFields = {};

    try {
      if (form.province !== initial.province)
        fields.province = nullable(form.province);
      if (form.ward !== initial.ward) fields.ward = nullable(form.ward);
      if (form.high_school !== initial.high_school)
        fields.high_school = nullable(form.high_school);
      if (form.graduation_score !== initial.graduation_score) {
        scoreUpdates.graduation_score = parseScoreNumber(
          form.graduation_score,
          "Điểm tốt nghiệp THPT",
        );
      }
      if (form.is_high_school_graduate !== initial.is_high_school_graduate) {
        scoreUpdates.is_high_school_graduate = parseBoolean(
          form.is_high_school_graduate,
        );
      }
      if (form.graduation_year !== initial.graduation_year) {
        scoreUpdates.graduation_year = parseYear(form.graduation_year);
      }
      if (form.academic_rank !== initial.academic_rank) {
        scoreUpdates.academic_rank = nullable(form.academic_rank);
      }
      if (form.priority_group !== initial.priority_group) {
        scoreUpdates.priority_group = nullable(form.priority_group);
      }
      if (
        form.graduation_classification !== initial.graduation_classification
      ) {
        scoreUpdates.graduation_classification = nullable(
          form.graduation_classification,
        );
      }
      if (form.conduct_rank !== initial.conduct_rank) {
        scoreUpdates.conduct_rank = nullable(form.conduct_rank);
      }

      if (
        Object.keys(fields).length === 0 &&
        Object.keys(scoreUpdates).length === 0
      ) {
        setIsEditing(false);
        return;
      }

      if (Object.keys(scoreUpdates).length > 0) {
        if (!hasAdmissionProfile && hasProfileScoreUpdate(scoreUpdates)) {
          throw new Error(
            "Chưa có hồ sơ xét tuyển để cập nhật thông tin THPT.",
          );
        }
      }
      if (Object.keys(fields).length > 0) {
        await updateMutation.mutateAsync(fields);
      }
      if (Object.keys(scoreUpdates).length > 0) {
        await scoreUpdateMutation.mutateAsync(scoreUpdates);
      }
      setIsEditing(false);
      toast.success("Đã cập nhật thông tin trường THPT.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu thông tin trường THPT.",
      );
    }
  };

  const content = (
    <>
      <StudentCardHeader
        description="Thông tin trường, khu vực và kết quả tốt nghiệp THPT."
        icon={<Book4 size={18} aria-hidden="true" />}
        rightAction={
          <StudentProfileCardActions
            canEdit={canEdit}
            isEditing={isEditing}
            isSaving={isSaving}
            onCancel={cancelEditing}
            onEdit={startEditing}
          />
        }
        title="Thông tin trường THPT"
      />

      <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
        <EditableDetailField
          isEditing={isEditing}
          isDisabled={provinceOptionsQuery.isLoading}
          label="Tỉnh/TP Trường (mới)"
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              province: value,
              ward: "",
              high_school: "",
            }))
          }
          options={provinceOptions}
          value={isEditing ? form.province : data.student.province || ""}
        />
        <div className="min-w-0">
          <dt className="text-xs text-text-tertiary">Trường THPT (mới)</dt>
          {isEditing ? (
            <SchoolCombobox
              isDisabled={!form.province}
              province={form.province}
              requiresWard={false}
              selectedSchoolLabel={
                form.high_school === data.student.schoolId
                  ? data.student.school
                  : undefined
              }
              value={form.high_school}
              ward={form.ward}
              onChange={(value) =>
                setForm((current) => ({ ...current, high_school: value }))
              }
            />
          ) : (
            <dd className="mt-1 break-words text-sm font-medium text-text-primary">
              {data.student.school || "-"}
            </dd>
          )}
        </div>
        <EditableDetailField
          isEditing={isEditing}
          isDisabled={!form.province || wardOptionsQuery.isLoading}
          label="Phường/Xã (mới)"
          onChange={(value) =>
            setForm((current) => ({ ...current, ward: value, high_school: "" }))
          }
          options={wardOptions}
          value={isEditing ? form.ward : data.student.ward || ""}
        />
        <EditableDetailField
          isDisabled={
            !selectedSchool ||
            areaOptionsQuery.isLoading ||
            areaOptions.length === 0
          }
          isEditing={isEditing}
          label="Khu Vực"
          onChange={() => undefined}
          options={areaOptions}
          value={areaValue}
        />
        <EditableDetailField
          isDisabled={scoreQuery.isLoading}
          isEditing={isEditing}
          label="Điểm tốt nghiệp THPT"
          max={10}
          min={0}
          onChange={(value) =>
            setForm((current) => ({ ...current, graduation_score: value }))
          }
          step={0.01}
          type="number"
          value={
            isEditing
              ? form.graduation_score
              : formatScoreValue(scoreFields?.graduation_score)
          }
        />
        <EditableDetailField
          isDisabled={scoreQuery.isLoading || !hasAdmissionProfile}
          isEditing={isEditing}
          label="Đã tốt nghiệp THPT"
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              is_high_school_graduate: value,
            }))
          }
          options={graduationStatusOptions}
          value={
            isEditing
              ? form.is_high_school_graduate
              : formatGraduationStatus(scoreFields?.is_high_school_graduate)
          }
        />
        <EditableDetailField
          isDisabled={scoreQuery.isLoading || !hasAdmissionProfile}
          isEditing={isEditing}
          label="Năm tốt nghiệp THPT"
          max={2100}
          min={1900}
          onChange={(value) =>
            setForm((current) => ({ ...current, graduation_year: value }))
          }
          step={1}
          type="number"
          value={
            isEditing
              ? form.graduation_year
              : formatScoreValue(scoreFields?.graduation_year)
          }
        />
        <EditableDetailField
          isDisabled={scoreQuery.isLoading}
          isEditing={isEditing}
          label="Loại học lực"
          onChange={(value) =>
            setForm((current) => ({ ...current, academic_rank: value }))
          }
          options={academicRankOptions}
          value={
            isEditing
              ? form.academic_rank
              : formatScoreValue(scoreFields?.academic_rank)
          }
        />
        <EditableDetailField
          isDisabled={scoreQuery.isLoading || !hasAdmissionProfile}
          isEditing={isEditing}
          label="Đối tượng ưu tiên"
          onChange={(value) =>
            setForm((current) => ({ ...current, priority_group: value }))
          }
          value={
            isEditing
              ? form.priority_group
              : formatScoreValue(scoreFields?.priority_group)
          }
        />
        <EditableDetailField
          isDisabled={scoreQuery.isLoading || !hasAdmissionProfile}
          isEditing={isEditing}
          label="Xếp loại tốt nghiệp THPT"
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              graduation_classification: value,
            }))
          }
          options={graduationClassificationOptions}
          value={
            isEditing
              ? form.graduation_classification
              : formatScoreValue(scoreFields?.graduation_classification)
          }
        />
        <EditableDetailField
          isDisabled={scoreQuery.isLoading || !hasAdmissionProfile}
          isEditing={isEditing}
          label="Loại hạnh kiểm"
          onChange={(value) =>
            setForm((current) => ({ ...current, conduct_rank: value }))
          }
          options={conductRankOptions}
          value={
            isEditing
              ? form.conduct_rank
              : formatScoreValue(scoreFields?.conduct_rank)
          }
        />
      </dl>
    </>
  );

  return (
    <Card className="h-full p-5">
      {isEditing ? <form onSubmit={saveHighSchool}>{content}</form> : content}
    </Card>
  );
}

function getHighSchoolForm(
  data: Student360Data,
  fields?: StudentHighSchoolScoreFields,
): HighSchoolForm {
  return {
    province: data.student.provinceId || "",
    ward: data.student.wardId || "",
    high_school: data.student.schoolId || "",
    graduation_score: formatScoreValue(fields?.graduation_score),
    is_high_school_graduate: formatBooleanValue(
      fields?.is_high_school_graduate,
    ),
    graduation_year: formatScoreValue(fields?.graduation_year),
    academic_rank: formatScoreValue(fields?.academic_rank),
    priority_group: formatScoreValue(fields?.priority_group),
    graduation_classification: formatScoreValue(
      fields?.graduation_classification,
    ),
    conduct_rank: formatScoreValue(fields?.conduct_rank),
  };
}

function toEditableOptions(
  options: Array<{ value: string; label: string }> | undefined,
): EditableDetailOption[] {
  return options?.map(({ value, label }) => ({ id: value, label })) ?? [];
}

function toValueOptions(
  options: Array<{ value: string; label: string }> | undefined,
): EditableDetailOption[] {
  return options?.map(({ value }) => ({ id: value, label: value })) ?? [];
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function formatScoreValue(value: number | string | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function formatBooleanValue(value: boolean | null | undefined) {
  return value === null || value === undefined ? "" : value ? "1" : "0";
}

function formatGraduationStatus(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "";
  return value ? "Có" : "Không";
}

function parseBoolean(value: string): boolean | null {
  if (!value) return null;
  return value === "1";
}

function parseScoreNumber(value: string, label: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} phải là số lớn hơn hoặc bằng 0.`);
  }
  return parsed;
}

function parseYear(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
    throw new Error("Năm tốt nghiệp THPT phải là số nguyên từ 1900 đến 2100.");
  }
  return parsed;
}

function hasProfileScoreUpdate(fields: StudentHighSchoolScoreUpdateFields) {
  return [
    "is_high_school_graduate",
    "graduation_year",
    "priority_group",
    "graduation_classification",
    "conduct_rank",
  ].some((fieldname) => fieldname in fields);
}
