import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function RecentActivitiesSkeleton() {
  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="mb-2 h-3.5 w-full max-w-64 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
