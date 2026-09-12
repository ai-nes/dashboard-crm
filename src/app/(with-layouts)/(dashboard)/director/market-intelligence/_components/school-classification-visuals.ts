import type { SchoolClassification } from "@/services/api/schools/types";

export const SCHOOL_CLASSIFICATION_VISUALS: Record<
  SchoolClassification,
  {
    badgeColor: "success" | "blue" | "warning" | "orange" | "gray";
    markerColor: string;
    markerRadius: number;
    markerCoreRadius: number;
  }
> = {
  "Trọng điểm": {
    badgeColor: "orange",
    markerColor: "var(--badge-orange-icon-color)",
    markerRadius: 5.25,
    markerCoreRadius: 3.25,
  },
  "Mở rộng": {
    badgeColor: "blue",
    markerColor: "var(--info-500)",
    markerRadius: 4.75,
    markerCoreRadius: 3,
  },
  "Duy trì": {
    badgeColor: "warning",
    markerColor: "var(--warning-500)",
    markerRadius: 4.5,
    markerCoreRadius: 2.75,
  },
  "Sàng lọc": {
    badgeColor: "gray",
    markerColor: "var(--icon-tertiary)",
    markerRadius: 3,
    markerCoreRadius: 1.75,
  },
};
