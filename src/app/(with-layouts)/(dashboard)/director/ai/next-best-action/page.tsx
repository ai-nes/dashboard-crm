import type { Metadata } from "next";

import NextBestActionWorkspace from "./_components/next-best-action-workspace";

export const metadata: Metadata = {
  title: "Đề xuất hành động",
  description:
    "Xem xét các đề xuất Next Best Action có căn cứ cho từng học sinh.",
};

export default function NextBestActionPage() {
  return <NextBestActionWorkspace />;
}
