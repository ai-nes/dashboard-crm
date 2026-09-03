"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { getUsedDevicesData } from "@/services/api/analytics";
import { useQuery } from "@tanstack/react-query";
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts";
import UsedDevicesSkeleton from "./skeleton";
import UsedDevicesTooltip from "./tooltip";
import { mapUsedDevicesResponse } from "./utils";

export default function UsedDevices() {
  const { data, isLoading } = useQuery({
    queryKey: ["used-devices"],
    queryFn: getUsedDevicesData,
  });

  if (isLoading || !data) {
    return <UsedDevicesSkeleton />;
  }

  const usedDevices = mapUsedDevicesResponse(data);

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Used Devices</CardTitle>
      </CardHeader>

      <div className="flex flex-col items-center">
        <div className="h-45 w-full">
          <ChartContainer
            className="h-full w-full"
            height={180}
            width="100%"
            aspect={undefined}
          >
            <PieChart>
              <Tooltip content={<UsedDevicesTooltip />} />
              <Pie
                data={usedDevices.devices}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={82}
                paddingAngle={2}
                dataKey="percentage"
                nameKey="label"
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {usedDevices.devices.map((device) => (
                  <Cell key={device.id} fill={device.color} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          <tspan
                            x={viewBox.cx}
                            dy="-0.3em"
                            className="fill-text-primary text-[20px] font-semibold tracking-[-0.2px]"
                          >
                            {usedDevices.totalSessions}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            dy="1.4em"
                            className="fill-text-tertiary text-sm font-normal tracking-[-0.15px]"
                          >
                            Sessions
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="mt-6 flex w-full flex-col gap-3">
          {usedDevices.devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-xs" style={{ backgroundColor: device.color }} />
                <span className="text-sm font-medium text-text-secondary">{device.label}</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">
                {device.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
