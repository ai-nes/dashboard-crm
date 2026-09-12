import type { Metadata } from "next";

import SnippestPage from "@/app/(with-layouts)/(dashboard)/director/snippest/_components/snippest-page";

export const metadata: Metadata = {
  title: "Snippest",
  description:
    "Tạo và quản lý các snippet cá nhân trong quá trình tư vấn học sinh.",
};

export default function SaleSnippestPage() {
  return <SnippestPage lockedSharing="private" />;
}
