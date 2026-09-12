import type { ReactNode } from "react";

import { SegmentDataProvider } from "@/components/segments/segment-data-provider";

export default function SegmentLayout({ children }: { children: ReactNode }) {
  return <SegmentDataProvider visibleStudentsOnly>{children}</SegmentDataProvider>;
}
