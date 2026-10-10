import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createForbiddenQueryCache } from "./forbidden-redirect";

export function createCrmQueryClient(): QueryClient {
  const client: QueryClient = new QueryClient({
    queryCache: createForbiddenQueryCache(),
    mutationCache: new MutationCache({
      onSuccess: () =>
        client.invalidateQueries({ queryKey: ["student-audit"] }),
    }),
  });
  return client;
}
