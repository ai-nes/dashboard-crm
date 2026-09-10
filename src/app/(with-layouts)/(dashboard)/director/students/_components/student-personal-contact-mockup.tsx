"use client";

import { UserCircle1 } from "@tailgrids/icons";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { Card } from "@/components/tailgrids/core/card";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import type { StudentUpdateFields } from "@/services/api/student-school-update";
import type {
  Student360Data,
  StudentProfilePersonalDetails,
} from "@/services/api/students/types";
import { formatDate, formatDateTime } from "@/utils/format-date";

import StudentContactAddressMockup from "./student-contact-address-mockup";
import StudentContactInformationMockup from "./student-contact-information-mockup";
import StudentCardHeader from "./student-card-header";
import StudentProfileCardActions from "./student-profile-card-actions";
import { useStudentProfileUpdate } from "./use-student-profile-update";

interface PersonalForm {
  student_name: string;
  date_of_birth: string;
  gender: string;
  id_number: string;
  birth_place: string;
  ethnicity: string;
  religion: string;
  nationality: string;
  id_issued_date: string;
  id_issued_place: string;
  phone: string;
  other_phone: string;
  email: string;
  other_email: string;
  major: string;
  admission_year: string;
  branch: string;
}

interface PersonalContactField {
  label: string;
  value?: string | null;
  href?: string;
  editKey?: keyof PersonalForm;
  type?: "date" | "email" | "tel" | "text";
  options?: EditableDetailOption[];
  searchable?: boolean;
}

interface StudentPersonalContactMockupProps {
  data: Student360Data;
  studentId: string;
  canEdit?: boolean;
}

const genderOptions: EditableDetailOption[] = [
  { id: "", label: "Chưa xác định" },
  { id: "Nam", label: "Nam" },
  { id: "Nữ", label: "Nữ" },
];

export default function StudentPersonalContactMockup({
  data,
  studentId,
  canEdit = true,
}: StudentPersonalContactMockupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PersonalForm>(() => getPersonalForm(data));
  const updateMutation = useStudentProfileUpdate(studentId);
  const details = data.student.profileDetails?.personal;
  const majorOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Student", fieldname: "major", limit: 100 },
    isEditing,
  );
  const admissionYearOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Student", fieldname: "admission_year", limit: 100 },
    isEditing,
  );
  const branchOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Student", fieldname: "branch", limit: 100 },
    isEditing,
  );
  const personalContactFields = getPersonalContactFields(data, details, {
    major: toEditableOptions(majorOptionsQuery.data?.options),
    admissionYear: toEditableOptions(admissionYearOptionsQuery.data?.options),
    branch: toEditableOptions(branchOptionsQuery.data?.options),
  });

  const startEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getPersonalForm(data));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setForm(getPersonalForm(data));
    setIsEditing(false);
  };

  const savePersonal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.student_name.trim()) {
      toast.error("Họ và tên không được để trống.");
      return;
    }

    const initial = getPersonalForm(data);
    const fields: StudentUpdateFields = {};
    if (form.student_name !== initial.student_name)
      fields.student_name = nullable(form.student_name);
    if (form.date_of_birth !== initial.date_of_birth)
      fields.date_of_birth = nullable(form.date_of_birth);
    if (form.gender !== initial.gender) fields.gender = nullable(form.gender);
    if (form.id_number !== initial.id_number)
      fields.id_number = nullable(form.id_number);
    if (form.birth_place !== initial.birth_place)
      fields.birth_place = nullable(form.birth_place);
    if (form.ethnicity !== initial.ethnicity)
      fields.ethnicity = nullable(form.ethnicity);
    if (form.religion !== initial.religion)
      fields.religion = nullable(form.religion);
    if (form.nationality !== initial.nationality)
      fields.nationality = nullable(form.nationality);
    if (form.id_issued_date !== initial.id_issued_date)
      fields.id_issued_date = nullable(form.id_issued_date);
    if (form.id_issued_place !== initial.id_issued_place)
      fields.id_issued_place = nullable(form.id_issued_place);
    if (form.phone !== initial.phone) fields.phone = nullable(form.phone);
    if (form.other_phone !== initial.other_phone)
      fields.other_phone = nullable(form.other_phone);
    if (form.email !== initial.email) fields.email = nullable(form.email);
    if (form.other_email !== initial.other_email)
      fields.other_email = nullable(form.other_email);
    if (form.major !== initial.major) fields.major = nullable(form.major);
    if (form.admission_year !== initial.admission_year)
      fields.admission_year = nullable(form.admission_year);
    if (form.branch !== initial.branch) fields.branch = nullable(form.branch);

    if (Object.keys(fields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateMutation.mutateAsync(fields);
      setIsEditing(false);
      toast.success("Đã cập nhật thông tin cá nhân.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu thông tin cá nhân.",
      );
    }
  };

  const content = (
    <>
      <StudentCardHeader
        description="Thông tin định danh và hồ sơ liên hệ chính của học sinh."
        icon={<UserCircle1 size={18} aria-hidden="true" />}
        rightAction={
          <StudentProfileCardActions
            canEdit={canEdit}
            isEditing={isEditing}
            isSaving={updateMutation.isPending}
            onCancel={cancelEditing}
            onEdit={startEditing}
          />
        }
        title="Thông tin cá nhân"
      />

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {personalContactFields.map((field) => {
          if (isEditing && field.editKey) {
            const editKey = field.editKey;
            return (
              <EditableDetailField
                key={field.label}
                isEditing
                label={field.label}
                onChange={(value) =>
                  setForm((current) => ({ ...current, [editKey]: value }))
                }
                options={field.options}
                searchable={field.searchable}
                type={field.type}
                value={form[editKey]}
              />
            );
          }

          return (
            <PersonalContactDisplayField key={field.label} field={field} />
          );
        })}
      </dl>
    </>
  );

  return (
    <div className="space-y-6">
      <Card className="p-5">
        {isEditing ? <form onSubmit={savePersonal}>{content}</form> : content}
      </Card>

      <StudentContactInformationMockup
        canEdit={canEdit}
        data={data}
        studentId={studentId}
      />
      <StudentContactAddressMockup
        canEdit={canEdit}
        data={data}
        studentId={studentId}
      />
    </div>
  );
}

function PersonalContactDisplayField({
  field,
}: {
  field: PersonalContactField;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-tertiary">{field.label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-text-primary">
        {field.href && field.value ? (
          <a
            className="text-primary-500 underline-offset-2 hover:underline"
            href={field.href}
            rel="noreferrer"
            target="_blank"
          >
            {field.value}
          </a>
        ) : (
          field.value || "-"
        )}
      </dd>
    </div>
  );
}

function getPersonalForm(data: Student360Data): PersonalForm {
  const details = data.student.profileDetails?.personal;
  return {
    student_name: details?.fullName || data.student.name || "",
    date_of_birth: details?.dateOfBirth || "",
    gender: details?.gender || getProfileValue(data, "Giới tính"),
    id_number: details?.idNumber || "",
    birth_place: details?.birthPlace || "",
    ethnicity: details?.ethnicity || "",
    religion: details?.religion || "",
    nationality: details?.nationality || "",
    id_issued_date: details?.idIssuedDate || "",
    id_issued_place: details?.idIssuedPlace || "",
    phone: details?.phone || data.student.phone || "",
    other_phone: details?.otherPhone || "",
    email: details?.email || data.student.email || "",
    other_email: details?.otherEmail || "",
    major: details?.majorId || "",
    admission_year: details?.admissionYearId || "",
    branch: details?.branchId || "",
  };
}

function getPersonalContactFields(
  data: Student360Data,
  details?: StudentProfilePersonalDetails | null,
  options?: {
    major: EditableDetailOption[];
    admissionYear: EditableDetailOption[];
    branch: EditableDetailOption[];
  },
): PersonalContactField[] {
  const fieldOptions = options ?? { major: [], admissionYear: [], branch: [] };
  return [
    {
      label: "Họ và Tên",
      value: details?.fullName || data.student.name,
      editKey: "student_name",
    },
    {
      label: "Ngày sinh",
      value: formatDate(details?.dateOfBirth),
      editKey: "date_of_birth",
      type: "date",
    },
    {
      label: "Giới tính",
      value: details?.gender || getProfileValue(data, "Giới tính"),
      editKey: "gender",
      options: genderOptions,
    },
    {
      label: "CCCD/Passport",
      value: details?.idNumber,
      editKey: "id_number",
    },
    {
      label: "Nơi sinh",
      value: details?.birthPlace,
      editKey: "birth_place",
    },
    {
      label: "Dân tộc",
      value: details?.ethnicity,
      editKey: "ethnicity",
    },
    {
      label: "Tôn giáo",
      value: details?.religion,
      editKey: "religion",
    },
    {
      label: "Quốc tịch",
      value: details?.nationality,
      editKey: "nationality",
    },
    {
      label: "Ngày cấp",
      value: formatDate(details?.idIssuedDate),
      editKey: "id_issued_date",
      type: "date",
    },
    {
      label: "Nơi cấp",
      value: details?.idIssuedPlace,
      editKey: "id_issued_place",
    },
    {
      label: "Di Động",
      value: details?.phone || data.student.phone,
      editKey: "phone",
      type: "tel",
    },
    {
      label: "ĐT khác",
      value: details?.otherPhone,
      editKey: "other_phone",
      type: "tel",
    },
    {
      label: "Email",
      value: details?.email || data.student.email,
      editKey: "email",
      type: "email",
    },
    {
      label: "Email khác",
      value: details?.otherEmail,
      editKey: "other_email",
      type: "email",
    },
    {
      label: "Nguồn",
      value: details?.source || getProfileValue(data, "Nguồn"),
    },
    { label: "Chiến dịch", value: details?.campaign },
    { label: "Giao cho", value: details?.owner || data.student.counselor },
    { label: "Chuyển đổi từ Đầu mối", value: details?.convertedFromLead },
    { label: "Chuyển từ Lead", value: details?.sourceLead },
    {
      label: "Ngành học quan tâm",
      value: details?.major || data.student.major,
      editKey: "major",
      options: fieldOptions.major,
      searchable: true,
    },
    {
      label: "Năm tuyển sinh",
      value: details?.admissionYear,
      editKey: "admission_year",
      options: fieldOptions.admissionYear,
    },
    {
      label: "Chi nhánh",
      value: details?.branch,
      editKey: "branch",
      options: fieldOptions.branch,
    },
    { label: "Ngày tạo", value: formatDateTime(details?.createdAt) },
    { label: "Ngày sửa", value: formatDateTime(details?.modifiedAt) },
  ];
}

function getProfileValue(data: Student360Data, label: string) {
  return data.profile?.find((item) => item.label === label)?.value || "";
}

function toEditableOptions(
  options: Array<{ value: string; label: string }> | undefined,
): EditableDetailOption[] {
  return options?.map(({ value, label }) => ({ id: value, label })) ?? [];
}

function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}
