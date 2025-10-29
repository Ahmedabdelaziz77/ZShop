"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { useRouter } from "next/navigation";
import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";

export default function OrdersTable() {
  const router = useRouter();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/get-user-orders`);
      return res.data.orders;
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: (info: any) => `#${info.getValue()?.slice(-6).toUpperCase()}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => (
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            info.getValue() === "DELIVERED"
              ? "bg-green-100 text-green-700"
              : info.getValue() === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total ($)",
      cell: (info: any) =>
        info.getValue()
          ? `$${parseFloat(info.getValue()).toFixed(2)}`
          : "$0.00",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: (info: any) =>
        new Date(info.getValue())?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/order/${row.original.id}`)}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 transition"
        >
          Track Order
          <ArrowUpRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      {isLoading ? (
        <p className="text-gray-500 text-sm text-center py-6">
          Loading your orders...
        </p>
      ) : table.getRowModel().rows.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">
          You haven’t placed any orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`py-3 px-4 border-b border-gray-200 font-medium ${
                        header.id === "totalAmount" ? "text-right" : "text-left"
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-sm text-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`py-3 px-4 border-b border-gray-100 ${
                        cell.column.id === "totalAmount"
                          ? "text-right font-semibold text-gray-800"
                          : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
