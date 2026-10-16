"use client";

import { AuthProvider } from "@/components/common/auth/auth-provider";
import { LicenseGate } from "@/components/common/license/license-gate";
import { createCrmQueryClient } from "@/services/api/crm-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures the client is created once per request
  const [queryClient] = useState(createCrmQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LicenseGate>{children}</LicenseGate>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
