import { describe, expect, it } from "vitest";

import {
  messageTemplatePreviewDocument,
  normalizeMessageTemplateBody,
} from "./message-template-body";

describe("message template body normalization", () => {
  it("converts library plain text into paragraphs and token nodes", () => {
    const body = "Chào {{student.first_name}}\r\n\r\nTrân trọng,\n{{owner.full_name}}";

    expect(normalizeMessageTemplateBody(body)).toBe(
      '<p>Chào <span data-message-template-token="student.first_name">{{student.first_name}}</span></p><p>Trân trọng,<br /><span data-message-template-token="owner.full_name">{{owner.full_name}}</span></p>',
    );
  });

  it("uses normalized HTML when building the isolated preview document", () => {
    const document = messageTemplatePreviewDocument("Dòng một\n\nDòng hai");

    expect(document).toContain("<p>Dòng một</p><p>Dòng hai</p>");
    expect(document).not.toContain("Dòng một\\n\\nDòng hai");
  });
});
