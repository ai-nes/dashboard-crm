import type { SchoolClassification } from "@/services/api/schools/types";

export const SCHOOL_CLASSIFICATION_VISUALS: Record<
  SchoolClassification,
  {
    badgeColor: "success" | "blue" | "warning" | "gray";
    markerColor: string;
    markerRadius: number;
    markerCoreRadius: number;
  }
> = {
  "Trọng điểm": {
    badgeColor: "success",
    markerColor: "var(--success-500)",
    markerRadius: 7,
    markerCoreRadius: 4,
  },
  "Mở rộng": {
    badgeColor: "blue",
    markerColor: "var(--info-500)",
    markerRadius: 6.5,
    markerCoreRadius: 3.6,
  },
  "Duy trì": {
    badgeColor: "warning",
    markerColor: "var(--warning-500)",
    markerRadius: 6,
    markerCoreRadius: 3.3,
  },
  "Sàng lọc": {
    badgeColor: "gray",
    markerColor: "var(--foreground-soft-500)",
    markerRadius: 5.5,
    markerCoreRadius: 3,
  },
};
