"use client";

import { Button } from "@/components/tailgrids/core/button";

interface LicenseUnavailableProps {
  retrying: boolean;
  onRetry: () => void;
}

/** The backend could not be reached, so the license state is unknown. */
export function LicenseUnavailable({
  retrying,
  onRetry,
}: LicenseUnavailableProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-gray-secondary_alt_2 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-card-border bg-card-background p-8 text-center shadow-xs">
        <h1 className="text-xl font-semibold text-text-primary">
          Không kết nối được máy chủ CRM
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Không kiểm tra được trạng thái license. Vui lòng kiểm tra máy chủ rồi
          thử lại.
        </p>
        <Button className="mt-6" isDisabled={retrying} onPress={onRetry}>
          {retrying ? "Đang thử lại…" : "Thử lại"}
        </Button>
      </section>
    </main>
  );
}
