import type { DeviceType, UsedDevicesRawResponse } from "@/services/api/analytics";

export type { UsedDevicesRawResponse };

export interface UsedDeviceViewModel {
  id: string;
  deviceType: DeviceType;
  label: string;
  sessions: string;
  percentage: number;
  color: string;
}

export interface UsedDevicesViewModel {
  totalSessions: string;
  devices: UsedDeviceViewModel[];
}
