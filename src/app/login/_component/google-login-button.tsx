"use client";

import { startGoogleLogin } from "@/services/api/auth";
import { GoogleIcon } from "@/utils/icon";
import { useState } from "react";

/**
 * Google sign-in button — mirrors `.btn-google` in crm/www/login.html.
 * Full-page redirect into the Frappe-hosted OAuth flow.
 */
export function GoogleLoginButton() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  return (
    <button
      type="button"
      disabled={isRedirecting}
      onClick={() => {
        setIsRedirecting(true);
        startGoogleLogin();
      }}
      className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[8px] border border-[#e5e7eb] bg-white py-[11px] text-[14px] leading-4 font-medium text-[#374151] transition-colors hover:border-[#d1d5db] hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon aria-hidden="true" className="size-[18px] shrink-0" />
      {isRedirecting ? "Đang chuyển tới Google…" : "Đăng nhập với Google"}
    </button>
  );
}
