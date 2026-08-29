import type { Metadata } from "next";

import NextBestActionWorkspace from "./_components/next-best-action-workspace";

export const metadata: Metadata = {
  title: "Điều phối hành động AI | AI-NES Admission Intelligence",
  description: "Phân công những hành động tuyển sinh được AI đề xuất theo mức độ ưu tiên.",
};

export default function NextBestActionPage() {
  return <NextBestActionWorkspace />;
}
