export interface CurrentUser {
  /** Frappe User name — usually the email address. */
  id: string;
  email: string;
  fullName: string;
  /** Absolute URL to the profile picture, or undefined when none is set. */
  avatarUrl?: string;
}
