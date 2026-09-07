export interface LeadsReportItem {
  id: string;
  representative: {
    id: string;
    fullName: string;
    roleTitle: string;
    avatarUrl: string;
    emailAddress: string;
  };
  metrics: {
    dealsClosedCount: number;
    totalRevenueUsd: number;
    performanceTargetPercentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const leadsReportData: LeadsReportItem[] = [];
