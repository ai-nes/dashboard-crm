import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MessageTemplatePage from "./message-template-page";

const session = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: session.user, isLoading: false }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/director/message-template",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("./message-template-list", () => ({
  default: ({ canCreate, canUpdate, canDelete }: Record<string, boolean>) => (
    <output>{`template grants ${canCreate}/${canUpdate}/${canDelete}`}</output>
  ),
}));
vi.mock("./message-template-create-dialog", () => ({ default: () => null }));
vi.mock("./message-template-library-dialog", () => ({ default: () => null }));
vi.mock("../../_components/content-create-menu", () => ({
  default: ({
    onCreateFromTemplate,
  }: {
    onCreateFromTemplate?: () => void;
  }) => <output>{`create-menu ${Boolean(onCreateFromTemplate)}`}</output>,
}));

function userWithTemplatePermissions(
  read: boolean,
  create: boolean,
  write: boolean,
  remove: boolean,
) {
  return {
    user: "director@example.test",
    crm_user_id: "user-director-1",
    email: "director@example.test",
    full_name: "Director",
    user_image: null,
    roles: ["Admissions Director"],
    crm_profile: "admissions_director",
    crm_role: "Admissions Director",
    crm_capabilities: [],
    crm_doctype_permissions: {
      "CRM Message Template": {
        read,
        create,
        write,
        delete: remove,
        export: false,
        row_scope: "all",
      },
      "CRM Message Template Library": {
        read: false,
        create: false,
        write: false,
        delete: false,
        export: false,
      },
      "CRM Snippet": {
        read: false,
        create: false,
        write: false,
        delete: false,
        export: false,
      },
    },
  };
}

describe("Director message-template permissions", () => {
  it("does not render or load the page when Message Template.read is absent", () => {
    session.user = userWithTemplatePermissions(false, true, true, true);

    const html = renderToStaticMarkup(<MessageTemplatePage />);

    expect(html).toContain("Bạn không có quyền xem mẫu nội dung.");
    expect(html).not.toContain("Message Template");
  });

  it("passes each effective CRUD grant to the UI and hides the library action without library read", () => {
    session.user = userWithTemplatePermissions(true, true, false, false);

    const html = renderToStaticMarkup(<MessageTemplatePage />);

    expect(html).toContain("template grants true/false/false");
    expect(html).toContain("create-menu false");
  });
});
