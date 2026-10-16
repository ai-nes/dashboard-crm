import { MutationCache, QueryClient } from "@tanstack/react-query";
import {
  createForbiddenQueryCache,
  redirectToActivate,
} from "./forbidden-redirect";
import { isLicenseApiError } from "./license";

export function createCrmQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    queryCache: createForbiddenQueryCache(),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (isLicenseApiError(error)) redirectToActivate();
      },
      onSuccess: () =>
        client.invalidateQueries({ queryKey: ["student-audit"] }),
    }),
  });
  return client;
}
