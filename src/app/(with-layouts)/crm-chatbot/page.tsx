import type { Metadata } from "next";

import CrmChatbotFrame from "@/components/common/crm-chatbot/crm-chatbot-frame";

export const metadata: Metadata = {
  title: "Chatbot CRM",
  description: "Trợ lý AI hỗ trợ đội ngũ tuyển sinh trong CRM.",
};

export default function CrmChatbotPage() {
  return <CrmChatbotFrame />;
}
