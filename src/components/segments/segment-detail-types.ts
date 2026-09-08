import type { JourneyStage, SegmentFilterGroup } from "./segment-filter-config";

export interface SegmentStudent {
  id: string;
  name: string;
  school: string;
  phone: string;
  stage: JourneyStage;
}

export interface SegmentOverviewData {
  createdAt: string;
  groupLogic: "AND" | "OR";
  groups: SegmentFilterGroup[];
}
