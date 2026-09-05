import type { Metadata } from "next";

import DirectorDashboard from "@/app/(with-layouts)/(dashboard)/(home)/_component/director-dashboard";

export const metadata: Metadata = {
  title: "Tổng quan tuyển sinh",
  description:
    "Toàn cảnh hồ sơ, hiệu suất vận hành và chuyển đổi nhập học dành cho Director.",
};

export default function DirectorPage() {
  return <DirectorDashboard />;
}
