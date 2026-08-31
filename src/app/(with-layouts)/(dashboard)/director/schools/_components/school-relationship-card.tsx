import { CheckCircle1, User2 } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolRelationshipCardProps {
  data: SchoolIntelligenceData;
}

const relationshipSteps = ["Chưa tiếp xúc", "Đã tiếp xúc", "Có đầu mối", "Hợp tác thường xuyên", "Đối tác chiến lược"];

export default function SchoolRelationshipCard({ data }: SchoolRelationshipCardProps) {
  const { relationship, contacts } = data;
  const currentIndex = relationshipSteps.indexOf(relationship.level);
  const firstMissingContact = contacts.find((contact) => !contact.hasContact);
  const connectedContacts = contacts.filter((contact) => contact.hasContact).length;
  const badgeColor = relationship.score >= 75 ? "success" : relationship.score >= 45 ? "warning" : "primary";
  const action = firstMissingContact
    ? {
        title: `Liên hệ ${firstMissingContact.role}`,
        detail: "Xin tên và thông tin liên hệ để đặt lịch làm việc.",
      }
    : !relationship.contact || relationship.contact === "-"
      ? {
          title: "Xác định đầu mối trường",
          detail: "Chưa có dữ liệu đầu mối để đặt lịch làm việc.",
        }
    : {
        title: `Tiếp tục với ${relationship.contact}`,
        detail: `Lần liên hệ tiếp theo: ${relationship.nextTouch}.`,
      };

  return (
    <Card className="min-w-0 p-5 lg:p-6">
      <CardHeader className="mb-5 items-start">
        <div className="min-w-0">
          <CardTitle>Ai cần liên hệ ở trường này?</CardTitle>
          <p className="mt-1 text-xs text-text-tertiary">Xác định người cần gặp trước khi triển khai hoạt động</p>
        </div>
        <Badge color={badgeColor}>{relationship.level}</Badge>
      </CardHeader>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <div className="rounded-2xl border border-primary-200 bg-badge-primary-background p-4">
            <p className="text-xs font-medium text-badge-primary-text">Việc cần làm ngay</p>
            <p className="mt-2 text-xl font-semibold leading-7 text-text-primary">{action.title}</p>
            <p className="mt-2 text-sm leading-5 text-text-secondary">{action.detail}</p>
          </div>

          <div className="mt-5 rounded-2xl border border-card-border bg-background-soft-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-text-tertiary">Mức độ quan hệ</p>
              <p className="text-sm font-semibold text-text-primary">{relationship.score}/100</p>
            </div>
            <div className="mt-3 flex h-2.5 gap-1" aria-label={`Mức độ quan hệ: ${relationship.level}`}>
              {relationshipSteps.map((step, index) => <span key={step} className={`h-full flex-1 rounded-full ${index <= currentIndex ? "bg-primary-500" : "bg-background-soft-200"}`} title={step} />)}
            </div>
            <div className="mt-2 flex items-start justify-between gap-2 text-[11px] leading-4 text-text-tertiary">
              <span>Chưa có liên hệ</span>
              <span className="text-right">Hợp tác lâu dài</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:border-l lg:border-card-border lg:pl-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-text-primary">Người cần liên hệ</p>
            <span className="text-xs text-text-tertiary">{connectedContacts}/{contacts.length} đã có liên hệ</span>
          </div>

          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
            {contacts.length ? contacts.map((contact) => (
              <li key={contact.role} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-card-border px-3 py-2.5">
                <span className={contact.hasContact ? "shrink-0 text-success-500" : "shrink-0 text-icon-tertiary"} aria-hidden="true">
                  {contact.hasContact ? <CheckCircle1 size={16} /> : <User2 size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary" title={contact.role}>{contact.role}</p>
                  <p className="mt-0.5 truncate text-xs text-text-secondary" title={contact.hasContact ? contact.name : undefined}>{contact.hasContact ? contact.name : "Chưa có người liên hệ"}</p>
                </div>
                <Badge color={contact.hasContact ? "success" : "gray"}>{contact.hasContact ? "Đã có" : "Cần tìm"}</Badge>
              </li>
            )) : <li className="rounded-xl border border-dashed border-card-border px-3 py-4 text-sm text-text-tertiary">-</li>}
          </ul>
        </div>
      </div>
    </Card>
  );
}
