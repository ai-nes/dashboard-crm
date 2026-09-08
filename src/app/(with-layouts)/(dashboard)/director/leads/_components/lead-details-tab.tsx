"use client";

import {
  Book4,
  Envelope1,
  Layers2,
  MapMarker5,
  Phone,
  User2,
} from "@tailgrids/icons";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  EditableDetailField,
  type EditableDetailOption,
} from "@/components/common/editable-detail-field";
import { SchoolCombobox } from "@/components/common/school-combobox";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useStudentSchoolFieldOptions } from "@/hooks/use-student-school-field-options";
import { useUpdateLeadMutation } from "@/hooks/use-lead-sale-leads-queries";
import type { LeadDetail, LeadUpdateFields } from "@/services/api/lead-sale";

import LeadDetailSection from "./lead-detail-section";
import { LeadDetailTags } from "./lead-detail-field";

type EditableLeadSection = "contact" | "admission" | "source";

interface LeadDetailsTabProps {
  lead: LeadDetail;
  leadId: string;
  canEdit?: boolean;
}

interface ContactForm {
  student_name: string;
  phone: string;
  email: string;
  other_email: string;
  province: string;
  ward: string;
  high_school: string;
}

interface AdmissionForm {
  major: string;
  aspiration: string;
  admission_year: string;
  branch: string;
  conversion_potential: string;
}

interface SourceForm {
  source: string;
  advertising_channel: string;
  segments: string;
  notes: string;
}

const emptyOption: EditableDetailOption = {
  id: "",
  label: "Chưa cập nhật",
};

const conversionPotentialOptions: EditableDetailOption[] = [
  emptyOption,
  { id: "High", label: "Cao" },
  { id: "Medium", label: "Trung bình" },
  { id: "Low", label: "Thấp" },
  { id: "Unknown", label: "Chưa xác định" },
];

export default function LeadDetailsTab({
  lead,
  leadId,
  canEdit = true,
}: LeadDetailsTabProps) {
  const [editingSection, setEditingSection] =
    useState<EditableLeadSection | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(() =>
    getContactForm(lead),
  );
  const [admissionForm, setAdmissionForm] = useState<AdmissionForm>(() =>
    getAdmissionForm(lead),
  );
  const [sourceForm, setSourceForm] = useState<SourceForm>(() =>
    getSourceForm(lead),
  );
  const updateMutation = useUpdateLeadMutation();

  const provinceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "province" },
    editingSection === "contact",
  );
  const wardOptionsQuery = useStudentSchoolFieldOptions(
    {
      doctype: "CRM Lead",
      fieldname: "ward",
      limit: 100,
      province: contactForm.province || undefined,
    },
    editingSection === "contact" && Boolean(contactForm.province),
  );
  const sourceOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "source" },
    editingSection === "source",
  );
  const majorOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "major" },
    editingSection === "admission",
  );
  const aspirationOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "aspiration" },
    editingSection === "admission",
  );
  const admissionYearOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "admission_year" },
    editingSection === "admission",
  );
  const branchOptionsQuery = useStudentSchoolFieldOptions(
    { doctype: "CRM Lead", fieldname: "branch" },
    editingSection === "admission",
  );

  const provinceOptions = toEditableOptions(
    provinceOptionsQuery.data?.options,
    contactForm.province,
  );
  const wardOptions = toEditableOptions(
    wardOptionsQuery.data?.options,
    contactForm.ward,
  );
  const sourceOptions = toEditableOptions(
    sourceOptionsQuery.data?.options,
    sourceForm.source,
  );
  const majorOptions = toEditableOptions(
    majorOptionsQuery.data?.options,
    admissionForm.major,
  );
  const aspirationOptions = toEditableOptions(
    aspirationOptionsQuery.data?.options,
    admissionForm.aspiration,
  );
  const admissionYearOptions = toEditableOptions(
    admissionYearOptionsQuery.data?.options,
    admissionForm.admission_year,
  );
  const branchOptions = toEditableOptions(
    branchOptionsQuery.data?.options,
    admissionForm.branch,
  );

  const startEditing = (section: EditableLeadSection) => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    if (section === "contact") setContactForm(getContactForm(lead));
    if (section === "admission") setAdmissionForm(getAdmissionForm(lead));
    if (section === "source") setSourceForm(getSourceForm(lead));
    setEditingSection(section);
  };

  const cancelEditing = () => {
    if (updateMutation.isPending) return;
    updateMutation.reset();
    setEditingSection(null);
  };

  const save = (fields: LeadUpdateFields, message: string) => {
    if (Object.keys(fields).length === 0) {
      setEditingSection(null);
      return;
    }

    updateMutation.mutate(
      { leadId, fields },
      {
        onSuccess: () => {
          setEditingSection(null);
          toast.success(message);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Chưa thể lưu thay đổi.",
          );
        },
      },
    );
  };

  const saveContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactForm.student_name.trim()) {
      toast.error("Họ và tên không được để trống.");
      return;
    }

    const initial = getContactForm(lead);
    const fields: LeadUpdateFields = {};
    if (contactForm.student_name !== initial.student_name) {
      fields.student_name = nullable(contactForm.student_name);
    }
    if (contactForm.phone !== initial.phone) {
      fields.phone = nullable(contactForm.phone);
    }
    if (contactForm.email !== initial.email) {
      fields.email = nullable(contactForm.email);
    }
    if (contactForm.other_email !== initial.other_email) {
      fields.other_email = nullable(contactForm.other_email);
    }
    if (contactForm.province !== initial.province) {
      fields.province = nullable(contactForm.province);
    }
    if (contactForm.ward !== initial.ward) {
      fields.ward = nullable(contactForm.ward);
    }
    if (contactForm.high_school !== initial.high_school) {
      fields.high_school = nullable(contactForm.high_school);
    }
    save(fields, "Đã cập nhật thông tin liên hệ Lead.");
  };

  const saveAdmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getAdmissionForm(lead);
    const fields: LeadUpdateFields = {};
    if (admissionForm.major !== initial.major) {
      fields.major = nullable(admissionForm.major);
    }
    if (admissionForm.aspiration !== initial.aspiration) {
      fields.aspiration = nullable(admissionForm.aspiration);
    }
    if (admissionForm.admission_year !== initial.admission_year) {
      fields.admission_year = nullable(admissionForm.admission_year);
    }
    if (admissionForm.branch !== initial.branch) {
      fields.branch = nullable(admissionForm.branch);
    }
    if (admissionForm.conversion_potential !== initial.conversion_potential) {
      fields.conversion_potential = nullable(
        admissionForm.conversion_potential,
      );
    }
    save(fields, "Đã cập nhật thông tin tuyển sinh Lead.");
  };

  const saveSource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initial = getSourceForm(lead);
    const fields: LeadUpdateFields = {};
    if (sourceForm.source !== initial.source) {
      fields.source = nullable(sourceForm.source);
    }
    if (sourceForm.advertising_channel !== initial.advertising_channel) {
      fields.advertising_channel = nullable(sourceForm.advertising_channel);
    }
    if (sourceForm.segments !== initial.segments) {
      fields.segments = serializeSegments(sourceForm.segments);
    }
    if (sourceForm.notes !== initial.notes) {
      fields.notes = nullable(sourceForm.notes);
    }
    save(fields, "Đã cập nhật nguồn và phân loại Lead.");
  };

  const contactEditing = editingSection === "contact";
  const admissionEditing = editingSection === "admission";
  const sourceEditing = editingSection === "source";

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <LeadDetailSection
        canEdit={canEdit}
        editLabel="Chỉnh sửa thông tin liên hệ Lead"
        icon={<User2 size={18} />}
        isEditing={contactEditing}
        isSaving={updateMutation.isPending}
        onCancel={cancelEditing}
        onEdit={() => startEditing("contact")}
        onSave={saveContact}
        title="Thông tin liên hệ"
        description="Thông tin cá nhân và liên lạc của Lead"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableDetailField
            isEditing={contactEditing}
            label="Họ và tên"
            onChange={(value) =>
              setContactForm((form) => ({ ...form, student_name: value }))
            }
            value={contactEditing ? contactForm.student_name : lead.name}
          />
          <EditableDetailField
            icon={<Phone size={14} className="text-icon-tertiary" />}
            isEditing={contactEditing}
            label="Di động"
            onChange={(value) =>
              setContactForm((form) => ({ ...form, phone: value }))
            }
            type="tel"
            value={contactEditing ? contactForm.phone : lead.phone}
          />
          <EditableDetailField
            icon={<Envelope1 size={14} className="text-icon-tertiary" />}
            isEditing={contactEditing}
            label="Email"
            onChange={(value) =>
              setContactForm((form) => ({ ...form, email: value }))
            }
            type="email"
            value={contactEditing ? contactForm.email : lead.email}
          />
          <EditableDetailField
            isEditing={contactEditing}
            label="Email khác"
            onChange={(value) =>
              setContactForm((form) => ({ ...form, other_email: value }))
            }
            type="email"
            value={
              contactEditing ? contactForm.other_email : lead.secondaryEmail
            }
          />
          <EditableDetailField
            isEditing={contactEditing}
            isDisabled={
              provinceOptionsQuery.isLoading || provinceOptions.length === 0
            }
            dropdownClassName="!max-h-64"
            optionsPageSize={10}
            searchable
            searchPlaceholder="Tìm tỉnh / thành phố..."
            label="Tỉnh / Thành phố"
            onChange={(value) =>
              setContactForm((form) => ({
                ...form,
                province: value,
                ward: "",
                high_school: "",
              }))
            }
            options={provinceOptions}
            value={contactEditing ? contactForm.province : lead.province}
          />
          <EditableDetailField
            isEditing={contactEditing}
            isDisabled={
              wardOptionsQuery.isLoading || wardOptions.length === 0
            }
            label="Xã / phường"
            onChange={(value) =>
              setContactForm((form) => ({ ...form, ward: value }))
            }
            options={wardOptions}
            value={contactEditing ? contactForm.ward : lead.ward}
          />
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-xs leading-5 text-text-tertiary">
              Trường THPT
            </dt>
            {contactEditing ? (
              <SchoolCombobox
                ariaLabel="Chọn trường THPT của Lead"
                isDisabled={!contactForm.province}
                province={contactForm.province}
                ward={contactForm.ward}
                requiresWard={false}
                value={contactForm.high_school}
                onChange={(value) =>
                  setContactForm((form) => ({ ...form, high_school: value }))
                }
              />
            ) : (
              <dd className="mt-1 flex items-start gap-1.5 text-sm font-medium leading-6 text-text-primary [overflow-wrap:anywhere]">
                <MapMarker5
                  size={15}
                  className="mt-0.5 shrink-0 text-icon-tertiary"
                  aria-hidden="true"
                />
                {lead.school || "Chưa cập nhật"}
              </dd>
            )}
          </div>
        </dl>
      </LeadDetailSection>

      <LeadDetailSection
        canEdit={canEdit}
        editLabel="Chỉnh sửa thông tin tuyển sinh Lead"
        icon={<Book4 size={18} />}
        isEditing={admissionEditing}
        isSaving={updateMutation.isPending}
        onCancel={cancelEditing}
        onEdit={() => startEditing("admission")}
        onSave={saveAdmission}
        title="Thông tin tuyển sinh"
        description="Nhu cầu học tập và tiến độ tư vấn"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <EditableDetailField
            isEditing={admissionEditing}
            isDisabled={
              majorOptionsQuery.isLoading || majorOptions.length === 0
            }
            label="Ngành quan tâm"
            onChange={(value) =>
              setAdmissionForm((form) => ({ ...form, major: value }))
            }
            options={majorOptions}
            value={
              admissionEditing ? admissionForm.major : lead.interestedMajor
            }
          />
          <EditableDetailField
            isEditing={admissionEditing}
            isDisabled={
              aspirationOptionsQuery.isLoading || aspirationOptions.length === 0
            }
            label="Nguyện vọng vào FPT"
            onChange={(value) =>
              setAdmissionForm((form) => ({ ...form, aspiration: value }))
            }
            options={aspirationOptions}
            value={
              admissionEditing ? admissionForm.aspiration : lead.fptAspiration
            }
          />
          <EditableDetailField
            isEditing={admissionEditing}
            isDisabled={
              admissionYearOptionsQuery.isLoading ||
              admissionYearOptions.length === 0
            }
            label="Năm tuyển sinh"
            onChange={(value) =>
              setAdmissionForm((form) => ({ ...form, admission_year: value }))
            }
            options={admissionYearOptions}
            value={
              admissionEditing
                ? admissionForm.admission_year
                : lead.enrollmentYear
                  ? String(lead.enrollmentYear)
                  : ""
            }
          />
          <EditableDetailField
            isEditing={admissionEditing}
            isDisabled={
              branchOptionsQuery.isLoading || branchOptions.length === 0
            }
            label="Chi nhánh"
            onChange={(value) =>
              setAdmissionForm((form) => ({ ...form, branch: value }))
            }
            options={branchOptions}
            value={admissionEditing ? admissionForm.branch : lead.branch}
          />
          <EditableDetailField
            isEditing={admissionEditing}
            label="Khả năng chuyển đổi"
            onChange={(value) =>
              setAdmissionForm((form) => ({
                ...form,
                conversion_potential: value,
              }))
            }
            options={conversionPotentialOptions}
            value={
              admissionEditing
                ? admissionForm.conversion_potential
                : (lead.conversionPotential ?? "")
            }
          />
          <EditableDetailField
            className="sm:col-span-2"
            label="Người phụ trách"
            readOnly
            value={lead.owner}
          />
        </dl>
      </LeadDetailSection>

      <LeadDetailSection
        canEdit={canEdit}
        className="lg:col-span-2"
        editLabel="Chỉnh sửa nguồn và phân loại Lead"
        icon={<Layers2 size={18} />}
        isEditing={sourceEditing}
        isSaving={updateMutation.isPending}
        onCancel={cancelEditing}
        onEdit={() => startEditing("source")}
        onSave={saveSource}
        title="Nguồn & phân loại"
        description="Nguồn tiếp cận, nhóm Lead và các hoạt động đã tham gia"
      >
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          <EditableDetailField
            isEditing={sourceEditing}
            isDisabled={
              sourceOptionsQuery.isLoading || sourceOptions.length === 0
            }
            label="Nguồn Lead"
            onChange={(value) =>
              setSourceForm((form) => ({ ...form, source: value }))
            }
            options={sourceOptions}
            value={sourceEditing ? sourceForm.source : lead.source}
          />
          <EditableDetailField
            isEditing={sourceEditing}
            label="Kênh quảng cáo"
            onChange={(value) =>
              setSourceForm((form) => ({
                ...form,
                advertising_channel: value,
              }))
            }
            value={
              sourceEditing ? sourceForm.advertising_channel : lead.adChannel
            }
          />
          <EditableDetailField
            isEditing={sourceEditing}
            label="Phân khúc"
            onChange={(value) =>
              setSourceForm((form) => ({ ...form, segments: value }))
            }
            placeholder="Ví dụ: Quan tâm học bổng, Ưu tiên cao"
            value={
              sourceEditing ? sourceForm.segments : lead.segments.join(", ")
            }
          />
          <LeadDetailTags
            label="Sự kiện tham gia"
            values={lead.eventsParticipated}
            className="xl:row-span-2"
          />
          <LeadDetailTags label="Thẻ gắn" values={lead.tags} />
          <div className="min-w-0 sm:col-span-2 xl:col-span-3">
            <dt className="text-xs leading-5 text-text-tertiary">Mô tả</dt>
            {sourceEditing ? (
              <TextArea
                aria-label="Mô tả Lead"
                className="mt-1.5 min-h-24 w-full text-sm"
                value={sourceForm.notes}
                onChange={(event) =>
                  setSourceForm((form) => ({
                    ...form,
                    notes: event.target.value,
                  }))
                }
              />
            ) : (
              <dd className="mt-1 text-sm font-medium leading-6 text-text-primary [overflow-wrap:anywhere]">
                {lead.description || (
                  <span className="font-normal text-text-tertiary">
                    Chưa cập nhật
                  </span>
                )}
              </dd>
            )}
          </div>
        </dl>
      </LeadDetailSection>
    </div>
  );
}

function getContactForm(lead: LeadDetail): ContactForm {
  return {
    student_name: lead.name || "",
    phone: lead.phone || "",
    email: lead.email || "",
    other_email: lead.secondaryEmail || "",
    province: lead.province || "",
    ward: lead.ward || "",
    high_school: lead.school || "",
  };
}

function getAdmissionForm(lead: LeadDetail): AdmissionForm {
  return {
    major: lead.interestedMajor || "",
    aspiration: lead.fptAspiration || "",
    admission_year: lead.enrollmentYear ? String(lead.enrollmentYear) : "",
    branch: lead.branch || "",
    conversion_potential: toConversionPotentialCode(lead.conversionPotential),
  };
}

function getSourceForm(lead: LeadDetail): SourceForm {
  return {
    source: lead.source || "",
    advertising_channel: lead.adChannel || "",
    segments: lead.segments.join(", "),
    notes: lead.description || "",
  };
}

function toConversionPotentialCode(
  value: LeadDetail["conversionPotential"],
): string {
  if (value === "Cao") return "High";
  if (value === "Trung bình") return "Medium";
  if (value === "Thấp") return "Low";
  if (value === "Chưa xác định") return "Unknown";
  return "";
}

function toEditableOptions(
  options: Array<{ value: string; label: string }> | undefined,
  currentValue: string,
): EditableDetailOption[] {
  const mapped =
    options?.map(({ value, label }) => ({ id: value, label })) ?? [];
  if (currentValue && !mapped.some((option) => option.id === currentValue)) {
    mapped.unshift({ id: currentValue, label: currentValue });
  }
  return [emptyOption, ...mapped];
}

function nullable(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function serializeSegments(value: string): string | null {
  const segments = value
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
  return segments.length ? JSON.stringify([...new Set(segments)]) : null;
}
