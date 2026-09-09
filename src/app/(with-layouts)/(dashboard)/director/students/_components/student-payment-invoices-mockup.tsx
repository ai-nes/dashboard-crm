"use client";

import { SackDollar } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";

import StudentCardHeader from "./student-card-header";

interface PaymentInvoice {
  paymentId: string;
  bank: string;
  amount: string;
  invoiceSerial: string;
  paidAt: string;
  transactionId: string;
  document: string;
  createdBy: string;
}

const paymentInvoices: PaymentInvoice[] = [
  {
    paymentId: "8F14079206000566AB",
    bank: "VIETINBANK",
    amount: "7,860,000",
    invoiceSerial: "1/001;K26TAA-00040980",
    paidAt: "17/08/2026 09:18",
    transactionId: "_7361539",
    document: "-",
    createdBy: "TĐK",
  },
  {
    paymentId: "8F14079206000566AA",
    bank: "VIETINBANK",
    amount: "13,446,650",
    invoiceSerial: "1/001;K26TAA-00038962",
    paidAt: "13/08/2026 01:39",
    transactionId: "_7331751_7331752",
    document: "-",
    createdBy: "TĐK",
  },
];

export default function StudentPaymentInvoicesMockup() {
  return (
    <Card>
      <StudentCardHeader
        description="Theo dõi học phí, giao dịch và tình trạng thanh toán."
        icon={<SackDollar size={18} aria-hidden="true" />}
        title="Hóa đơn thanh toán"
      />

      <TableRoot className="w-full min-w-200 rounded-none border-none">
        <TableHeader>
          <TableRow className="[&_th]:border-t">
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Payment ID
            </TableHead>
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Ngân hàng
            </TableHead>
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Số tiền (VND)
            </TableHead>
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Số serial HĐ
            </TableHead>
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Ngày thanh toán
            </TableHead>
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Mã giao dịch
            </TableHead>
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Chứng từ
            </TableHead>
            <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
              Người tạo
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentInvoices.map((invoice) => (
            <TableRow key={invoice.paymentId} className="[&_td]:border-none">
              <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                {invoice.paymentId}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                {invoice.bank}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-sm leading-5 font-semibold whitespace-nowrap text-text-primary">
                {invoice.amount}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                {invoice.invoiceSerial}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                {invoice.paidAt}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                {invoice.transactionId}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-sm leading-5 text-text-secondary">
                {invoice.document}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-primary">
                {invoice.createdBy}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>

      <div className="flex justify-end border-t border-card-border px-6 py-3.5 text-sm text-text-secondary">
        <span>
          Tổng:{" "}
          <strong className="font-semibold text-text-primary">
            21,306,650 VND
          </strong>{" "}
          — 2 hóa đơn
        </span>
      </div>
    </Card>
  );
}
