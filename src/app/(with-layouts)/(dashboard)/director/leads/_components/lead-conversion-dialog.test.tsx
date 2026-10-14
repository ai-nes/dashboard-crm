import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LeadConversionSchoolEmptyMessage } from "./lead-conversion-dialog";

describe("Lead conversion school catalog guidance", () => {
  it("links to the school catalog only when the viewer can create schools", () => {
    const adminHtml = renderToStaticMarkup(
      <LeadConversionSchoolEmptyMessage canCreateSchool province="Hà Nội" />,
    );
    const viewerHtml = renderToStaticMarkup(
      <LeadConversionSchoolEmptyMessage
        canCreateSchool={false}
        province="Hà Nội"
      />,
    );

    expect(adminHtml).toContain(
      "Danh mục chưa có trường THPT thuộc tỉnh Hà Nội.",
    );
    expect(adminHtml).toContain('href="/director/schools"');
    expect(adminHtml).toContain("Mở danh mục trường để bổ sung");
    expect(viewerHtml).not.toContain('href="/director/schools"');
    expect(viewerHtml).toContain("Vui lòng liên hệ quản trị viên");
  });
});
