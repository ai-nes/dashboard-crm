/**
 * Canonical CRM roles returned by `crm.api.session.me`.
 *
 * Role checks intentionally use exact string matches. Do not normalize casing,
 * trim values, or fall back to `crm_profile` here: the backend role name is the
 * contract for dashboard navigation.
 */
export const CRM_ROLES = [
  "CTV Sale",
  "Sale",
  "Lead Sale",
  "Promoter",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "Administrator",
] as const;

export type CrmRole = (typeof CRM_ROLES)[number];

/** Frappe roles used for technical access, not CRM permission profiles. */
export const FRAPPE_TECHNICAL_ROLES = ["System Manager"] as const;

export type FrappeTechnicalRole = (typeof FRAPPE_TECHNICAL_ROLES)[number];
export type DashboardRole = CrmRole | FrappeTechnicalRole;

const DASHBOARD_ROLES = [
  ...CRM_ROLES,
  ...FRAPPE_TECHNICAL_ROLES,
] as const satisfies readonly DashboardRole[];

const CUSTOMER_DATA_ROLES = [
  "Sale",
  "CTV Sale",
  "Lead Sale",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const AI_CENTER_ROLES = [
  "Lead Sale",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "Administrator",
  "System Manager",
] as const satisfies readonly DashboardRole[];

const DEMOGRAPHICS_ROLES = AI_CENTER_ROLES.filter(
  (role) => role !== "System Manager",
);

const OVERVIEW_ACTION_ROLES = [
  "Sale",
  "CTV Sale",
  "Lead Sale",
  "Promoter",
  "Lead Promoter",
  "Admissions Director",
  "Administrator",
  "System Manager",
] as const satisfies readonly DashboardRole[];

const SCHOOL_INTELLIGENCE_ROLES = [
  "Sale",
  "CTV Sale",
  "Lead Sale",
  "Promoter",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const REGIONAL_PERFORMANCE_ROLES = [
  "Lead Sale",
  "Lead Promoter",
  "Lead Marketing",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const MARKETING_ANALYTICS_ROLES = [
  "Lead Sale",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const ACTIVITY_CAMPAIGN_ROLES = [
  "Promoter",
  "Lead Promoter",
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const SLA_ROLES = [
  "Sale",
  "Lead Sale",
  "Promoter",
  "Lead Promoter",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const ALERT_ROLES = [
  ...SLA_ROLES,
  "System Manager",
] as const satisfies readonly DashboardRole[];

const DATA_HEALTH_ROLES = [
  "Admissions Director",
  "Administrator",
  "System Manager",
] as const satisfies readonly DashboardRole[];

const NBA_ACTIONS_READ_ROLES = [
  "System Manager",
] as const satisfies readonly DashboardRole[];

const CAMPAIGN_INTELLIGENCE_ROLES = [
  "Marketing",
  "Lead Marketing",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const SCHOOL_FIELD_ACTIVITY_ROLES = [
  "Promoter",
  "Lead Promoter",
  "Admissions Director",
  "Administrator",
] as const satisfies readonly CrmRole[];

const NON_SYSTEM_MANAGER_ROLES = CRM_ROLES;
const TEAM_MANAGEMENT_ROLES = [
  "Sale",
  "CTV Sale",
  "Lead Sale",
  "Admissions Director",
  "Administrator",
  "System Manager",
] as const satisfies readonly DashboardRole[];

/**
 * Public workspace routes. A workspace is the stable entry point for a role;
 * feature screens can be added below it without changing the login contract.
 */
export const ROLE_ROUTE_ROLES = {
  director: ["Admissions Director", "Administrator"],
  admin: ["System Manager"],
  marketing: ["Marketing", "Lead Marketing"],
  sale: ["Sale"],
  "ctv-sale": ["CTV Sale"],
  "lead-sale": ["Lead Sale"],
} as const satisfies Record<string, readonly DashboardRole[]>;

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
  roles: readonly DashboardRole[];
}

/**
 * Route-level permissions from docs/rbac-permission-matrix.md.
 * More specific paths are resolved before their parent path, so
 * `/director/ai/next-best-action` can differ from `/director/ai`.
 */
export const ROUTE_ACCESS: readonly RouteAccessRule[] = [
  { path: "/", roles: DASHBOARD_ROLES },
  { path: "/crm-chatbot", roles: NON_SYSTEM_MANAGER_ROLES },
  { path: "/director", roles: ROLE_ROUTE_ROLES.director },
  { path: "/admin", roles: ROLE_ROUTE_ROLES.admin },
  { path: "/marketing", roles: ROLE_ROUTE_ROLES.marketing },
  { path: "/sale", roles: ROLE_ROUTE_ROLES.sale },
  { path: "/sale/next-best-action", roles: ROLE_ROUTE_ROLES.sale },
  { path: "/sale/students", roles: ROLE_ROUTE_ROLES.sale },
  { path: "/sale/tasks", roles: ROLE_ROUTE_ROLES.sale },
  { path: "/sale/demographics", roles: ROLE_ROUTE_ROLES.sale },
  { path: "/ctv-sale", roles: ROLE_ROUTE_ROLES["ctv-sale"] },
  { path: "/ctv-sale/results", roles: ROLE_ROUTE_ROLES["ctv-sale"] },
  { path: "/ctv-sale/students", roles: ROLE_ROUTE_ROLES["ctv-sale"] },
  { path: "/ctv-sale/tasks", roles: ROLE_ROUTE_ROLES["ctv-sale"] },
  { path: "/ctv-sale/next-best-action", roles: ROLE_ROUTE_ROLES["ctv-sale"] },
  { path: "/lead-sale", roles: ROLE_ROUTE_ROLES["lead-sale"] },
  {
    path: "/lead-sale/next-best-action",
    roles: ROLE_ROUTE_ROLES["lead-sale"],
  },
  { path: "/lead-sale/students", roles: ROLE_ROUTE_ROLES["lead-sale"] },
  { path: "/lead-sale/leads", roles: ROLE_ROUTE_ROLES["lead-sale"] },
  { path: "/lead-sale/tasks", roles: ROLE_ROUTE_ROLES["lead-sale"] },
  { path: "/lead-sale/demographics", roles: ROLE_ROUTE_ROLES["lead-sale"] },
  {
    path: "/lead-sale/student-assignment",
    roles: ROLE_ROUTE_ROLES["lead-sale"],
  },
  {
    path: "/lead-sale/assignment-history",
    roles: ROLE_ROUTE_ROLES["lead-sale"],
  },
  {
    path: "/lead-sale/team-management",
    roles: TEAM_MANAGEMENT_ROLES,
  },
  { path: "/lead-sale/campaigns", roles: ROLE_ROUTE_ROLES["lead-sale"] },
  { path: "/director/ai/next-best-action", roles: OVERVIEW_ACTION_ROLES },
  { path: "/director/ai", roles: AI_CENTER_ROLES },
  { path: "/director/demographics", roles: DEMOGRAPHICS_ROLES },
  { path: "/director/students", roles: CUSTOMER_DATA_ROLES },
  { path: "/director/leads", roles: CUSTOMER_DATA_ROLES },
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
  {
    path: "/director/admin/action-recommendations",
    roles: NBA_ACTIONS_READ_ROLES,
  },
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
 * The first matching role is only used for a fallback destination. System
 * Manager remains an internal technical role and keeps its small administration
 * workspace isolated from CRM business roles.
 */
const ROLE_PRIORITY: readonly DashboardRole[] = [
  "System Manager",
  "Administrator",
  "Admissions Director",
  "Lead Marketing",
  "Marketing",
  "Lead Promoter",
  "Promoter",
  "Lead Sale",
  "Sale",
  "CTV Sale",
];

const ROLE_DEFAULT_ROUTES: Record<DashboardRole, string> = {
  Sale: ROLE_ROUTE_PATHS.sale,
  "CTV Sale": ROLE_ROUTE_PATHS["ctv-sale"],
  "Lead Sale": ROLE_ROUTE_PATHS["lead-sale"],
  Promoter: "/director/school-field-activity",
  "Lead Promoter": "/director/school-field-activity",
  Marketing: ROLE_ROUTE_PATHS.marketing,
  "Lead Marketing": ROLE_ROUTE_PATHS.marketing,
  "Admissions Director": ROLE_ROUTE_PATHS.director,
  Administrator: ROLE_ROUTE_PATHS.director,
  "System Manager": ROLE_ROUTE_PATHS.admin,
};

export function getRecognizedRoles(
  roles: readonly string[] | null | undefined,
): CrmRole[] {
  if (!roles?.length) return [];

  // `includes` is deliberately case-sensitive and does not trim values.
  return CRM_ROLES.filter((role) => roles.includes(role));
}

export function getRecognizedDashboardRoles(
  roles: readonly string[] | null | undefined,
): DashboardRole[] {
  if (!roles?.length) return [];

  return [
    ...getRecognizedRoles(roles),
    ...FRAPPE_TECHNICAL_ROLES.filter((role) => roles.includes(role)),
  ];
}

export function getEffectiveDashboardRoles(
  roles: readonly string[] | null | undefined,
): DashboardRole[] {
  const recognizedRoles = getRecognizedDashboardRoles(roles);
  return recognizedRoles.includes("System Manager")
    ? ["System Manager"]
    : recognizedRoles;
}

export function getEffectiveCrmRoles(
  roles: readonly string[] | null | undefined,
): DashboardRole[] {
  return getEffectiveDashboardRoles(roles);
}

export function hasCrmRole(
  roles: readonly string[] | null | undefined,
  role: CrmRole,
): boolean {
  return roles?.includes(role) ?? false;
}

export function hasFrappeTechnicalRole(
  roles: readonly string[] | null | undefined,
  role: FrappeTechnicalRole,
): boolean {
  return roles?.includes(role) ?? false;
}

export function getRolesForRoute(path: string): readonly DashboardRole[] {
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

  return rule.roles.some((role) =>
    getEffectiveDashboardRoles(roles).includes(role),
  );
}

export function getDefaultRouteForRoles(
  roles: readonly string[] | null | undefined,
): string {
  const recognizedRoles = getRecognizedDashboardRoles(roles);
  const primaryRole = ROLE_PRIORITY.find((role) =>
    recognizedRoles.includes(role),
  );
  return primaryRole ? ROLE_DEFAULT_ROUTES[primaryRole] : "/";
}
