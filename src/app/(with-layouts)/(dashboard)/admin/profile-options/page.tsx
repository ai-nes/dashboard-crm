import type { Metadata } from "next";
import ProfileOptionsPage from "./_components/profile-options-page";

export const metadata: Metadata = {
  title: "Danh mục hồ sơ",
  description: "Quản lý quốc tịch, dân tộc, tôn giáo và nơi cấp giấy tờ.",
};

export default function Page() {
  return <ProfileOptionsPage />;
}
