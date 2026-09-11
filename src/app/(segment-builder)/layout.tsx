import { AuthGuard } from "@/components/common/auth/auth-guard";
import { DashboardAccessGuard } from "@/components/common/auth/dashboard-access-guard";

export default function SegmentBuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardAccessGuard>
        <div className="h-dvh min-h-0 overflow-hidden bg-card-background">
          {children}
        </div>
      </DashboardAccessGuard>
    </AuthGuard>
  );
}
