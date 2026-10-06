"use client";

import { AuthProvider } from "@/components/common/auth/auth-provider";
import { createForbiddenQueryCache } from "@/services/api/forbidden-redirect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { installLegacyMethodShim } from "@/services/api/nest/legacy-method-shim";

// Serve Frappe method calls from the Nest backend before any query runs.
installLegacyMethodShim();

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures the client is created once per request
  const [queryClient] = useState(
    () => new QueryClient({ queryCache: createForbiddenQueryCache() }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
