export interface StudentScoreHistoryDetail {
  category: string | null;
  ruleId: string | null;
  signal: string | null;
  score: number;
  reason: string | null;
}

export interface StudentScoreHistory {
  name: string;
  student: string | null;
  scoreTemplate: string | null;
  scoringTime: string | null;
  scoringDate: string | null;
  fitScore: number | null;
  engagementScore: number | null;
  intentScore: number | null;
  timeDecayScore: number | null;
  negativeScore: number | null;
  finalScore: number | null;
  scoreChange: number | null;
  triggeredByDoctype: string | null;
  triggeredBy: string | null;
  details: StudentScoreHistoryDetail[];
}

export interface StudentScoreIntent {
  name: string;
  interaction: string | null;
  intentType: string | null;
  intentRole: string | null;
  importance: string | null;
  confidence: number | null;
  notes: string | null;
  modified: string | null;
}

export interface StudentScoreTemplate {
  name: string;
  templateName: string;
  status: string | null;
  fitWeight: number | null;
  engagementWeight: number | null;
  intentWeight: number | null;
  startTime: string | null;
  endTime: string | null;
}

export interface StudentScoreContext {
  student: string | null;
  histories: StudentScoreHistory[];
  latest: StudentScoreHistory | null;
  intents: StudentScoreIntent[];
  template: StudentScoreTemplate | null;
}
