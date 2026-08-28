import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function AudienceInsightsSkeleton() {
  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Who is engaging with your campaigns</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Skeleton className="h-8 flex-1 rounded" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
