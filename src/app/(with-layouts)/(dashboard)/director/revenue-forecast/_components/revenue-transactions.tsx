import { ArrowDownward, ArrowUpward, CheckCircle1 } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { money, useRevenueForecastData } from "./revenue-forecast-context";

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
  const netChange = transactions.reduce(
    (total, transaction) =>
      total +
      (transaction.direction === "income"
        ? transaction.amount
        : -transaction.amount),
    0,
  );
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="items-start">
        <div>
          <CardTitle className="text-base">Giao dịch khoản thu</CardTitle>
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
        <span className="text-text-tertiary">
          Biến động theo giao dịch hiển thị
        </span>
        <span
          className={`font-semibold ${netChange >= 0 ? "text-success-500" : "text-error-500"}`}
        >
          {netChange >= 0 ? "+" : "-"}
          {money(Math.abs(netChange))}
        </span>
      </div>
    </Card>
  );
}
