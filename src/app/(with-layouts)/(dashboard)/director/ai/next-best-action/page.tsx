import type { Metadata } from "next";

import NextBestActionWorkspace from "./_components/next-best-action-workspace";

export const metadata: Metadata = {
  title: "Việc cần xử lý",
  description: "Ưu tiên hồ sơ theo hạn xử lý và thực hiện việc cần làm tiếp theo.",
};

export default function NextBestActionPage() {
  return <NextBestActionWorkspace />;
}
