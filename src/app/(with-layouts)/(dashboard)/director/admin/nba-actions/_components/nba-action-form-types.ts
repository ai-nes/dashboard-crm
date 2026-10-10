import type {
  ActionChannel,
  ActionExecutionType,
  ActionTimeSlot,
} from "@/services/api/nba-actions";

export interface ActionFormState {
  code: string;
  displayName: string;
  actionType: string;
  description: string;
  purpose: string;
  defaultChannel: ActionChannel;
  allowedActors: string[];
  allowedTimeSlots: ActionTimeSlot[];
  requiresApproval: boolean;
  autoExecute: boolean;
  executionType: ActionExecutionType;
  aiAllowed: boolean;
  enabled: boolean;
  sortOrder: string;
}

export type ActionFormFieldSetter = <K extends keyof ActionFormState>(
  field: K,
  value: ActionFormState[K],
) => void;
