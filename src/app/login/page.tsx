import { GoogleLoginButton } from "@/app/login/_component/google-login-button";
import { LoginForm } from "@/app/login/_component/login-form";
import { Logo } from "@/utils/icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: {
    index: false,
    follow: false,
  },
};

// Faithful port of crm/www/login.html (Frappe CRM login page).
const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export default function LoginPage() {
  return (
    <main
      style={{ fontFamily: systemFont }}
      className="flex min-h-dvh items-center justify-center bg-[#f3f4f6] p-4"
    >
      <section className="w-full max-w-[400px] rounded-[12px] bg-white p-10 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="mb-3 flex justify-center">
          <Logo className="size-11" aria-hidden="true" />
        </div>
        <h1 className="mb-6 text-center text-[18px] leading-tight font-semibold text-[#111]">
          Đăng nhập vào CRM
        </h1>

        <LoginForm />

        <div className="my-5 flex items-center gap-3 text-[13px] text-[#9ca3af] before:h-px before:flex-1 before:bg-[#e5e7eb] after:h-px after:flex-1 after:bg-[#e5e7eb]">
          hoặc
        </div>

        <GoogleLoginButton />
      </section>
    </main>
  );
}
