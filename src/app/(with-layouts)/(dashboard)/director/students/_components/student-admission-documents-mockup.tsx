"use client";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

interface AdmissionDocumentItem {
  label: string;
  status: boolean;
}

interface AdmissionDocumentField {
  label: string;
  value?: string;
}

const admissionDocumentChecklist: AdmissionDocumentItem[] = [
  { label: "Phiếu nhập học", status: true },
  { label: "01 Ảnh 3×4 hoặc bản scan ảnh 3×4", status: false },
  {
    label: "01 Bản sao chứng thực Học bạ THPT (đủ 3 năm)",
    status: false,
  },
  { label: "01 Bản sao chứng thực Giấy khai sinh", status: true },
  { label: "01 Bản sao chứng thực Bằng tốt nghiệp THPT", status: false },
  {
    label:
      "01 Bản sao chứng thực Giấy chứng nhận kết quả kỳ thi tốt nghiệp THPT đối với thí sinh tốt nghiệp năm 2026 (Sinh viên cần nộp bổ sung 01 Bản sao chứng thực Bằng tốt nghiệp THPT trong vòng 1 năm kể từ ngày bắt đầu học)",
    status: false,
  },
  { label: "01 Bản sao chứng thực Căn cước/CCCD", status: true },
  { label: "01 Bản sao chứng thực Hộ chiếu", status: false },
  {
    label:
      "Bản sao chứng thực Giấy chứng nhận kết quả thi THPT hoặc Bản sao chứng thực Giấy chứng nhận kết quả kỳ thi tốt nghiệp THPT; Bản sao Giấy chứng nhận tốt nghiệp THPT tạm thời (trong đó có điểm thi); Xác nhận điểm của Sở Giáo dục và Đào tạo hoặc của trường THPT (Giấy tờ khác này chỉ áp dụng đối với thí sinh nhập học dùng kết quả thi tốt nghiệp THPT các năm trước năm 2026)",
    status: false,
  },
  {
    label:
      "01 Bản sao chứng thực Chứng chỉ ngoại ngữ (áp dụng đối với thí sinh dùng chứng chỉ ngoại ngữ để quy đổi thành điểm môn ngoại ngữ hoặc để tính điểm khuyến khích)",
    status: false,
  },
  {
    label:
      "Đơn đăng ký ưu tiên xét tuyển thế hệ 1 (Dành cho đối tượng Thế hệ 1)",
    status: false,
  },
  {
    label:
      "01 Bản sao chứng thực Bằng tốt nghiệp Chương trình APTECH HDSE/APTECH ADSE/ARENA ADIM/SKILLKING/JETKING/BTEC HND/Melbourne Polytechnic/FUNiX Software Engineering",
    status: false,
  },
  {
    label: "01 Bản sao Bằng tốt nghiệp Cao đẳng FPT Polytechnic",
    status: true,
  },
  {
    label:
      "Đơn đề nghị tham gia chương trình Học trước – Trả sau do phụ huynh hoặc người giám hộ (sau đây gọi chung là phụ huynh) làm, được Trường nơi thí sinh đang học xác nhận (chỉ áp dụng đối với diện Học trước – Trả sau)",
    status: false,
  },
  {
    label: "01 Bản sao chứng thực giấy tờ chứng minh thành tích khác",
    status: true,
  },
  {
    label:
      "01 Thoả thuận Học trước – Trả sau (chỉ áp dụng đối với diện Học trước – Trả sau)",
    status: false,
  },
  {
    label:
      "01 Giấy tờ xác nhận quan hệ của thí sinh với phụ huynh (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE/con ruột CBNV FPT)",
    status: false,
  },
  {
    label:
      "01 Bản gốc minh chứng về hoàn cảnh gia đình khó khăn như xác nhận hộ nghèo của địa phương/xác nhận thu nhập phụ huynh của đơn vị nơi đang công tác/Quyết toán thuế TNCN của phụ huynh năm gần nhất (nếu có, chỉ áp dụng đối với diện Học trước – Trả sau)",
    status: false,
  },
  {
    label:
      "01 Bản sao chứng thực giấy khai sinh của anh/chị/em ruột thí sinh (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE / Ưu đãi học phí cho thí sinh là có người thân là anh/chị/em ruột làm việc tại FE)",
    status: false,
  },
  {
    label:
      "01 Bản sao chứng thực Căn cước/CCCD của phụ huynh (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE; người thân làm tại FE; con ruột CBNV FPT)",
    status: false,
  },
  {
    label:
      "Bản gốc Giấy xác nhận anh/chị/em ruột đang theo học FE (áp dụng đối với diện Ưu đãi học phí cho thí sinh có anh/chị/em ruột theo học FE) hoặc Giấy xác nhận đang làm việc tại FE/FPT (áp dụng đối với diện Ưu đãi học phí cho thí sinh là CBNV hoặc có người thân làm việc tại FE/con ruột CBNV FPT)",
    status: false,
  },
  {
    label:
      "01 Bản sao chứng thực giấy tờ xác nhận thành tích (chỉ áp dụng đối với diện học bổng)",
    status: false,
  },
  {
    label:
      "01 Bản sao công chứng Chứng chỉ tiếng Anh còn thời hạn (nếu có) để xét miễn chương trình tiếng Anh dự bị theo quy định của Trường Đại học FPT",
    status: true,
  },
];

const admissionDocumentFields: AdmissionDocumentField[] = [
  { label: "Chứng chỉ Tiếng Anh", value: "Chứng chỉ khác" },
  { label: "Ngày cấp Chứng chỉ Tiếng Anh" },
  { label: "Điểm chứng chỉ", value: "FPT Poly" },
  { label: "Ngày hết hạn chứng chỉ" },
];

export default function StudentAdmissionDocumentsMockup() {
  return (
    <Card className="p-5">
      <CardHeader className="mb-6">
        <CardTitle>Thủ tục và Hồ sơ Nhập học</CardTitle>
      </CardHeader>

      <div className="space-y-8">
        <section>
          <h3 className="mb-4 text-sm font-semibold text-text-secondary">
            Hồ sơ cần nộp
          </h3>
          <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
            {admissionDocumentChecklist.map((item) => (
              <div
                key={item.label}
                className="flex min-w-0 items-start justify-between gap-4 px-1"
              >
                <p className="min-w-0 flex-1 text-sm leading-6 text-text-primary">
                  {item.label}
                </p>
                <Checkbox
                  aria-label={`${item.label}: ${item.status ? "Có" : "Không"}`}
                  className="shrink-0 pt-0.5"
                  isReadOnly
                  isSelected={item.status}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold text-text-secondary">
            Thông tin chứng chỉ
          </h3>
          <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            {admissionDocumentFields.map((field) => (
              <div key={field.label} className="min-w-0">
                <dt className="text-xs text-text-tertiary">{field.label}</dt>
                <dd className="mt-1 break-words text-sm font-medium text-text-primary">
                  {field.value || "-"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </Card>
  );
}
