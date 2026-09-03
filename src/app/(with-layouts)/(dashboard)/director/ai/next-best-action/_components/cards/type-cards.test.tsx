import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ACTION_TYPES, type ActionType } from "../types";
import type { NbaPackageSeed, RecommendedAction } from "../types";
import { CARD_SPECS } from "./card-specs";
import { ACTION_CARD_REGISTRY } from "./registry";

/** A seed carrying a value for every field in the v2 superset. */
const FULL_SEED: NbaPackageSeed = {
  opening: "seed-opening",
  talkingPoints: ["seed-talkingPoints"],
  questions: ["seed-questions"],
  objections: ["seed-objections"],
  desiredOutcome: "seed-desiredOutcome",
  nextStep: "seed-nextStep",
  subject: "seed-subject",
  body: "seed-body",
  cta: "seed-cta",
  channel: "seed-channel",
  keyPoints: ["seed-keyPoints"],
  topic: "seed-topic",
  agenda: ["seed-agenda"],
  guidancePoints: ["seed-guidancePoints"],
  concernsToAddress: ["seed-concernsToAddress"],
  purpose: "seed-purpose",
  attendeesHint: ["seed-attendeesHint"],
  prepChecklist: ["seed-prepChecklist"],
  whyRelevant: "seed-whyRelevant",
  inviteMessage: "seed-inviteMessage",
  followUpStep: "seed-followUpStep",
  visitGoal: "seed-visitGoal",
  itineraryPoints: ["seed-itineraryPoints"],
  logisticsNotes: "seed-logisticsNotes",
  whoToInvolve: ["seed-whoToInvolve"],
  missingDocuments: ["seed-missingDocuments"],
  deadline: "seed-deadline",
  requestMessage: "seed-requestMessage",
  consequenceIfMissing: "seed-consequenceIfMissing",
  blockingSteps: ["seed-blockingSteps"],
  supportActions: ["seed-supportActions"],
  reason: "seed-reason",
  sensitivities: ["seed-sensitivities"],
  toRole: "seed-toRole",
  contextSummary: "seed-contextSummary",
  openItems: ["seed-openItems"],
  expectedResponseTime: "seed-expectedResponseTime",
};

function actionFor(type: ActionType): RecommendedAction {
  return {
    id: "REC-1",
    studentName: "A",
    initials: "A",
    school: "X",
    interest: "Y",
    recommendation: "R",
    summary: "S",
    dueLabel: "D",
    status: "today",
    priority: "high",
    impact: "I",
    confidence: 70,
    suggestedAssignee: "B",
    evidence: [],
    talkingPoints: [],
    recentActivity: [],
    actionType: type,
    disposition: "ACT",
    packageSeed: FULL_SEED,
  };
}

describe("typed action cards render only their own package fields", () => {
  for (const type of ACTION_TYPES) {
    it(`${type} shows its labels and no field from another type`, () => {
      const Card = ACTION_CARD_REGISTRY[type];
      const html = renderToStaticMarkup(<Card action={actionFor(type)} />);

      const ownKeys = new Set(CARD_SPECS[type].map((spec) => spec.key));
      for (const spec of CARD_SPECS[type]) {
        expect(html).toContain(spec.label);
        expect(html).toContain(`seed-${String(spec.key)}`);
      }
      // no value from a field this type does not own
      for (const key of Object.keys(FULL_SEED)) {
        if (!ownKeys.has(key as keyof NbaPackageSeed)) {
          expect(html).not.toContain(`seed-${key}`);
        }
      }
    });
  }
});
