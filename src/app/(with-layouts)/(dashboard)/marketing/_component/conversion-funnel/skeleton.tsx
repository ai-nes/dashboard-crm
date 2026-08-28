import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function ConversionFunnelSkeleton() {
  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-3.5 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded" />
            <Skeleton className="h-3.5 w-12 shrink-0 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
