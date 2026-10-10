import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/services/api/auth";

import ScoreTemplateDetailPage from "./score-template-detail-page";
import ScoreRulesInlineEditor from "./score-rules-inline-editor";

const session = vi.hoisted(() => ({
  user: {
    user: "admin@example.test",
    roles: ["System Manager"],
    crm_profile: null as string | null,
    crm_doctype_permissions:
      undefined as CurrentUser["crm_doctype_permissions"],
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => session,
}));
vi.mock("@/hooks/use-admin-catalog-queries", () => ({
  useScoreTemplateDetailQuery: () => ({
    data: {
      name: "template-1",
      template_name: "Score Template",
      status: "Inactive",
      fit_weight: 0.4,
      engagement_weight: 0.3,
      intent_weight: 0.3,
      rules: [],
    },
    isPending: false,
    error: null,
  }),
  useScoreTemplateMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useScoreSignalsQuery: () => ({ data: { signals: [] }, isPending: false }),
}));
vi.mock("./score-rule-edit-dialog", () => ({ default: () => null }));
vi.mock("./score-template-create-dialog", () => ({ default: () => null }));

const renderPage = () =>
  renderToStaticMarkup(<ScoreTemplateDetailPage templateName="template-1" />);

describe("score template direct editing", () => {
  beforeEach(() => {
    session.user.roles = ["System Manager"];
    session.user.crm_profile = null;
    session.user.crm_doctype_permissions = undefined;
  });

  it("shows identity and weight inputs without entering edit mode", () => {
    const html = renderPage();
    expect(html).toContain("Thay đổi hợp lệ được tự động lưu.");
    expect(html).not.toContain("Lưu thay đổi");
    expect(html).toContain('aria-label="Tên template"');
    expect(html).toContain('aria-label="Fit trọng số"');
    expect(html).toContain('aria-label="Engagement trọng số"');
    expect(html).toContain('aria-label="Intent trọng số"');
    expect(html).not.toContain('aria-label="Chỉnh sửa trọng số"');
    expect(html).not.toContain('aria-label="Chỉnh sửa thông tin template"');
  });

  it("also permits the admissions director profile", () => {
    session.user.roles = ["Admissions Director"];
    session.user.crm_profile = "admissions_director";
    expect(renderPage()).toContain('aria-label="Fit trọng số"');
  });

  it("keeps read-only users out of inputs and rubric actions", () => {
    session.user.roles = ["Marketing"];
    session.user.crm_profile = "marketing";
    const html = renderPage();
    expect(html).not.toContain('aria-label="Fit trọng số"');
    expect(html).not.toContain('aria-label="Tên template"');
    expect(html).not.toContain("Thêm rubric</");
    expect(html).toContain("Thông tin template");
    expect(html).toContain("Trọng số");
  });

  it("honors an explicit write denial even for System Manager", () => {
    session.user.crm_doctype_permissions = {
      "CRM Score Template": {
        read: true,
        write: false,
        create: false,
        delete: false,
        export: false,
      },
    };
    expect(renderPage()).not.toContain('aria-label="Fit trọng số"');
  });
});

describe("inline rubric editing from dev", () => {
  const renderRules = (canEdit: boolean) =>
    renderToStaticMarkup(
      <ScoreRulesInlineEditor
        rules={[
          {
            rule_kind: "positive",
            signal: "fit.program",
            base_points: 10,
            max_points: 30,
            is_active: true,
          },
        ]}
        canEdit={canEdit}
        isDisabled={false}
        onChange={vi.fn()}
      />,
    );

  it("renders editable values in the table without an edit button or dialog", () => {
    const html = renderRules(true);
    expect(html).toContain('aria-label="Điểm cộng"');
    expect(html).toContain('aria-label="Điểm tối đa"');
    expect(html).toContain('aria-label="Loại rubric"');
    expect(html).not.toContain('aria-label="Chỉnh sửa rubric');
    expect(html).not.toContain('role="dialog"');
  });

  it("renders values without editing controls for read-only users", () => {
    const html = renderRules(false);
    expect(html).toContain("fit.program");
    expect(html).not.toContain('aria-label="Điểm cộng"');
    expect(html).not.toContain("Thêm rubric</");
  });
});
