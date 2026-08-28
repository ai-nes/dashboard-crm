"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getTopCountriesData } from "@/services/api/analytics";
import { useQuery } from "@tanstack/react-query";
import TopCountriesSkeleton from "./skeleton";
import { mapTopCountriesResponse } from "./utils";

export default function TopCountries() {
  const { data, isLoading } = useQuery({
    queryKey: ["top-countries"],
    queryFn: getTopCountriesData,
  });

  if (isLoading || !data) {
    return <TopCountriesSkeleton />;
  }

  const countries = mapTopCountriesResponse(data);

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle className="leading-6 font-semibold text-text-primary">Top Countries</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col p-0">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="block text-sm leading-5 font-medium text-text-tertiary">Country</span>
          <span className="block text-sm leading-5 font-medium text-text-tertiary">Visitors</span>
        </div>

        <div className="flex flex-col gap-2">
          {countries.map((country) => (
            <div key={country.id} className="flex items-center justify-between">
              <div className="flex h-8 max-w-[90%] flex-1 items-center">
                <div
                  className="flex h-full items-center rounded bg-background-gray-secondary_alt px-3"
                  style={{ width: `${country.percentage}%` }}
                >
                  <span className="text-sm font-medium text-text-primary">
                    {country.name} · {country.countryCode}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-text-primary">{country.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
