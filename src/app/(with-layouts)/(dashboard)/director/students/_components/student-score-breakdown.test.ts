import { describe, expect, it } from "vitest";

import type { StudentScoreContext } from "@/services/api/student-score-context";

import { buildStudentScoreBreakdown } from "./student-score-breakdown";

describe("student score breakdown", () => {
  it("maps Fit, Engagement and Intent scores with percentage weights", () => {
    const context: StudentScoreContext = {
      student: "CRM-STUDENT-1",
      histories: [],
      latest: {
        name: "SCH-1",
        student: "CRM-STUDENT-1",
        scoreTemplate: "SCT-1",
        scoringTime: null,
        scoringDate: null,
        fitScore: 40,
        engagementScore: 30,
        intentScore: 30,
        timeDecayScore: null,
        negativeScore: null,
        finalScore: 82,
        scoreChange: 13,
        triggeredByDoctype: null,
        triggeredBy: null,
        details: [],
      },
      intents: [],
      template: {
        name: "SCT-1",
        templateName: "Default",
        status: "Active",
        fitWeight: 0.4,
        engagementWeight: 0.3,
        intentWeight: 0.3,
        startTime: null,
        endTime: null,
      },
    };

    expect(buildStudentScoreBreakdown(context, 82)).toMatchObject({
      overallScore: 82,
      items: [
        { id: "fit", label: "Fit", score: 40, weight: 40 },
        { id: "engagement", label: "Engagement", score: 30, weight: 30 },
        { id: "intent", label: "Intent", score: 30, weight: 30 },
      ],
    });
  });

  it("does not render a breakdown without a latest score history", () => {
    expect(
      buildStudentScoreBreakdown(
        {
          student: "CRM-STUDENT-1",
          histories: [],
          latest: null,
          intents: [],
          template: null,
        },
        82,
      ),
    ).toBeNull();
  });
});
