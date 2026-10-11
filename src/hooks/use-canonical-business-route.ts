"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getCanonicalBusinessRouteUrl } from "@/utils/business-record-route";

/** Replace legacy ID URLs only after an authorized detail read resolves a code. */
export function useCanonicalBusinessRoute(
  reference: string,
  code: string | null | undefined,
) {
  const router = useRouter();
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const target = getCanonicalBusinessRouteUrl(
      pathname,
      reference,
      code,
      search,
      hash,
    );
    if (target) router.replace(target, { scroll: false });
  }, [reference, code, router]);
}
