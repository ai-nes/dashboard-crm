import type { FC } from "react";

import type { NbaPackageSeed, RecommendedAction } from "../types";

export interface ActionCardProps {
  action: RecommendedAction;
}

export type ActionCard = FC<ActionCardProps>;

/** One rendered row of a typed package. */
export interface FieldSpec {
  /** Key on {@link NbaPackageSeed}. */
  key: keyof NbaPackageSeed;
  /** End-user heading (Vietnamese). */
  label: string;
  /** `prose` → single paragraph; `list` → bulleted list. */
  kind: "prose" | "list";
}
