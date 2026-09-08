import type { JourneyStage, SegmentFilterGroup } from "./segment-filter-config";

export interface SegmentStudent {
  id: string;
  code: string;
  name: string;
  phone: string;
  stage: JourneyStage;
  major: string;
  potentialScore: number;
  owner: string;
  nextAction: string;
}

export interface SegmentOverviewData {
  createdAt: string;
  groupLogic: "AND" | "OR";
  groups: SegmentFilterGroup[];
}
