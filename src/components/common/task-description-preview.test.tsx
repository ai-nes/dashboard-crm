import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TaskDescriptionPreview from "./task-description-preview";

describe("TaskDescriptionPreview", () => {
  it("keeps unknown entity names as escaped text", () => {
    const markup = renderToStaticMarkup(
      <TaskDescriptionPreview value="<p>&constructor; &unknown;</p>" />,
    );
    expect(markup).toContain("&amp;constructor; &amp;unknown;");
    expect(markup).not.toContain("function Object");
  });
  it("preserves safe formatting while discarding HTML attributes and unsafe content", () => {
    const source =
      '<p onclick="alert(0)">Some <strong>bold</strong>, <em>italic</em>, <u>underlined</u> &amp; safe<br>next line</p><ul><li>first</li></ul><a href="javascript:alert(1)" onmouseover="alert(2)">link text</a><img src="x" onerror="alert(3)"><script>alert(4)</script><style>.hidden{display:none}</style>';
    const markup = renderToStaticMarkup(
      <TaskDescriptionPreview value={source} />,
    );

    expect(markup).toMatch(
      /<strong class="[^"]*font-bold[^"]*">bold<\/strong>/,
    );
    expect(markup).toMatch(/<em class="[^"]*italic[^"]*">italic<\/em>/);
    expect(markup).toMatch(/<u class="[^"]*underline[^"]*">underlined<\/u>/);
    expect(markup).toContain("&amp; safe");
    expect(markup).toContain("<br");
    expect(markup).toContain("next line");
    expect(markup).toContain("<ul");
    expect(markup).toMatch(/<li[^>]*>first<\/li>/);
    expect(markup).toContain("link text");
    expect(markup).not.toMatch(
      /onclick|onmouseover|onerror|href=|javascript:/i,
    );
    expect(markup).not.toMatch(
      /alert\([0-4]\)|display:none|<script|<style|<img/i,
    );
    expect(source).toContain("<strong>bold</strong>");
    expect(source).toContain("<script>alert(4)</script>");
  });
});
