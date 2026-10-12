import type { Metadata } from "next";
import ResetPasswordForm from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Tạo mật khẩu mới",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-gray-primary p-4 text-text-primary">
      <section className="w-full max-w-[400px] rounded-xl border border-card-border bg-card-background p-10 shadow-sm">
        <h1 className="mb-2 text-center text-lg leading-tight font-semibold text-text-primary">
          Tạo mật khẩu mới
        </h1>
        <ResetPasswordForm
          token={params.token ?? ""}
          invalidToken={params.error === "INVALID_TOKEN"}
        />
      </section>
    </main>
  );
}
