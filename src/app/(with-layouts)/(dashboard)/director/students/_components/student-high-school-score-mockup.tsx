"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart2 } from "@tailgrids/icons";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EditableDetailField } from "@/components/common/editable-detail-field";
import { Card } from "@/components/tailgrids/core/card";
import { studentsKeys } from "@/hooks/use-students-queries";
import {
  getStudentHighSchoolScore,
  updateStudentHighSchoolScore,
  type StudentHighSchoolScoreFields,
  type StudentHighSchoolScoreUpdateFields,
  type StudentScoreDetails,
} from "@/services/api/student-school-update";

import StudentCardHeader from "./student-card-header";
import StudentProfileCardActions from "./student-profile-card-actions";

interface StudentHighSchoolScoreMockupProps {
  data: {
    student: {
      admissionYear?: string | null;
    };
  };
  studentId: string;
  canEdit?: boolean;
}

type ScoreFieldKey = keyof StudentHighSchoolScoreFields;

interface ScoreFieldDefinition {
  key: ScoreFieldKey;
  label: string;
  type: "number" | "text";
  requiresProfile?: boolean;
  min?: number;
  step?: number;
  placeholder?: string;
}

type ScoreForm = Record<ScoreFieldKey, string>;

const highSchoolScoreFields: ScoreFieldDefinition[] = [
  {
    key: "grade_12_gpa",
    label: "Điểm TB lớp 12",
    type: "number",
    requiresProfile: true,
    min: 0,
    step: 0.01,
  },
  {
    key: "exam_candidate_number",
    label: "Số báo danh",
    type: "text",
    requiresProfile: true,
  },
  {
    key: "transcript_score",
    label: "Điểm học bạ CRM tính (TB điểm)",
    type: "number",
    min: 0,
    step: 0.01,
  },
  {
    key: "score_details",
    label: "Điểm chi tiết (JSON)",
    type: "text",
    requiresProfile: true,
    placeholder: '{"toan": 8.5}',
  },
  {
    key: "total_score",
    label: "Tổng điểm xét tuyển (ĐXT + ưu tiên + KK)",
    type: "number",
    min: 0,
    step: 0.01,
  },
  {
    key: "encouragement_type",
    label: "Tên loại điểm khuyến khích",
    type: "text",
    requiresProfile: true,
  },
  {
    key: "encouragement_score",
    label: "Số điểm khuyến khích",
    type: "number",
    requiresProfile: true,
    min: 0,
    step: 0.01,
  },
  {
    key: "priority_type",
    label: "Tên loại ưu tiên đối tượng",
    type: "text",
    requiresProfile: true,
  },
  {
    key: "priority_score",
    label: "Điểm ưu tiên đối tượng",
    type: "number",
    requiresProfile: true,
    min: 0,
    step: 0.01,
  },
];

export default function StudentHighSchoolScoreMockup({
  canEdit = true,
  data,
  studentId,
}: StudentHighSchoolScoreMockupProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ScoreForm>(() => getScoreForm());
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
  const updateMutation = useMutation({
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

  const scoreFields = scoreQuery.data?.fields;
  const hasAdmissionProfile = Boolean(scoreQuery.data?.admission_profile);

  const startEditing = () => {
    if (updateMutation.isPending || scoreQuery.isLoading) return;
    if (scoreQuery.isError) {
      toast.error("Chưa thể tải dữ liệu điểm THPT để chỉnh sửa.");
      return;
    }
    updateMutation.reset();
    setForm(getScoreForm(scoreFields));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getScoreForm(scoreFields));
    setIsEditing(false);
  };

  const saveHighSchoolScore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getScoreForm(scoreFields);
    const fields: StudentHighSchoolScoreUpdateFields = {};

    try {
      if (form.grade_12_gpa !== initial.grade_12_gpa) {
        fields.grade_12_gpa = parseScoreNumber(
          form.grade_12_gpa,
          "Điểm TB lớp 12",
        );
      }
      if (form.exam_candidate_number !== initial.exam_candidate_number) {
        fields.exam_candidate_number = nullableText(form.exam_candidate_number);
      }
      if (form.transcript_score !== initial.transcript_score) {
        fields.transcript_score = parseScoreNumber(
          form.transcript_score,
          "Điểm học bạ CRM tính",
        );
      }
      if (form.score_details !== initial.score_details) {
        fields.score_details = parseScoreDetails(form.score_details);
      }
      if (form.total_score !== initial.total_score) {
        fields.total_score = parseScoreNumber(
          form.total_score,
          "Tổng điểm xét tuyển",
        );
      }
      if (form.encouragement_type !== initial.encouragement_type) {
        fields.encouragement_type = nullableText(form.encouragement_type);
      }
      if (form.encouragement_score !== initial.encouragement_score) {
        fields.encouragement_score = parseScoreNumber(
          form.encouragement_score,
          "Số điểm khuyến khích",
        );
      }
      if (form.priority_type !== initial.priority_type) {
        fields.priority_type = nullableText(form.priority_type);
      }
      if (form.priority_score !== initial.priority_score) {
        fields.priority_score = parseScoreNumber(
          form.priority_score,
          "Điểm ưu tiên đối tượng",
        );
      }

      const changedProfileField = highSchoolScoreFields.some(
        (field) => field.requiresProfile && field.key in fields,
      );
      if (changedProfileField && !hasAdmissionProfile) {
        throw new Error(
          "Chưa có hồ sơ xét tuyển để cập nhật các điểm THPT này.",
        );
      }
      if (Object.keys(fields).length === 0) {
        setIsEditing(false);
        return;
      }

      await updateMutation.mutateAsync(fields);
      setIsEditing(false);
      toast.success("Đã cập nhật điểm THPT.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Chưa thể lưu điểm THPT.",
      );
    }
  };

  const content = (
    <>
      <StudentCardHeader
        description="Các điểm số và tiêu chí dùng để xét tuyển."
        icon={<BarChart2 size={18} aria-hidden="true" />}
        rightAction={
          <StudentProfileCardActions
            canEdit={canEdit}
            isEditing={isEditing}
            isSaving={updateMutation.isPending}
            onCancel={cancelEditing}
            onEdit={startEditing}
          />
        }
        title="Điểm THPT"
      />

      {scoreQuery.isLoading && (
        <p className="mb-4 text-sm text-text-tertiary">Đang tải điểm THPT...</p>
      )}
      {scoreQuery.isError && (
        <p className="mb-4 rounded-lg bg-badge-error-background p-3 text-sm text-badge-error-text">
          {scoreQuery.error instanceof Error
            ? scoreQuery.error.message
            : "Không thể tải dữ liệu điểm THPT."}
        </p>
      )}
      {!scoreQuery.isLoading && scoreQuery.data && !hasAdmissionProfile && (
        <p className="mb-4 rounded-lg bg-badge-warning-background p-3 text-sm text-badge-warning-text">
          Học sinh chưa có hồ sơ xét tuyển; chỉ các điểm thuộc hồ sơ Student có
          thể cập nhật.
        </p>
      )}

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {highSchoolScoreFields.map((field) => (
          <EditableDetailField
            key={field.key}
            isDisabled={
              scoreQuery.isLoading ||
              (Boolean(field.requiresProfile) && !hasAdmissionProfile)
            }
            isEditing={isEditing}
            label={field.label}
            min={field.min}
            onChange={(value) =>
              setForm((current) => ({ ...current, [field.key]: value }))
            }
            placeholder={field.placeholder}
            step={field.step}
            type={field.type}
            value={
              isEditing
                ? form[field.key]
                : formatScoreValue(scoreFields?.[field.key])
            }
          />
        ))}
      </dl>
    </>
  );

  return (
    <Card className="h-full p-5">
      {isEditing ? (
        <form onSubmit={saveHighSchoolScore}>{content}</form>
      ) : (
        content
      )}
    </Card>
  );
}

function getScoreForm(fields?: StudentHighSchoolScoreFields): ScoreForm {
  return {
    graduation_score: formatScoreValue(fields?.graduation_score),
    transcript_score: formatScoreValue(fields?.transcript_score),
    total_score: formatScoreValue(fields?.total_score),
    is_high_school_graduate: formatScoreValue(fields?.is_high_school_graduate),
    graduation_year: formatScoreValue(fields?.graduation_year),
    academic_rank: formatScoreValue(fields?.academic_rank),
    priority_group: formatScoreValue(fields?.priority_group),
    graduation_classification: formatScoreValue(
      fields?.graduation_classification,
    ),
    conduct_rank: formatScoreValue(fields?.conduct_rank),
    grade_12_gpa: formatScoreValue(fields?.grade_12_gpa),
    exam_candidate_number: formatScoreValue(fields?.exam_candidate_number),
    score_details: formatScoreValue(fields?.score_details),
    encouragement_type: formatScoreValue(fields?.encouragement_type),
    encouragement_score: formatScoreValue(fields?.encouragement_score),
    priority_type: formatScoreValue(fields?.priority_type),
    priority_score: formatScoreValue(fields?.priority_score),
  };
}

function formatScoreValue(
  value: boolean | number | string | StudentScoreDetails | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  return JSON.stringify(value);
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
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

function parseScoreDetails(value: string): StudentScoreDetails | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Điểm chi tiết phải là JSON hợp lệ.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Điểm chi tiết phải là JSON object hoặc array.");
  }
  return parsed as StudentScoreDetails;
}
