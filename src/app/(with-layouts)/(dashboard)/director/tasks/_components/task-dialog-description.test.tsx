import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TaskDialogDescription from "./task-dialog-description";

describe("TaskDialogDescription read-only preview", () => {
  it("preserves rich-text formatting without exposing unsafe content", () => {
    const html = renderToStaticMarkup(
      <TaskDialogDescription
        value="<p>bold <strong>text</strong>, <em>italic</em>, <u>underlined</u> &amp; safe</p><script>alert(1)</script>"
        onChange={() => undefined}
        readOnly
      />,
    );

    expect(html).toMatch(/<strong[^>]*>text<\/strong>/);
    expect(html).toMatch(/<em[^>]*>italic<\/em>/);
    expect(html).toMatch(/<u[^>]*>underlined<\/u>/);
    expect(html).toContain("&amp; safe");
    expect(html).not.toContain("alert(1)");
  });
});
