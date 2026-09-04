import { DashboardAccessGuard } from "@/components/common/auth/dashboard-access-guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardAccessGuard>{children}</DashboardAccessGuard>;
}
