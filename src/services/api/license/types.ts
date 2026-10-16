/** Mirrors `LicenseState` in crm-backend `license.service.ts`. */
export type LicenseState =
  | "DISABLED"
  | "NOT_ACTIVATED"
  | "ACTIVE"
  | "LEASE_EXPIRED"
  | "LICENSE_REVOKED"
  | "LICENSE_SUSPENDED"
  | "LICENSE_EXPIRED";

export interface LicenseStatus {
  status: LicenseState;
  installationId?: string;
  leaseExpiresAt?: string;
  /** null for a Lifetime license. */
  licenseExpiresAt?: string | null;
}
