import { AuthGuard } from "@/components/common/auth/auth-guard";
import { DashboardAccessGuard } from "@/components/common/auth/dashboard-access-guard";

export default function SegmentBuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardAccessGuard>{children}</DashboardAccessGuard>
    </AuthGuard>
  );
}
