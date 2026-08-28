"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { getLastStockTransactionsData } from "@/services/api/stocks";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { StockTransactionSkeletonRow } from "./skeleton";
import { SKELETON_ROW_COUNT, mapStockTransaction } from "./utils";

export default function LastTransaction() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["last-stock-transactions"],
    queryFn: getLastStockTransactionsData,
  });

  const transactions = rawResponse?.data.map(mapStockTransaction) ?? [];

  return (
    <Card className="p-0">
      <CardHeader className="p-5">
        <CardTitle>Last Transaction</CardTitle>
        <Link href="#" className="text-sm font-medium text-primary-500 hover:underline">
          View All
        </Link>
      </CardHeader>

      <TableRoot className="w-full rounded-none border-none">
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <StockTransactionSkeletonRow key={i} />
              ))
            : transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Badge color={tx.type === "buy" ? "success" : "error"} size="sm">
                      {tx.type === "buy" ? "Buy" : "Sell"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-primary">
                    {tx.symbol}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {tx.quantity}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-primary">
                    {tx.price}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-primary">
                    {tx.total}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {tx.time}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </TableRoot>
    </Card>
  );
}
