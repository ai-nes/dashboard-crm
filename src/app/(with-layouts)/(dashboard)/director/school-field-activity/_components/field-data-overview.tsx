import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import DeviceSyncStatus from "./device-sync-status";
import FieldTeamDataQuality from "./field-team-data-quality";

export default function FieldDataOverview() {
  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-5 items-start">
        <div>
          <CardTitle>Chất lượng dữ liệu hoạt động</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Kiểm tra dữ liệu trước khi dùng để đánh giá hiệu quả.</p>
        </div>
        <span className="text-xs font-medium text-warning-500">184 hồ sơ cần kiểm tra</span>
      </CardHeader>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <FieldTeamDataQuality />
        <DeviceSyncStatus />
      </div>
    </Card>
  );
}
