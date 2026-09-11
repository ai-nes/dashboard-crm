import type {
  CrmFactMetadata,
  CrmFactType,
  CrmRuleCondition,
  CrmRuleConditionLeaf,
  CrmRuleConditionNode,
  CrmRuleOperator,
  CrmRuleScalar,
} from "@/services/api/rules-config";

export type RuleFilterLogic = "all" | "any";

export interface RuleFilterCondition {
  id: string;
  fact: string;
  op: CrmRuleOperator;
  value?: CrmRuleScalar | CrmRuleScalar[] | null;
  factRef?: string;
}

export interface RuleFilterGroup {
  id: string;
  logic: RuleFilterLogic;
  negate: boolean;
  conditions: RuleFilterCondition[];
}

export interface RuleConditionDraft {
  groups: RuleFilterGroup[];
  logic: RuleFilterLogic;
}

let idCounter = 0;
function createId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export const RULE_OPERATORS: Array<{
  value: CrmRuleOperator;
  label: string;
  requiresValue: boolean;
}> = [
  { value: "eq", label: "bằng", requiresValue: true },
  { value: "neq", label: "khác", requiresValue: true },
  { value: "in", label: "nằm trong", requiresValue: true },
  { value: "not_in", label: "không nằm trong", requiresValue: true },
  { value: "exists", label: "có dữ liệu", requiresValue: false },
  { value: "gt", label: "lớn hơn", requiresValue: true },
  { value: "gte", label: "lớn hơn hoặc bằng", requiresValue: true },
  { value: "lt", label: "nhỏ hơn", requiresValue: true },
  { value: "lte", label: "nhỏ hơn hoặc bằng", requiresValue: true },
  { value: "before", label: "trước", requiresValue: true },
  { value: "after", label: "sau", requiresValue: true },
  { value: "is_true", label: "đúng", requiresValue: false },
  { value: "is_false", label: "sai", requiresValue: false },
];

export const RULE_FACT_LABELS: Record<string, string> = {
  "student.stage": "Giai đoạn học sinh",
  "student.is_opted_out": "Học sinh đã từ chối liên hệ",
  "student.email_bounced": "Email bị trả lại",
  "application.status": "Trạng thái hồ sơ",
  "application.document_total": "Tổng số hồ sơ yêu cầu",
  "application.document_completed": "Số hồ sơ đã hoàn thành",
  "application.deadline": "Hạn nộp hồ sơ",
  "score.source_revision": "Phiên bản điểm số",
  "activity.last_contact_at": "Lần liên hệ gần nhất",
  "requested_action.code": "Mã hành động yêu cầu",
  "requested_action.category": "Nhóm hành động yêu cầu",
  "requested_action.channel": "Kênh hành động yêu cầu",
  "system.now": "Thời điểm hiện tại",
};

export function factLabel(fact: string): string {
  return RULE_FACT_LABELS[fact] ?? fact;
}

export function operatorRequiresValue(operator: CrmRuleOperator): boolean {
  return RULE_OPERATORS.find((item) => item.value === operator)?.requiresValue ?? true;
}

const FACT_REF_OPERATORS = new Set<CrmRuleOperator>(["eq", "neq", "gt", "gte", "lt", "lte", "before", "after"]);

export function operatorSupportsFactRef(operator: CrmRuleOperator): boolean {
  return FACT_REF_OPERATORS.has(operator);
}

export function operatorLabel(operator: CrmRuleOperator): string {
  return RULE_OPERATORS.find((item) => item.value === operator)?.label ?? operator;
}

export function getFactType(fact: string, facts: CrmFactMetadata[]): CrmFactType {
  return facts.find((item) => item.fact === fact)?.type ?? "string";
}

export function readConditionValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

export function parseConditionValueInput(
  raw: string,
  type: CrmFactType,
  operator: CrmRuleOperator,
): CrmRuleScalar | CrmRuleScalar[] {
  if (operator === "in" || operator === "not_in") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (type === "number") return raw === "" ? "" : Number(raw);
  if (type === "boolean") return raw === "true";
  return raw;
}

export function conditionValueLabel(condition: RuleFilterCondition, facts: CrmFactMetadata[]): string {
  if (!operatorRequiresValue(condition.op)) return "";
  if (condition.factRef) return factLabel(condition.factRef);
  const type = getFactType(condition.fact, facts);
  if (type === "boolean") return readConditionValue(condition.value) === "false" ? "Sai" : "Đúng";
  return readConditionValue(condition.value);
}

export function isConditionComplete(condition: RuleFilterCondition): boolean {
  if (!condition.fact || !condition.op) return false;
  if (!operatorRequiresValue(condition.op)) return true;
  if (condition.factRef) return true;
  if (Array.isArray(condition.value)) return condition.value.length > 0;
  return condition.value !== undefined && condition.value !== null && condition.value !== "";
}

export function createCondition(fact: string, op: CrmRuleOperator = "eq"): RuleFilterCondition {
  return { id: createId("rule-condition"), fact, op, value: "" };
}

export function createGroup(fact: string): RuleFilterGroup {
  return { id: createId("rule-group"), logic: "all", negate: false, conditions: [createCondition(fact)] };
}

function leafToJSON(condition: RuleFilterCondition): CrmRuleConditionLeaf {
  const requiresValue = operatorRequiresValue(condition.op);
  if (!requiresValue) return { fact: condition.fact, op: condition.op };
  if (condition.factRef) return { fact: condition.fact, op: condition.op, factRef: condition.factRef };
  return { fact: condition.fact, op: condition.op, value: condition.value };
}

function groupToNode(group: RuleFilterGroup): CrmRuleConditionNode {
  const leaves = group.conditions.map(leafToJSON);
  const inner: CrmRuleConditionNode = leaves.length === 1 ? leaves[0] : { [group.logic]: leaves };
  return group.negate ? { not: inner } : inner;
}

export function draftToCondition(draft: RuleConditionDraft): CrmRuleCondition {
  const validGroups = draft.groups.filter((group) => group.conditions.length > 0);
  if (validGroups.length === 0) return {};
  if (validGroups.length === 1) return groupToNode(validGroups[0]);
  return { [draft.logic]: validGroups.map(groupToNode) };
}

export function hasCondition(condition: CrmRuleCondition): boolean {
  return Boolean((condition.fact && condition.op) || condition.all?.length || condition.any?.length || condition.not);
}

export function isDraftComplete(draft: RuleConditionDraft): boolean {
  const validGroups = draft.groups.filter((group) => group.conditions.length > 0);
  return validGroups.length > 0 && validGroups.every((group) => group.conditions.every(isConditionComplete));
}

function isLeafNode(node: CrmRuleConditionNode): node is CrmRuleConditionLeaf {
  return (
    typeof node.fact === "string" &&
    typeof node.op === "string" &&
    !node.all &&
    !node.any &&
    !node.not
  );
}

function parseLeaf(node: CrmRuleConditionLeaf): RuleFilterCondition {
  return {
    id: createId("rule-condition"),
    fact: node.fact,
    op: node.op,
    value: node.value,
    ...(node.factRef ? { factRef: node.factRef } : {}),
  };
}

function parseLeafGroup(
  node: CrmRuleConditionNode,
): { logic: RuleFilterLogic; conditions: RuleFilterCondition[] } | null {
  if (isLeafNode(node)) return { logic: "all", conditions: [parseLeaf(node)] };
  const keys = Object.keys(node) as Array<keyof CrmRuleCondition>;
  if (keys.length === 1 && (keys[0] === "all" || keys[0] === "any")) {
    const logic = keys[0] as RuleFilterLogic;
    const children = node[logic] ?? [];
    if (children.length === 0) return null;
    if (!children.every(isLeafNode)) return null;
    return { logic, conditions: children.map(parseLeaf) };
  }
  return null;
}

function parseGroup(node: CrmRuleConditionNode): RuleFilterGroup | null {
  const keys = Object.keys(node);
  if (keys.length === 0) return null;
  if (keys.length === 1 && keys[0] === "not") {
    const inner = node.not;
    if (!inner) return null;
    const parsed = parseLeafGroup(inner);
    if (!parsed) return null;
    return { id: createId("rule-group"), logic: parsed.logic, negate: true, conditions: parsed.conditions };
  }
  const parsed = parseLeafGroup(node);
  if (!parsed) return null;
  return { id: createId("rule-group"), logic: parsed.logic, negate: false, conditions: parsed.conditions };
}

/**
 * Best-effort mapping from the backend's fully recursive condition tree to the
 * flat "groups of leaves" shape the visual builder can edit. Returns null when
 * the stored condition uses a capability the visual builder cannot represent
 * (nested subgroups, all+any as siblings, deeper nesting) — callers must fall
 * back to a raw JSON editor rather than risk truncating it. Cross-fact
 * `factRef` leaves ARE supported natively (see `RuleFilterCondition.factRef`).
 */
export function conditionToDraft(condition: CrmRuleCondition | undefined | null): RuleConditionDraft | null {
  if (!condition || Object.keys(condition).length === 0) return { groups: [], logic: "all" };
  const keys = Object.keys(condition);
  if (keys.length === 1 && (keys[0] === "all" || keys[0] === "any")) {
    const logic = keys[0] as RuleFilterLogic;
    const children = condition[logic] ?? [];
    if (children.length === 0) return { groups: [], logic };
    const groups = children.map(parseGroup);
    if (groups.some((group) => group === null)) return null;
    return { groups: groups as RuleFilterGroup[], logic };
  }
  const singleGroup = parseGroup(condition);
  if (!singleGroup) return null;
  return { groups: [singleGroup], logic: "all" };
}
