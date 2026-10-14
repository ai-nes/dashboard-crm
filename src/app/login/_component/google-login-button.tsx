"use client";

import { startGoogleLogin } from "@/services/api/auth";
import { GoogleIcon } from "@/utils/icon";
import { useState } from "react";

// Better Auth sends the browser back to /login?error=<code> when Google fails.
const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_email_not_verified: "Email Google chưa được xác minh.",
  unable_to_create_user: "Tài khoản Google này chưa được cấp quyền vào CRM.",
  signup_disabled: "Tài khoản Google này chưa được cấp quyền vào CRM.",
};
const GOOGLE_ERROR_FALLBACK = "Đăng nhập Google thất bại. Vui lòng thử lại.";

/** Google sign-in through the CRM backend's Better Auth. */
export function GoogleLoginButton({ errorCode }: { errorCode?: string }) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode
      ? (GOOGLE_ERROR_MESSAGES[errorCode] ?? GOOGLE_ERROR_FALLBACK)
      : null,
  );

  const handleClick = async () => {
    setError(null);
    setIsRedirecting(true);
    const result = await startGoogleLogin();
    if (!result.ok) {
      setError(result.error ?? GOOGLE_ERROR_FALLBACK);
      setIsRedirecting(false);
    }
  };

  return (
    <>
      {error ? (
        <div
          role="alert"
          className="mb-3.5 rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2.5 text-[13px] text-[#dc2626]"
        >
          {error}
        </div>
      ) : null}
      <button
        type="button"
        disabled={isRedirecting}
        onClick={handleClick}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[8px] border border-[#e5e7eb] bg-white py-[11px] text-[14px] leading-4 font-medium text-[#374151] transition-colors hover:border-[#d1d5db] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon aria-hidden="true" className="size-[18px] shrink-0" />
        {isRedirecting ? "Đang chuyển tới Google…" : "Đăng nhập với Google"}
      </button>
    </>
  );
}
