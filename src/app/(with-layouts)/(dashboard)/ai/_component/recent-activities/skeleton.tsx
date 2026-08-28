import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function RecentActivitiesSkeleton() {
  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col p-0">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 border-b border-border-primary py-3.5 first:pt-0 last:border-0 last:pb-0"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-1.5 h-3.5 w-40 rounded-full" />
              <Skeleton className="h-3 w-56 rounded-full" />
            </div>
            <Skeleton className="h-3 w-10 shrink-0 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
