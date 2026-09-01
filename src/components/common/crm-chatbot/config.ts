const DEFAULT_CRM_CHATBOT_URL = "http://localhost:5173";

export const CRM_CHATBOT_URL = (
  process.env.NEXT_PUBLIC_CRM_CHATBOT_URL ?? DEFAULT_CRM_CHATBOT_URL
).replace(/\/+$/, "");

export const CRM_CHATBOT_ORIGIN = new URL(CRM_CHATBOT_URL).origin;
export const CRM_CHATBOT_FULLSCREEN_URL = `${CRM_CHATBOT_URL}/embed/chatbot`;
export const CRM_CHATBOT_POPOVER_URL = `${CRM_CHATBOT_FULLSCREEN_URL}?mode=popover`;

// Keep the old name for integrations that still import the generic embed URL.
export const CRM_CHATBOT_EMBED_URL = CRM_CHATBOT_FULLSCREEN_URL;
