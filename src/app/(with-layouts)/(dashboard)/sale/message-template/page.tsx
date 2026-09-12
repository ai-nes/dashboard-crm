import type { Metadata } from "next";

import MessageTemplatePage from "@/app/(with-layouts)/(dashboard)/director/message-template/_components/message-template-page";

export const metadata: Metadata = {
  title: "Message Template",
  description:
    "Tạo và quản lý các mẫu tin nhắn cá nhân trong quá trình chăm sóc học sinh.",
};

export default function SaleMessageTemplatePage() {
  return <MessageTemplatePage canDelete={false} lockedSharing="private" />;
}
