"use client";

import { useState } from "react";

import { Radio, RadioGroup } from "react-aria-components";
import { toast } from "sonner";
import { FileText } from "@tailgrids/icons";

import { DatePickerField } from "@/components/common/date-picker-field";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";

import StudentCardHeader from "./student-card-header";
import type { Student360SectionProps } from "./types";

interface AdmissionDocumentItem {
  id: string;
  label: string;
  status: boolean;
}

interface AdmissionDocumentField {
  label: string;
  type?: "date" | "number" | "text";
  value?: string;
}

const admissionDocumentChecklist: AdmissionDocumentItem[] = [
  { id: "enrollment-form", label: "Phiếu nhập học", status: true },
  { id: "photo", label: "01 Ảnh 3×4 hoặc bản scan ảnh 3×4", status: false },
  {
    id: "high-school-transcript",
    label: "01 Bản sao chứng thực Học bạ THPT (đủ 3 năm)",
    status: false,
  },
  {
    id: "birth-certificate",
    label: "01 Bản sao chứng thực Giấy khai sinh",
    status: true,
  },
  {
    id: "high-school-diploma",
    label: "01 Bản sao chứng thực Bằng tốt nghiệp THPT",
    status: false,
  },
  {
    id: "graduation-exam-result",
    label:
      "01 Bản sao chứng thực Giấy chứng nhận kết quả kỳ thi tốt nghiệp THPT đối với thí sinh tốt nghiệp năm 2026 (Sinh viên cần nộp bổ sung 01 Bản sao chứng thực Bằng tốt nghiệp THPT trong vòng 1 năm kể từ ngày bắt đầu học)",
    status: false,
  },
  {
    id: "identity-card",
    label: "01 Bản sao chứng thực Căn cước/CCCD",
    status: true,
  },
  { id: "passport", label: "01 Bản sao chứng thực Hộ chiếu", status: false },
  {
    id: "previous-exam-result",
    label:
      "Bản sao chứng thực Giấy chứng nhận kết quả thi THPT hoặc Bản sao chứng thực Giấy chứng nhận kết quả kỳ thi tốt nghiệp THPT; Bản sao Giấy chứng nhận tốt nghiệp THPT tạm thời (trong đó có điểm thi); Xác nhận điểm của Sở Giáo dục và Đào tạo hoặc của trường THPT (Giấy tờ khác này chỉ áp dụng đối với thí sinh nhập học dùng kết quả thi tốt nghiệp THPT các năm trước năm 2026)",
    status: false,
  },
  {
    id: "language-certificate",
    label:
      "01 Bản sao chứng thực Chứng chỉ ngoại ngữ (áp dụng đối với thí sinh dùng chứng chỉ ngoại ngữ để quy đổi thành điểm môn ngoại ngữ hoặc để tính điểm khuyến khích)",
    status: false,
  },
  {
    id: "generation-one-form",
    label:
      "Đơn đăng ký ưu tiên xét tuyển thế hệ 1 (Dành cho đối tượng Thế hệ 1)",
    status: false,
  },
  {
    id: "vocational-diploma",
    label:
      "01 Bản sao chứng thực Bằng tốt nghiệp Chương trình APTECH HDSE/APTECH ADSE/ARENA ADIM/SKILLKING/JETKING/BTEC HND/Melbourne Polytechnic/FUNiX Software Engineering",
    status: false,
  },
  {
    id: "polytechnic-diploma",
    label: "01 Bản sao Bằng tốt nghiệp Cao đẳng FPT Polytechnic",
    status: true,
  },
  {
    id: "study-now-pay-later-form",
    label:
      "Đơn đề nghị tham gia chương trình Học trước – Trả sau do phụ huynh hoặc người giám hộ (sau đây gọi chung là phụ huynh) làm, được Trường nơi thí sinh đang học xác nhận (chỉ áp dụng đối với diện Học trước – Trả sau)",
    status: false,
  },
  {
    id: "achievement-proof",
    label: "01 Bản sao chứng thực giấy tờ chứng minh thành tích khác",
    status: true,
  },
  {
    id: "study-now-pay-later-agreement",
    label:
      "01 Thoả thuận Học trước – Trả sau (chỉ áp dụng đối với diện Học trước – Trả sau)",
    status: false,
  },
  {
    id: "family-relationship-proof",
    label:
      "01 Giấy tờ xác nhận quan hệ của thí sinh với phụ huynh (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE/con ruột CBNV FPT)",
    status: false,
  },
  {
    id: "financial-hardship-proof",
    label:
      "01 Bản gốc minh chứng về hoàn cảnh gia đình khó khăn như xác nhận hộ nghèo của địa phương/xác nhận thu nhập phụ huynh của đơn vị nơi đang công tác/Quyết toán thuế TNCN của phụ huynh năm gần nhất (nếu có, chỉ áp dụng đối với diện Học trước – Trả sau)",
    status: false,
  },
  {
    id: "sibling-birth-certificate",
    label:
      "01 Bản sao chứng thực giấy khai sinh của anh/chị/em ruột thí sinh (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE / Ưu đãi học phí cho thí sinh là có người thân là anh/chị/em ruột làm việc tại FE)",
    status: false,
  },
  {
    id: "parent-identity-card",
    label:
      "01 Bản sao chứng thực Căn cước/CCCD của phụ huynh (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE; người thân làm tại FE; con ruột CBNV FPT)",
    status: false,
  },
  {
    id: "family-employment-proof",
    label:
      "Bản gốc Giấy xác nhận anh/chị/em ruột đang theo học FE (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE) hoặc Giấy xác nhận đang làm việc tại FE/FPT (áp dụng đối với diện Ưu đãi học phí cho thí sinh là CBNV hoặc có người thân làm việc tại FE/con ruột CBNV FPT)",
    status: false,
  },
  {
    id: "scholarship-achievement-proof",
    label:
      "01 Bản sao chứng thực giấy tờ xác nhận thành tích (chỉ áp dụng đối với diện học bổng)",
    status: false,
  },
  {
    id: "english-exemption-certificate",
    label:
      "01 Bản sao công chứng Chứng chỉ tiếng Anh còn thời hạn (nếu có) để xét miễn chương trình tiếng Anh dự bị theo quy định của Trường Đại học FPT",
    status: true,
  },
];

const admissionDocumentFields: AdmissionDocumentField[] = [
  { label: "Chứng chỉ Tiếng Anh", value: "Chứng chỉ khác" },
  { label: "Ngày cấp Chứng chỉ Tiếng Anh", type: "date" },
  { label: "Điểm chứng chỉ", type: "number" },
  { label: "Ngày hết hạn chứng chỉ", type: "date" },
];

const noAlternativeSelection = "__no_alternative_selection__";

const documentNameById: Record<string, string> = {
  "enrollment-form": "Phieu-nhap-hoc.pdf",
  photo: "Anh-3x4.jpg",
  "high-school-transcript": "Hoc-ba-THPT.pdf",
  "birth-certificate": "Giay-khai-sinh.pdf",
  "high-school-diploma": "Bang-tot-nghiep-THPT.pdf",
  "graduation-exam-result": "Giay-chung-nhan-ket-qua-thi.pdf",
  "identity-card": "Can-cuoc-CCCD.pdf",
  passport: "Ho-chieu.pdf",
  "previous-exam-result": "Ket-qua-thi-cac-nam-truoc.pdf",
  "language-certificate": "Chung-chi-ngoai-ngu.pdf",
  "generation-one-form": "Don-uu-tien-the-he-1.pdf",
  "vocational-diploma": "Bang-tot-nghiep-chuong-trinh-khac.pdf",
  "polytechnic-diploma": "Bang-tot-nghiep-FPT-Polytechnic.pdf",
  "study-now-pay-later-form": "Don-hoc-truoc-tra-sau.pdf",
  "achievement-proof": "Minh-chung-thanh-tich.pdf",
  "study-now-pay-later-agreement": "Thoa-thuan-hoc-truoc-tra-sau.pdf",
  "family-relationship-proof": "Giay-to-quan-he-voi-phu-huynh.pdf",
  "financial-hardship-proof": "Minh-chung-hoan-canh-gia-dinh.pdf",
  "sibling-birth-certificate": "Giay-khai-sinh-anh-chi-em.pdf",
  "parent-identity-card": "CCCD-cua-phu-huynh.pdf",
  "family-employment-proof": "Giay-xac-nhan-nguoi-than.pdf",
  "scholarship-achievement-proof": "Minh-chung-hoc-bong.pdf",
  "english-exemption-certificate": "Chung-chi-tieng-Anh.pdf",
};

function getAdmissionDocument(id: string) {
  const item = admissionDocumentChecklist.find(
    (document) => document.id === id,
  );
  if (!item) throw new Error(`Không tìm thấy tài liệu ${id}`);
  return item;
}

const regularLeftItems = [
  getAdmissionDocument("enrollment-form"),
  getAdmissionDocument("high-school-transcript"),
];

const regularRightItems = [
  getAdmissionDocument("photo"),
  getAdmissionDocument("birth-certificate"),
];

const graduationAlternativeItems = [
  getAdmissionDocument("high-school-diploma"),
  getAdmissionDocument("graduation-exam-result"),
];

const identityAlternativeItems = [
  getAdmissionDocument("identity-card"),
  getAdmissionDocument("passport"),
];

const supplementaryLeftItems = [
  getAdmissionDocument("previous-exam-result"),
  getAdmissionDocument("generation-one-form"),
  getAdmissionDocument("vocational-diploma"),
  getAdmissionDocument("polytechnic-diploma"),
  getAdmissionDocument("language-certificate"),
  getAdmissionDocument("english-exemption-certificate"),
  getAdmissionDocument("achievement-proof"),
];

const supplementaryRightItems = [
  getAdmissionDocument("study-now-pay-later-form"),
  getAdmissionDocument("study-now-pay-later-agreement"),
  getAdmissionDocument("financial-hardship-proof"),
  getAdmissionDocument("family-relationship-proof"),
  getAdmissionDocument("sibling-birth-certificate"),
  getAdmissionDocument("parent-identity-card"),
  getAdmissionDocument("family-employment-proof"),
  getAdmissionDocument("scholarship-achievement-proof"),
];

export default function StudentAdmissionDocumentsMockup({
  data,
}: Student360SectionProps) {
  const uploadedDocuments = (data.documents ?? [])
    .filter((document) => document.tone === "success")
    .map((document) => document.name);
  const uploadedDocumentNamesById = Object.fromEntries(
    uploadedDocuments.flatMap((name, index) => {
      const id = admissionDocumentChecklist[index]?.id;
      return id ? [[id, name]] : [];
    }),
  );
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, boolean>
  >(
    () =>
      Object.fromEntries(
        admissionDocumentChecklist.map((item) => [item.id, item.status]),
      ) as Record<string, boolean>,
  );
  const [alternativeSelections, setAlternativeSelections] = useState<
    Record<string, string>
  >({
    graduation: noAlternativeSelection,
    identity: "identity-card",
  });
  const [alternativeStatuses, setAlternativeStatuses] = useState<
    Record<string, boolean>
  >({
    graduation: false,
    identity: true,
  });
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      admissionDocumentFields.map((field) => [field.label, field.value ?? ""]),
    ),
  );

  const updateDocumentStatus = (id: string, value: boolean) => {
    setDocumentStatuses((current) => ({ ...current, [id]: value }));
  };

  const updateAlternativeSelection = (groupId: string, value: string) => {
    setAlternativeSelections((current) => ({ ...current, [groupId]: value }));
    setAlternativeStatuses((current) => ({ ...current, [groupId]: true }));
  };

  const updateAlternativeStatus = (groupId: string, value: boolean) => {
    setAlternativeStatuses((current) => ({ ...current, [groupId]: value }));
    if (!value) {
      setAlternativeSelections((current) => ({
        ...current,
        [groupId]: noAlternativeSelection,
      }));
    }
  };

  const updateFieldValue = (label: string, value: string) => {
    setFieldValues((current) => ({ ...current, [label]: value }));
  };

  const openDocument = (documentName: string) => {
    toast.info(`Đang mở tài liệu: ${documentName}`);
  };

  return (
    <Card className="min-w-0 w-full max-w-full p-5">
      <StudentCardHeader
        description="Theo dõi giấy tờ đã nộp và tiến độ hoàn tất hồ sơ."
        icon={<FileText size={18} aria-hidden="true" />}
        title="Thủ tục và Hồ sơ Nhập học"
      />

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
                  items={regularLeftItems}
                  documentNames={uploadedDocumentNamesById}
                  onDocumentOpen={openDocument}
                  onStatusChange={updateDocumentStatus}
                  statuses={documentStatuses}
                />
                <AdmissionAlternativeGroup
                  groupId="graduation"
                  items={graduationAlternativeItems}
                  label="Một trong các giấy tờ xác nhận tốt nghiệp THPT sau:"
                  documentNames={uploadedDocumentNamesById}
                  onDocumentOpen={openDocument}
                  onStatusChange={updateAlternativeStatus}
                  onSelectionChange={updateAlternativeSelection}
                  selectedId={alternativeSelections.graduation}
                  isSelected={alternativeStatuses.graduation}
                />
              </td>
              <td className="w-1/2 align-top border border-card-border p-4">
                <AdmissionChecklistItemList
                  items={regularRightItems}
                  documentNames={uploadedDocumentNamesById}
                  onDocumentOpen={openDocument}
                  onStatusChange={updateDocumentStatus}
                  statuses={documentStatuses}
                />
                <AdmissionAlternativeGroup
                  groupId="identity"
                  items={identityAlternativeItems}
                  label="Một trong các giấy tờ tùy thân sau:"
                  documentNames={uploadedDocumentNamesById}
                  onDocumentOpen={openDocument}
                  onStatusChange={updateAlternativeStatus}
                  onSelectionChange={updateAlternativeSelection}
                  selectedId={alternativeSelections.identity}
                  isSelected={alternativeStatuses.identity}
                />
              </td>
            </tr>
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
                  items={supplementaryLeftItems}
                  documentNames={uploadedDocumentNamesById}
                  onDocumentOpen={openDocument}
                  onStatusChange={updateDocumentStatus}
                  statuses={documentStatuses}
                />
              </td>
              <td className="align-top border border-card-border p-4">
                <AdmissionChecklistItemList
                  items={supplementaryRightItems}
                  documentNames={uploadedDocumentNamesById}
                  onDocumentOpen={openDocument}
                  onStatusChange={updateDocumentStatus}
                  statuses={documentStatuses}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-x-8 md:grid-cols-2">
        {admissionDocumentFields.map((field) => (
          <AdmissionDocumentField
            key={field.label}
            field={field}
            value={fieldValues[field.label] ?? ""}
            onChange={updateFieldValue}
          />
        ))}
      </div>
    </Card>
  );
}

function AdmissionChecklistItemList({
  items,
  documentNames,
  statuses,
  onStatusChange,
  onDocumentOpen,
}: {
  items: AdmissionDocumentItem[];
  documentNames: Record<string, string>;
  statuses: Record<string, boolean>;
  onStatusChange: (id: string, value: boolean) => void;
  onDocumentOpen: (documentName: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <AdmissionChecklistItem
          key={item.id}
          documentName={documentNames[item.id] ?? documentNameById[item.id]}
          isSelected={statuses[item.id] ?? false}
          item={item}
          onDocumentOpen={onDocumentOpen}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

function AdmissionChecklistItem({
  item,
  documentName,
  isSelected,
  onStatusChange,
  onDocumentOpen,
}: {
  item: AdmissionDocumentItem;
  documentName?: string;
  isSelected: boolean;
  onStatusChange: (id: string, value: boolean) => void;
  onDocumentOpen: (documentName: string) => void;
}) {
  return (
    <div>
      <Checkbox
        aria-label={item.label}
        className="items-start [&>div]:!ring-0 [&>div]:mt-1 [&>div]:size-4 [&>div]:min-w-4 [&>div]:shrink-0 [&>div]:border-text-secondary"
        isSelected={isSelected}
        onChange={(nextValue) => onStatusChange(item.id, nextValue)}
        size="sm"
      >
        <span className="text-sm leading-6 font-medium text-text-primary">
          {item.label}
        </span>
      </Checkbox>
      <div className="ml-7">
        <AdmissionDocumentLink
          documentName={documentName}
          onDocumentOpen={onDocumentOpen}
        />
      </div>
    </div>
  );
}

function AdmissionAlternativeGroup({
  groupId,
  label,
  items,
  selectedId,
  documentNames,
  isSelected,
  onStatusChange,
  onSelectionChange,
  onDocumentOpen,
}: {
  groupId: string;
  label: string;
  items: AdmissionDocumentItem[];
  selectedId: string;
  documentNames: Record<string, string>;
  isSelected: boolean;
  onStatusChange: (groupId: string, value: boolean) => void;
  onSelectionChange: (groupId: string, value: string) => void;
  onDocumentOpen: (documentName: string) => void;
}) {
  return (
    <fieldset className="mt-4">
      <Checkbox
        aria-label={label}
        className="items-start [&>div]:!ring-0 [&>div]:mt-1 [&>div]:size-4 [&>div]:min-w-4 [&>div]:shrink-0 [&>div]:border-text-secondary"
        isSelected={isSelected}
        onChange={(nextValue) => onStatusChange(groupId, nextValue)}
        size="sm"
      >
        <span className="text-sm leading-6 font-medium text-text-primary">
          {label}
        </span>
      </Checkbox>
      <RadioGroup
        aria-label={label}
        className="mt-3 ml-6 space-y-3"
        onChange={(nextValue) => onSelectionChange(groupId, nextValue)}
        value={selectedId}
      >
        {items.map((item) => (
          <div key={item.id}>
            <AdmissionRadio value={item.id}>{item.label}</AdmissionRadio>
            <div className="ml-7">
              <AdmissionDocumentLink
                documentName={
                  documentNames[item.id] ?? documentNameById[item.id]
                }
                onDocumentOpen={onDocumentOpen}
              />
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
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
    <div className="min-w-0 border-b border-card-border py-4">
      <p className="text-sm leading-6 font-medium text-text-primary">
        {field.label}
      </p>
      {field.type === "date" ? (
        <div className="mt-3">
          <DatePickerField
            ariaLabel={field.label}
            onChange={(nextValue) => onChange(field.label, nextValue)}
            value={value}
          />
        </div>
      ) : (
        <Input
          aria-label={field.label}
          className="mt-3 h-10 w-full px-3 text-sm"
          inputMode={field.type === "number" ? "decimal" : undefined}
          min={field.type === "number" ? 0 : undefined}
          onChange={(event) => onChange(field.label, event.target.value)}
          placeholder="Nhấn để nhập thông tin"
          type={field.type ?? "text"}
          value={value}
        />
      )}
    </div>
  );
}

function AdmissionDocumentLink({
  documentName,
  onDocumentOpen,
}: {
  documentName?: string;
  onDocumentOpen: (documentName: string) => void;
}) {
  return documentName ? (
    <Button
      appearance="ghost"
      className="mt-2 h-auto justify-start gap-1.5 px-0 py-0.5 text-xs text-primary-500 underline-offset-2 hover:bg-transparent hover:underline"
      onPress={() => onDocumentOpen(documentName)}
      size="xs"
    >
      <FileText size={14} aria-hidden="true" />
      {documentName}
    </Button>
  ) : (
    <p className="mt-2 text-xs text-text-tertiary">Chưa có tài liệu</p>
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
      className="group flex cursor-pointer items-start gap-2 text-sm text-text-secondary outline-none data-[focused=true]:text-text-primary"
      value={value}
    >
      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-text-secondary bg-card-background group-data-[selected=true]:border-primary-500 group-data-[selected=true]:bg-primary-500 group-data-[focused=true]:!ring-0">
        <span className="size-1.5 rounded-full bg-white-100 opacity-0 group-data-[selected=true]:opacity-100" />
      </span>
      {children}
    </Radio>
  );
}
