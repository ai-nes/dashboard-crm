import type { TopCountriesRawResponse } from "@/services/api/analytics";

export type { TopCountriesRawResponse };

export interface TopCountryViewModel {
  id: string;
  name: string;
  countryCode: string;
  value: string;
  percentage: number;
}
