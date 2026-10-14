import type { HighSchoolItem, ProvinceMetrics, RegionKey } from "./types";

export const SCHOOL_MAP_BOUNDS = {
  minLongitude: 101.8,
  maxLongitude: 110.2,
  minLatitude: 8.2,
  maxLatitude: 23.6,
};

export interface LocatedSchoolMapEntry {
  provinceCode: string;
  provinceName: string;
  school: HighSchoolItem;
  coordinates: [number, number];
}

export interface SchoolMapCoverage {
  matchingSchoolCount: number;
  locatedSchoolCount: number;
  unlocatedSchoolCount: number;
  locatedSchools: LocatedSchoolMapEntry[];
}

export function getSchoolMapCoverage(
  provinces: ProvinceMetrics[],
  region: RegionKey,
): SchoolMapCoverage {
  const scopedProvinces = provinces.filter(
    (province) => region === "all" || province.regionKey === region,
  );
  const matchingSchoolCount = scopedProvinces.reduce(
    (total, province) => total + province.highSchools.length,
    0,
  );
  const locatedSchools = scopedProvinces.flatMap((province) =>
    province.highSchools.flatMap((school) => {
      const coordinates = school.coordinates;
      if (
        !coordinates ||
        !Number.isFinite(coordinates.latitude) ||
        !Number.isFinite(coordinates.longitude) ||
        coordinates.latitude < SCHOOL_MAP_BOUNDS.minLatitude ||
        coordinates.latitude > SCHOOL_MAP_BOUNDS.maxLatitude ||
        coordinates.longitude < SCHOOL_MAP_BOUNDS.minLongitude ||
        coordinates.longitude > SCHOOL_MAP_BOUNDS.maxLongitude
      ) {
        return [];
      }

      return [
        {
          provinceCode: province.code,
          provinceName: province.name,
          school,
          coordinates: [coordinates.longitude, coordinates.latitude] as [
            number,
            number,
          ],
        },
      ];
    }),
  );

  return {
    matchingSchoolCount,
    locatedSchoolCount: locatedSchools.length,
    unlocatedSchoolCount: matchingSchoolCount - locatedSchools.length,
    locatedSchools,
  };
}
