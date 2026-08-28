import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";

export default function UsedDevicesSkeleton() {
  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Used Devices</CardTitle>
      </CardHeader>

      <div className="flex flex-col items-center">
        <div className="relative flex size-45 items-center justify-center rounded-full">
          <Skeleton className="size-45 rounded-full" />
        </div>

        <div className="mt-6 flex w-full flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-2.5 shrink-0 rounded-xs" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
