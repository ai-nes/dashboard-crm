import type { LeadAssignmentWorkflowValidationSettings } from "@/services/api/lead-sale";
import LeadAssignmentConfigSection from "./lead-assignment-config-section";

const fieldLabels: Record<string, string> = {
  student_name: "Họ và tên",
  first_name: "Họ và tên",
  name: "Họ và tên",
  phone: "Số điện thoại",
  mobile_no: "Số điện thoại",
  province: "Tỉnh/thành phố",
  high_school: "Trường THPT",
  major: "Ngành quan tâm",
  email: "Email",
};

export default function LeadAssignmentConfigRules({
  validation,
}: {
  validation: LeadAssignmentWorkflowValidationSettings;
}) {
  const rules = [
    {
      label: "Thông tin bắt buộc",
      value:
        validation.requiredFields
          .map((field) => fieldLabels[field] ?? field)
          .join(" · ") || "Theo quy định của hệ thống",
    },
    {
      label: "Người nhận Lead",
      value: "Sale / CTV Sale trong cùng cơ sở.",
    },
    {
      label: "Lead đã có người phụ trách",
      value: "Giữ nguyên người phụ trách.",
    },
    {
      label: "Chưa có người nhận",
      value: "Giữ trong “Cần kiểm tra”, không tự đổi cách chia.",
    },
    {
      label: "Hồ sơ học sinh",
      value: "Không tự tạo Student.",
    },
    {
      label: "Lịch sử thay đổi",
      value: "Lưu người nhận, team và cấu hình.",
    },
  ];
  return (
    <LeadAssignmentConfigSection
      id="rules"
      title="Quy tắc hệ thống"
      className="border-0 bg-background-gray-secondary/60"
      icon={
        <Shield1Check
          size={18}
          className="shrink-0 text-text-secondary"
          aria-hidden="true"
        />
      }
    >
      <dl className="divide-y divide-card-border">
        {rules.map((rule) => (
          <div
            key={rule.label}
            className="space-y-1.5 py-3.5 first:pt-0 last:pb-0"
          >
            <dt className="text-xs font-medium text-text-secondary">
              {rule.label}
            </dt>
            <dd className="text-sm leading-6 text-pretty text-text-primary">
              {rule.value}
            </dd>
          </div>
        ))}
      </dl>
    </LeadAssignmentConfigSection>
  );
}
import { Shield1Check } from "@tailgrids/icons";
