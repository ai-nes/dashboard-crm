import { Button } from "@/components/tailgrids/core/button";
import { GoogleIcon } from "@/utils/icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-gray-secondary_alt px-4 py-8">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-sm rounded-xl border border-card-border bg-card-background p-6 shadow-xs sm:p-8"
      >
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-brand-500">FAIP</p>
          <h1 id="login-title" className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
            Chào mừng trở lại
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Đăng nhập để tiếp tục sử dụng hệ thống tuyển sinh.
          </p>
        </div>

        <Button appearance="outline" size="xl" className="w-full gap-3">
          <GoogleIcon aria-hidden="true" className="size-5 shrink-0" />
          Đăng nhập với Google
        </Button>
      </section>
    </main>
  );
}
