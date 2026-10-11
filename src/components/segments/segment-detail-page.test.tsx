import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SegmentDetailPage } from "./segment-detail-page";

const state = vi.hoisted(() => ({
  reference: "",
  previewSegment: "",
  previewEnabled: false,
  canonicalRoute: null as [string, string | undefined] | null,
  segment: {
    name: "550e8400-e29b-41d4-a716-446655440000",
    segment_code: "SEG-2026-0042",
    title: "Tiềm năng cao",
    status: "draft" as const,
    revision: 2,
    filters: null,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {} }),
}));

vi.mock("@/hooks/use-canonical-business-route", () => ({
  useCanonicalBusinessRoute: (reference: string, code?: string) => {
    state.canonicalRoute = [reference, code];
  },
}));

vi.mock("@/hooks/use-segment-queries", () => ({
  useDeleteSegmentMutation: () => ({ mutateAsync: vi.fn() }),
  useSegmentDetailQuery: (reference: string) => {
    state.reference = reference;
    return { data: state.segment, isLoading: false, isError: false, error: null };
  },
  useSegmentFilterOptionsQuery: () => ({ data: undefined }),
  useSegmentPreviewQuery: (
    params: { segment: string },
    enabled: boolean,
  ) => {
    state.previewSegment = params.segment;
    state.previewEnabled = enabled;
    return { data: { total: 0, students: [] }, isFetching: false, error: null };
  },
}));

vi.mock("./segment-permissions", () => ({
  canReadSegments: () => true,
  canManageSegment: () => false,
}));
vi.mock("./segment-audit-tab", () => ({ default: () => null }));
vi.mock("./segment-detail-filters", () => ({
  SegmentDetailFilters: () => null,
}));
vi.mock("./segment-detail-header", () => ({
  SegmentDetailHeader: () => null,
}));
vi.mock("./segment-tasks-tab", () => ({ default: () => null }));
vi.mock("./segment-student-table", () => ({
  SegmentStudentTable: () => null,
}));
vi.mock("react-aria-components", () => ({
  Tab: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabPanels: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function renderPage(reference: string) {
  state.reference = "";
  state.previewSegment = "";
  state.previewEnabled = false;
  state.canonicalRoute = null;

  renderToStaticMarkup(
    <SegmentDetailPage
      segmentId={reference}
      backHref="/sale/next-best-action"
      editHref="/sale/segments/edit"
    />,
  );
}

describe("segment detail route identity", () => {
  beforeEach(() => {
    state.reference = "";
    state.previewSegment = "";
    state.previewEnabled = false;
    state.canonicalRoute = null;
  });

  it("loads by business code and previews with the resolved UUID", () => {
    renderPage("SEG-2026-0042");

    expect(state.reference).toBe("SEG-2026-0042");
    expect(state.canonicalRoute).toEqual([
      "SEG-2026-0042",
      "SEG-2026-0042",
    ]);
    expect(state.previewSegment).toBe(state.segment.name);
    expect(state.previewEnabled).toBe(true);
  });

  it("keeps legacy UUID URLs readable and previews with the resolved record name", () => {
    renderPage(state.segment.name);

    expect(state.reference).toBe(state.segment.name);
    expect(state.canonicalRoute).toEqual([
      state.segment.name,
      "SEG-2026-0042",
    ]);
    expect(state.previewSegment).toBe(state.segment.name);
    expect(state.previewEnabled).toBe(true);
  });
});
