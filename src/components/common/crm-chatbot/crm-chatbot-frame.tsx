import { CRM_CHATBOT_FULLSCREEN_URL } from "./config";

export default function CrmChatbotFrame() {
  return (
    <section className="h-full min-h-0 w-full">
      <iframe
        src={CRM_CHATBOT_FULLSCREEN_URL}
        title="CRM Chatbot"
        loading="lazy"
        allow="microphone"
        className="block size-full border-0 bg-card-background"
      />
    </section>
  );
}
