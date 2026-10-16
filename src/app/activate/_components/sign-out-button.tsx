"use client";

import { AUTH_QUERY_KEY } from "@/components/common/auth/auth-provider";
import { Button } from "@/components/tailgrids/core/button";
import { logout } from "@/services/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

/** Lets someone switch to an administrator account from the locked screen. */
export function SignOutButton() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const handlePress = async () => {
    setPending(true);
    try {
      await logout();
    } finally {
      // LicenseGate sends a signed-out visitor to /login.
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      setPending(false);
    }
  };

  return (
    <div className="mt-6 flex justify-center">
      <Button
        variant="ghost"
        size="sm"
        isDisabled={pending}
        onPress={() => void handlePress()}
      >
        {pending ? "Đang đăng xuất…" : "Đăng xuất"}
      </Button>
    </div>
  );
}
