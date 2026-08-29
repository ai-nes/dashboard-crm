export type HealthTone = "good" | "watch" | "critical";

export type RegionPerformance = {
  id: string;
  name: string;
  applications: number;
  enrollments: number;
  targetAchievement: number;
  conversion: number;
  applicationChange: number;
  enrollmentChange: number;
  activeAdvisors: number;
  capacity: number;
  health: HealthTone;
  capability: number;
};

export type MonthlyTrend = { month: string; applications: number; enrollments: number; previousApplications: number };
export type FunnelStage = { stage: string; north: number; central: number; south: number };
export type CapabilityRow = { label: string; north: HealthTone; central: HealthTone; south: HealthTone };
export type PriorityAction = { id: string; title: string; detail: string; region: string; priority: "Cao" | "Trung bình" | "Thấp"; tone: HealthTone };
