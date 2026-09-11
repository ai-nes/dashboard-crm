import { messageTemplateGroups } from "./message-template-library-data";

export interface MessageTemplateRecord {
  id: string;
  code: string;
  name: string;
  owner: string;
  createdAt: string;
  modifiedAt: string;
  subject: string;
  body: string;
}

function getTemplateContent(name: string) {
  const template = messageTemplateGroups
    .flatMap((group) => group.templates)
    .find((item) => item.title === name);

  return {
    subject: template?.subject ?? "",
    body: template?.body ?? "",
  };
}

export const mockMessageTemplates: MessageTemplateRecord[] = [
  {
    id: "mt-first-contact",
    code: "MSG-001",
    name: "Liên hệ lần đầu",
    owner: "Thịnh Phú",
    createdAt: "2026-08-04T08:30:00+07:00",
    modifiedAt: "2026-08-18T14:15:00+07:00",
    ...getTemplateContent("Liên hệ lần đầu"),
  },
  {
    id: "mt-event-lead",
    code: "MSG-002",
    name: "Lead từ sự kiện / form / nội dung",
    owner: "Nguyễn Minh Anh",
    createdAt: "2026-08-06T10:00:00+07:00",
    modifiedAt: "2026-08-20T09:45:00+07:00",
    ...getTemplateContent("Lead từ sự kiện / form / nội dung"),
  },
  {
    id: "mt-program-introduction",
    code: "MSG-003",
    name: "Giới thiệu chương trình phù hợp",
    owner: "Lê Ngọc Thảo",
    createdAt: "2026-08-08T15:20:00+07:00",
    modifiedAt: "2026-08-21T16:10:00+07:00",
    ...getTemplateContent("Giới thiệu chương trình phù hợp"),
  },
  {
    id: "mt-follow-up",
    code: "MSG-004",
    name: "Follow-up sau tư vấn",
    owner: "Thịnh Phú",
    createdAt: "2026-08-12T09:10:00+07:00",
    modifiedAt: "2026-08-22T11:35:00+07:00",
    ...getTemplateContent("Follow-up sau tư vấn"),
  },
  {
    id: "mt-open-day",
    code: "MSG-005",
    name: "Mời Open Day / sự kiện",
    owner: "Nguyễn Minh Anh",
    createdAt: "2026-08-15T13:40:00+07:00",
    modifiedAt: "2026-08-23T08:50:00+07:00",
    ...getTemplateContent("Mời Open Day / sự kiện"),
  },
  {
    id: "mt-complete-application",
    code: "MSG-006",
    name: "Nhắc hoàn thiện hồ sơ",
    owner: "Lê Ngọc Thảo",
    createdAt: "2026-08-19T08:15:00+07:00",
    modifiedAt: "2026-08-25T10:25:00+07:00",
    ...getTemplateContent("Nhắc hoàn thiện hồ sơ"),
  },
];
