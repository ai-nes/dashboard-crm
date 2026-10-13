import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông tin tài khoản",
};

export default function AccountPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
