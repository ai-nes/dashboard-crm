import type { Metadata } from "next";
import ForgotPasswordForm from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-gray-primary p-4 text-text-primary">
      <section className="w-full max-w-[400px] rounded-xl border border-card-border bg-card-background p-10 shadow-sm">
        <h1 className="mb-2 text-center text-lg leading-tight font-semibold text-text-primary">
          Đặt lại mật khẩu
        </h1>
        <p className="mb-6 text-center text-[13px] leading-5 text-text-secondary">
          Nhập email tài khoản để nhận liên kết đặt lại mật khẩu.
        </p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
