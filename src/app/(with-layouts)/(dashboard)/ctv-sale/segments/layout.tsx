import type { ReactNode } from "react";

import { SegmentDataProvider } from "@/components/segments/segment-data-provider";

export default function CtvSaleSegmentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SegmentDataProvider visibleStudentsOnly>{children}</SegmentDataProvider>
  );
}
