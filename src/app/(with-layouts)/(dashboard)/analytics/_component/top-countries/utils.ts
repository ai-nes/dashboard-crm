import type { TopCountriesRawResponse } from "@/services/api/analytics";
import { formatNumber } from "@/utils/format-number";

import type { TopCountryViewModel } from "./types";

export function mapTopCountriesResponse(response: TopCountriesRawResponse): TopCountryViewModel[] {
  return response.countries.map((item) => ({
    id: item.id,
    name: item.country_name,
    countryCode: item.country_code,
    value: formatNumber({ value: item.visitor_count }),
    percentage: item.percentage,
  }));
}
