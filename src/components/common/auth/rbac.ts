/**
 * Canonical CRM roles returned by `crm.api.session.me`.
 *
 * Role checks intentionally use exact string matches. Do not normalize casing,
 * trim values, or fall back to `crm_profile` here: the backend role name is the
 * contract for dashboard navigation.
 */
export const CRM_ROLES = [
  "Sale",
  "CTV Sale",
  "Lead Sales",
  "Promoter",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "CEO",
  "System Manager",
] as const;

export type CrmRole = (typeof CRM_ROLES)[number];

const CUSTOMER_DATA_ROLES = [
  "Sale",
  "CTV Sale",
  "Lead Sales",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const AI_CENTER_ROLES = [
  "Lead Sales",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "CEO",
  "System Manager",
] as const satisfies readonly CrmRole[];

const DEMOGRAPHICS_ROLES = AI_CENTER_ROLES.filter(
  (role) => role !== "System Manager",
);

const OVERVIEW_ACTION_ROLES = [
  "Sale",
  "CTV Sale",
  "Lead Sales",
  "Promoter",
  "Lead Promoter",
  "Admissions Director",
  "CEO",
  "System Manager",
] as const satisfies readonly CrmRole[];

const SCHOOL_INTELLIGENCE_ROLES = [
  "Sale",
  "Lead Sales",
  "Promoter",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const REGIONAL_PERFORMANCE_ROLES = [
  "Lead Sales",
  "Lead Promoter",
  "Lead Marketing",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const MARKETING_ANALYTICS_ROLES = [
  "Lead Sales",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const ACTIVITY_CAMPAIGN_ROLES = [
  "Promoter",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const SLA_ROLES = [
  "Sale",
  "Lead Sales",
  "Promoter",
  "Lead Promoter",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const ALERT_ROLES = [
  ...SLA_ROLES,
  "System Manager",
] as const satisfies readonly CrmRole[];

const DATA_HEALTH_ROLES = [
  "Admissions Director",
  "CEO",
  "System Manager",
] as const satisfies readonly CrmRole[];

const NBA_ACTIONS_READ_ROLES = [
  "System Manager",
] as const satisfies readonly CrmRole[];

const CAMPAIGN_INTELLIGENCE_ROLES = [
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const SCHOOL_FIELD_ACTIVITY_ROLES = [
  "Promoter",
  "Lead Promoter",
  "Admissions Director",
  "CEO",
] as const satisfies readonly CrmRole[];

const NON_SYSTEM_MANAGER_ROLES = CRM_ROLES.filter(
  (role) => role !== "System Manager",
);

/**
 * Public workspace routes. A workspace is the stable entry point for a role;
 * feature screens can be added below it without changing the login contract.
 */
export const ROLE_ROUTE_ROLES = {
  director: ["Admissions Director", "CEO"],
  admin: ["System Manager"],
  marketing: ["Marketing", "Lead Marketing"],
  sale: ["Sale"],
  "ctv-sale": ["CTV Sale"],
  "lead-sale": ["Lead Sales"],
} as const satisfies Record<string, readonly CrmRole[]>;

export type RoleRouteSlug = keyof typeof ROLE_ROUTE_ROLES;

export const ROLE_ROUTE_PATHS: Record<RoleRouteSlug, string> = {
  director: "/director",
  admin: "/admin",
  marketing: "/marketing",
  sale: "/sale",
  "ctv-sale": "/ctv-sale",
  "lead-sale": "/lead-sale",
};

export interface RouteAccessRule {
  path: string;
  roles: readonly CrmRole[];
}

/**
 * Route-level permissions from docs/rbac-permission-matrix.md.
 * More specific paths are resolved before their parent path, so
 * `/director/ai/next-best-action` can differ from `/director/ai`.
 */
export const ROUTE_ACCESS: readonly RouteAccessRule[] = [
  { path: "/", roles: CRM_ROLES },
  { path: "/crm-chatbot", roles: NON_SYSTEM_MANAGER_ROLES },
  { path: "/director", roles: ROLE_ROUTE_ROLES.director },
  { path: "/admin", roles: ROLE_ROUTE_ROLES.admin },
  { path: "/marketing", roles: ROLE_ROUTE_ROLES.marketing },
  { path: "/sale", roles: ROLE_ROUTE_ROLES.sale },
  { path: "/ctv-sale", roles: ROLE_ROUTE_ROLES["ctv-sale"] },
  { path: "/lead-sale", roles: ROLE_ROUTE_ROLES["lead-sale"] },
  { path: "/director/ai/next-best-action", roles: OVERVIEW_ACTION_ROLES },
  { path: "/director/ai", roles: AI_CENTER_ROLES },
  { path: "/director/demographics", roles: DEMOGRAPHICS_ROLES },
  { path: "/director/students", roles: CUSTOMER_DATA_ROLES },
  { path: "/director/market-intelligence", roles: SCHOOL_INTELLIGENCE_ROLES },
  { path: "/director/schools", roles: SCHOOL_INTELLIGENCE_ROLES },
  { path: "/director/school", roles: SCHOOL_INTELLIGENCE_ROLES },
  { path: "/director/regional-performance", roles: REGIONAL_PERFORMANCE_ROLES },
  { path: "/director/admission-funnel", roles: MARKETING_ANALYTICS_ROLES },
  { path: "/director/revenue-forecast", roles: MARKETING_ANALYTICS_ROLES },
  { path: "/director/tasks", roles: NON_SYSTEM_MANAGER_ROLES },
  { path: "/director/activity-campaign", roles: ACTIVITY_CAMPAIGN_ROLES },
  { path: "/director/sla", roles: SLA_ROLES },
  { path: "/director/alerts", roles: ALERT_ROLES },
  { path: "/director/data-health", roles: DATA_HEALTH_ROLES },
  { path: "/director/admin/nba-actions", roles: NBA_ACTIONS_READ_ROLES },
  { path: "/director/admin/action-recommendations", roles: NBA_ACTIONS_READ_ROLES },
  {
    path: "/director/campaign-intelligence",
    roles: CAMPAIGN_INTELLIGENCE_ROLES,
  },
  {
    path: "/director/school-field-activity",
    roles: SCHOOL_FIELD_ACTIVITY_ROLES,
  },
];

/**
 * The first matching role is only used for a fallback destination. In normal
 * cases sidebar and route access use the union of exact roles. System Manager
 * is intentionally exclusive so an extra backend role cannot expand its small
 * administration workspace.
 */
const ROLE_PRIORITY: readonly CrmRole[] = [
  "System Manager",
  "CEO",
  "Admissions Director",
  "Lead Marketing",
  "Marketing",
  "Lead Promoter",
  "Promoter",
  "Lead Sales",
  "Sale",
  "CTV Sale",
];

const ROLE_DEFAULT_ROUTES: Record<CrmRole, string> = {
  Sale: ROLE_ROUTE_PATHS.sale,
  "CTV Sale": ROLE_ROUTE_PATHS["ctv-sale"],
  "Lead Sales": ROLE_ROUTE_PATHS["lead-sale"],
  Promoter: "/director/school-field-activity",
  "Lead Promoter": "/director/school-field-activity",
  Marketing: ROLE_ROUTE_PATHS.marketing,
  "Lead Marketing": ROLE_ROUTE_PATHS.marketing,
  "Admissions Director": ROLE_ROUTE_PATHS.director,
  CEO: ROLE_ROUTE_PATHS.director,
  "System Manager": ROLE_ROUTE_PATHS.admin,
};

export function getRecognizedRoles(
  roles: readonly string[] | null | undefined,
): CrmRole[] {
  if (!roles?.length) return [];

  // `includes` is deliberately case-sensitive and does not trim values.
  return CRM_ROLES.filter((role) => roles.includes(role));
}

export function getEffectiveCrmRoles(
  roles: readonly string[] | null | undefined,
): CrmRole[] {
  const recognizedRoles = getRecognizedRoles(roles);
  return recognizedRoles.includes("System Manager")
    ? ["System Manager"]
    : recognizedRoles;
}

export function hasCrmRole(
  roles: readonly string[] | null | undefined,
  role: CrmRole,
): boolean {
  return roles?.includes(role) ?? false;
}

export function getRolesForRoute(path: string): readonly CrmRole[] {
  return ROUTE_ACCESS.find((rule) => rule.path === path)?.roles ?? [];
}

function isPathWithinRoute(path: string, pathname: string): boolean {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function findRouteAccessRule(pathname: string): RouteAccessRule | null {
  return (
    ROUTE_ACCESS.filter((rule) => isPathWithinRoute(rule.path, pathname)).sort(
      (a, b) => b.path.length - a.path.length,
    )[0] ?? null
  );
}

export function isProtectedDashboardPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/crm-chatbot" ||
    Object.values(ROLE_ROUTE_PATHS).some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  );
}

export function canAccessDashboardPath(
  pathname: string,
  roles: readonly string[] | null | undefined,
): boolean {
  if (!isProtectedDashboardPath(pathname)) return true;

  const rule = findRouteAccessRule(pathname);
  if (!rule) return false;

  return rule.roles.some((role) => getEffectiveCrmRoles(roles).includes(role));
}

export function getDefaultRouteForRoles(
  roles: readonly string[] | null | undefined,
): string {
  const recognizedRoles = getRecognizedRoles(roles);
  const primaryRole = ROLE_PRIORITY.find((role) =>
    recognizedRoles.includes(role),
  );
  return primaryRole ? ROLE_DEFAULT_ROUTES[primaryRole] : "/";
}
