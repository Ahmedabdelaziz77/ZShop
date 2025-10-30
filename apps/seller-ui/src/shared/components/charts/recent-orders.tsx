"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion } from "framer-motion";

export default function RecentOrdersTable() {
  const data = useMemo(
    () => [
      { id: "ORD-001", customer: "Ahmed", amount: "$250", status: "Paid" },
      { id: "ORD-002", customer: "Ali", amount: "$180", status: "Pending" },
      { id: "ORD-003", customer: "Mahmoud", amount: "$340", status: "Paid" },
      { id: "ORD-004", customer: "Hassan", amount: "$90", status: "Failed" },
      {
        id: "ORD-005",
        customer: "Abdelaziz",
        amount: "$190",
        status: "Pending",
      },
      { id: "ORD-006", customer: "Kareem", amount: "$120", status: "Paid" },
      { id: "ORD-007", customer: "Jack", amount: "$90", status: "Failed" },
    ],
    []
  );

  const columns = useMemo(
    () => [
      { header: "Order ID", accessorKey: "id" },
      { header: "Customer", accessorKey: "customer" },
      { header: "Amount", accessorKey: "amount" },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info: any) => {
          const status = info.getValue();
          const base =
            "px-3 py-1 rounded-full text-xs font-semibold capitalize";
          const styles =
            status === "Paid"
              ? "bg-green-500/20 text-green-400"
              : status === "Pending"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-red-500/20 text-red-400";
          return <span className={`${base} ${styles}`}>{status}</span>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <motion.div
      className="bg-[#111] p-5 rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-lg">Recent Orders</h2>
        <span className="text-gray-400 text-xs">Last updated: Today</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-300 border-separate border-spacing-y-2">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left pb-3 text-gray-400 font-medium border-b border-gray-800"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-[#181818]" : "bg-[#141414]"
                } hover:bg-[#1e1e1e]`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
