import { ArrowLeft, Shield1Check } from "@tailgrids/icons";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Không có quyền truy cập",
};

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-gray-secondary_alt_2 px-5 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-card-border bg-card-background p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-badge-warning-background text-warning-600">
          <Shield1Check size={32} aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-warning-600">
          Mã lỗi 403
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.5px] text-text-primary sm:text-4xl">
          Không có quyền truy cập
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-text-secondary">
          Tài khoản của bạn không được cấp quyền xem dữ liệu hoặc thực hiện thao
          tác này. Vui lòng liên hệ quản trị viên nếu bạn cần được cấp quyền.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-button-primary-background px-4 py-2.5 text-sm font-semibold text-button-primary-text transition-colors hover:bg-button-primary-hover-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Về trang tổng quan
        </Link>
      </section>
    </main>
  );
}
