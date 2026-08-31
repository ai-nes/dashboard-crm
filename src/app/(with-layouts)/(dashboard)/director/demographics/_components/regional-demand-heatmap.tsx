import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { regionalDemandMatrixData as defaultRegionalDemand } from "@/services/api/demographics/data";
import type { RegionalDemandMatrix } from "@/services/api/demographics/types";

const heatTone = (value: number, maximum: number) => {
  const normalized = maximum > 0 ? (value / maximum) * 100 : 0;

  return normalized >= 85
    ? "bg-brand-500 text-white-100"
    : normalized >= 70
      ? "bg-primary-200 text-primary-text"
      : normalized >= 55
        ? "bg-primary-100 text-primary-text"
        : "bg-background-soft-100 text-text-secondary";
};

interface RegionalDemandHeatmapProps {
  regionalDemand?: RegionalDemandMatrix;
}

export default function RegionalDemandHeatmap({
  regionalDemand = defaultRegionalDemand,
}: RegionalDemandHeatmapProps) {
  const columns = regionalDemand.columns;
  const rows = regionalDemand.rows;
  const isCountMetric = regionalDemand.metric === "count" || regionalDemand.unit === "contacts";
  const values = rows.flatMap((row) =>
    columns.map((column) => getCellValue(row, column.id)),
  );
  const maximum = Math.max(...values.filter((value): value is number => value != null), 0);
  const hottestCell = getHottestCell(rows, columns);

  return (
    <Card className="min-w-0 overflow-hidden bg-card-background p-0">
      <CardHeader className="border-b border-card-border p-5">
        <div>
          <CardTitle>Mức độ quan tâm theo ngành và địa bàn</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            {isCountMetric ? "Số hồ sơ theo ngành và địa bàn." : "Điểm chỉ số tương đối theo ngành; không phải số hồ sơ."}
          </p>
        </div>
        <span className="text-xs text-text-tertiary">{isCountMetric ? "Số hồ sơ" : "Chỉ số 0–100"}</span>
      </CardHeader>
      <div className="overflow-x-auto p-4 sm:p-5">
        <table className="w-full min-w-[680px] border-separate border-spacing-1.5 text-left text-xs">
          <thead>
            <tr>
              <th className="px-2 py-2 font-medium text-text-tertiary">Ngành quan tâm</th>
              {columns.map((col) => (
                <th key={col.id} className="px-2 py-2 text-center font-medium text-text-tertiary">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.interest}>
                <th scope="row" className="whitespace-nowrap px-2 py-3 font-medium text-text-secondary">
                  {row.interest}
                </th>
                {columns.map((col) => {
                  const value = getCellValue(row, col.id);
                  return (
                    <td
                      key={`${row.interest}-${col.id}`}
                      className={`rounded-lg px-2 py-3 text-center font-semibold ${value == null ? "bg-background-soft-50 text-text-tertiary" : heatTone(value, isCountMetric ? maximum : 100)}`}
                    >
                      {value == null ? "—" : value.toLocaleString("vi-VN")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-card-border px-5 py-3 text-[11px] text-text-tertiary">
        <span>Thấp</span>
        <span className="size-3 rounded bg-background-soft-100" />
        <span className="size-3 rounded bg-primary-100" />
        <span className="size-3 rounded bg-primary-200" />
        <span className="size-3 rounded bg-brand-500" />
        <span>Cao</span>
        {hottestCell ? (
          <span className="ml-auto font-medium text-text-secondary">
            {hottestCell.column} · {hottestCell.interest} đang cao nhất
          </span>
        ) : null}
      </div>
    </Card>
  );
}

function getCellValue(
  row: RegionalDemandMatrix["rows"][number],
  columnId: string,
): number | null {
  return row.values?.[columnId] ?? row.scores?.[columnId] ?? null;
}

function getHottestCell(
  rows: RegionalDemandMatrix["rows"],
  columns: RegionalDemandMatrix["columns"],
): { column: string; interest: string; value: number } | null {
  let hottest: { column: string; interest: string; value: number } | null = null;

  for (const row of rows) {
    for (const column of columns) {
      const value = getCellValue(row, column.id);
      if (value != null && (!hottest || value > hottest.value)) {
        hottest = { column: column.name, interest: row.interest, value };
      }
    }
  }

  return hottest;
}
