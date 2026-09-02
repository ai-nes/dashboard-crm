import { ArrowDownward, ArrowUpward, CheckCircle1 } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { money, useRevenueForecastData } from "./revenue-forecast-context";

const TRANSACTIONS = [
  {
    id: "tuition-hcm",
    title: "Học phí nhập học · TP. Hồ Chí Minh",
    date: "Hôm nay, 10:42",
    amount: "+12.4B",
    status: "Đã ghi nhận",
    income: true,
  },
  {
    id: "deposit-dong-nai",
    title: "Đặt cọc nhập học · Đồng Nai",
    date: "Hôm nay, 09:18",
    amount: "+4.8B",
    status: "Đã đối soát",
    income: true,
  },
  {
    id: "scholarship",
    title: "Phê duyệt học bổng · Niên khóa 2026",
    date: "Hôm qua, 16:35",
    amount: "-2.1B",
    status: "Đã duyệt",
    income: false,
  },
  {
    id: "refund",
    title: "Hoàn phí hồ sơ · Khu vực khác",
    date: "Hôm qua, 14:06",
    amount: "-0.6B",
    status: "Đã xử lý",
    income: false,
  },
];

export default function RevenueTransactions() {
  const { transactions } = useRevenueForecastData();
  const TRANSACTIONS = transactions.map((row) => ({
    id: row.id,
    title: row.title,
    date: row.occurredAt,
    amount: `${row.direction === "income" ? "+" : "-"}${money(row.amount)}`,
    status: row.reconciled ? "Đã đối soát" : row.status,
    income: row.direction === "income",
  }));
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Giao dịch doanh thu</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Các khoản thu chi mới nhất trong niên khóa
          </p>
        </div>
        <span className="rounded-full bg-badge-primary-background px-2 py-1 text-[11px] font-semibold text-badge-primary-text">
          CRM
        </span>
      </CardHeader>

      <div className="mt-4 overflow-hidden divide-y divide-card-border rounded-xl bg-background-gray-primary px-3">
        {TRANSACTIONS.map((transaction) => (
          <div key={transaction.id} className="flex items-center gap-3 py-3">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full ${transaction.income ? "bg-badge-success-background text-badge-success-text" : "bg-badge-warning-background text-badge-warning-text"}`}
            >
              {transaction.income ? (
                <ArrowUpward size={13} aria-hidden="true" />
              ) : (
                <ArrowDownward size={13} aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-text-secondary">
                {transaction.title}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-text-tertiary">
                <span>{transaction.date}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-badge-success-text">
                  <CheckCircle1 size={11} aria-hidden="true" />
                  {transaction.status}
                </span>
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold ${transaction.income ? "text-success-500" : "text-warning-500"}`}
            >
              {transaction.amount}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4 text-xs">
        <span className="text-text-tertiary">Tổng biến động hôm nay</span>
        <span className="font-semibold text-success-500">+17.2B</span>
      </div>
    </Card>
  );
}
