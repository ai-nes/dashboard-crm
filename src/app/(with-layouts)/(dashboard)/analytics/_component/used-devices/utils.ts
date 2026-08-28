import type { DeviceType, UsedDevicesRawResponse } from "@/services/api/analytics";
import { formatNumber } from "@/utils/format-number";

import type { UsedDevicesViewModel } from "./types";

const DEVICE_LABEL: Record<DeviceType, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

const DEVICE_COLOR: Record<DeviceType, string> = {
  desktop: "var(--color-brand-500)",
  mobile: "var(--color-purple-300)",
  tablet: "var(--color-blue-300)",
};

export function mapUsedDevicesResponse(response: UsedDevicesRawResponse): UsedDevicesViewModel {
  return {
    totalSessions: formatNumber({ value: response.total_sessions }),
    devices: response.devices.map((device) => ({
      id: device.id,
      deviceType: device.device_type,
      label: DEVICE_LABEL[device.device_type],
      sessions: formatNumber({ value: device.session_count }),
      percentage: device.percentage,
      color: DEVICE_COLOR[device.device_type],
    })),
  };
}
