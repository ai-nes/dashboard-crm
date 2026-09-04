export type AdminTab =
  | "actions"
  | "action-types"
  | "timing-policies"
  | "rules"
  | "recommendations";

export type ActionTypeCode =
  | "CONTACT"
  | "INFORMATION"
  | "ENGAGEMENT"
  | "APPLICATION"
  | "CONVERSION"
  | "PARENT"
  | "RECOVERY"
  | "INTERNAL";

export type Channel = "NONE" | "CALL" | "EMAIL" | "MESSAGE";
export type ExecutionType = "MANUAL" | "AI_ASSISTED";
export type RecordStatus = "active" | "inactive" | "archived";
export type RuleStatus = "draft" | "published" | "archived";
export type Priority = "high" | "medium" | "low";
export type TriggerType = "event" | "relative" | "deadline" | "schedule";
export type RecommendationStatus = "new" | "acknowledged" | "deferred";

export interface MockActionType {
  code: ActionTypeCode;
  displayName: string;
  description: string;
  actionCount: number;
  sortOrder: number;
  status: RecordStatus;
  modified: string;
}

export interface MockAction {
  code: string;
  displayName: string;
  description: string;
  actionType: ActionTypeCode;
  channel: Channel;
  executionType: ExecutionType;
  allowedActors: string[];
  allowedTimeSlots: string[];
  requiresApproval: boolean;
  aiAllowed: boolean;
  enabled: boolean;
  modified: string;
}

export interface MockTimingPolicy {
  policyKey: string;
  displayName: string;
  triggerType: TriggerType;
  triggerLabel: string;
  timing: string;
  timeSlot: string;
  recurrence: string;
  status: RecordStatus;
  usedBy: number;
}

export interface MockRuleCondition {
  field: string;
  label: string;
  operator: string;
  value: string;
}

export interface MockRecommendationRule {
  ruleKey: string;
  displayName: string;
  description: string;
  status: RuleStatus;
  enabled: boolean;
  version: number;
  actionCode: string;
  actionLabel: string;
  priority: Priority;
  triggerType: TriggerType;
  triggerLabel: string;
  timingPolicy: string;
  conditions: MockRuleCondition[];
  cooldown: string;
  maxOccurrences: number;
  expiresAfter: string;
  modified: string;
}

export interface MockRecommendation {
  id: string;
  studentName: string;
  studentCode: string;
  lifecycleStage: string;
  ruleKey: string;
  ruleLabel: string;
  actionLabel: string;
  channel: Channel;
  priority: Priority;
  status: RecommendationStatus;
  confidence: number;
  expectedImpact: string;
  expiresAt: string;
  createdAt: string;
}

export interface SelectOption {
  id: string;
  label: string;
}

