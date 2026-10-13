import type {
  SchoolMarkerFilters,
  SchoolPriorityGroup,
  SchoolPotentialBand,
} from "./school-engagement-filter";
import type { HighSchoolItem } from "./types";

export interface SchoolMarkerFilterAvailability {
  potentialBands: Set<Exclude<SchoolPotentialBand, "all">>;
  schoolGroups: Set<SchoolPriorityGroup>;
}

export function filterMarketSchools(
  schools: HighSchoolItem[],
  filters: SchoolMarkerFilters,
  query = "",
): HighSchoolItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");

  return schools.filter((school) => {
    const matchesEngagement =
      filters.engagementIds.length === 0 ||
      school.participations.some((participation) =>
        filters.engagementIds.includes(participation.id),
      );
    const matchesSchoolGroup =
      filters.schoolGroups.length === 0 ||
      (school.classification !== null &&
        filters.schoolGroups.includes(school.classification));
    const matchesPotentialBand =
      filters.potentialBand === "all" ||
      (school.potentialScore !== null &&
        matchesPotentialBandValue(
          school.potentialScore,
          filters.potentialBand,
        ));
    const matchesName =
      !normalizedQuery ||
      school.name.toLocaleLowerCase("vi").includes(normalizedQuery);

    return (
      matchesEngagement &&
      matchesSchoolGroup &&
      matchesPotentialBand &&
      matchesName
    );
  });
}

export function getSchoolMarkerFilterAvailability(
  schools: HighSchoolItem[],
): SchoolMarkerFilterAvailability {
  const potentialBands = new Set<Exclude<SchoolPotentialBand, "all">>();
  const schoolGroups = new Set<SchoolPriorityGroup>();

  for (const school of schools) {
    if (school.classification !== null) schoolGroups.add(school.classification);
    if (school.potentialScore !== null) {
      for (const band of ["80-plus", "60-to-79", "under-60"] as const) {
        if (matchesPotentialBandValue(school.potentialScore, band)) {
          potentialBands.add(band);
        }
      }
    }
  }

  return { potentialBands, schoolGroups };
}

function matchesPotentialBandValue(
  score: number,
  band: Exclude<SchoolPotentialBand, "all">,
): boolean {
  if (band === "80-plus") return score >= 80;
  if (band === "60-to-79") return score >= 60 && score < 80;
  return score < 60;
}
