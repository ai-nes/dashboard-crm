import type {
  CloneCrmRuleVersionPayload,
  CrmRule,
  CrmRuleVersion,
  ListCrmRulesParams,
  ListCrmRulesResponse,
} from "./types";

type CloneVersion = (
  payload: CloneCrmRuleVersionPayload,
) => Promise<CrmRuleVersion>;
type ListRules = (
  params: ListCrmRulesParams,
) => Promise<ListCrmRulesResponse>;
type RuleDraftClonePayload = CloneCrmRuleVersionPayload & {
  versionName: string;
};

export class RuleDraftCloneLookupError extends Error {
  constructor(readonly draftVersion: CrmRuleVersion) {
    super("Đã tạo bản nháp nhưng không tải được Rule tương ứng.");
    this.name = "RuleDraftCloneLookupError";
  }
}

export function buildRuleDraftClonePayload(
  source: CrmRuleVersion,
  now = Date.now(),
  random = Math.random(),
): RuleDraftClonePayload {
  const token = `${now.toString(36).toUpperCase()}-${Math.floor(
    Math.max(0, Math.min(random, 0.999999999)) * 36 ** 5,
  )
    .toString(36)
    .toUpperCase()
    .padStart(5, "0")}`;
  const idSuffix = `-DRAFT-${token}`;
  const nameSuffix = ` (Draft ${token})`;

  return {
    sourceName: source.name,
    versionId: `${source.versionId.trim().toUpperCase().slice(0, 64 - idSuffix.length)}${idSuffix}`,
    versionName: `${source.versionName.slice(0, 140 - nameSuffix.length)}${nameSuffix}`,
    description: source.description ?? "",
  };
}

export async function cloneRuleIntoDraft(
  source: CrmRuleVersion,
  rule: CrmRule,
  cloneVersion: CloneVersion,
  listRules: ListRules,
): Promise<{ draftVersion: CrmRuleVersion; draftRule: CrmRule }> {
  const draftVersion = await cloneVersion(buildRuleDraftClonePayload(source));

  try {
    const result = await listRules({
      versionName: draftVersion.name,
      search: rule.ruleId,
      start: 0,
      pageLength: 200,
    });
    const draftRule = result.rules.find((candidate) => candidate.ruleId === rule.ruleId);
    if (!draftRule) throw new Error("Rule not found in cloned version");

    return { draftVersion, draftRule };
  } catch {
    throw new RuleDraftCloneLookupError(draftVersion);
  }
}
