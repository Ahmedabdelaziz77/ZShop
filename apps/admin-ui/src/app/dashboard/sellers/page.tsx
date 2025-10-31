"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { useMemo, useState, useDeferredValue } from "react";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ChevronRight, Download, Search } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const deferredFilter = useDeferredValue(globalFilter);

  const { data, isLoading } = useQuery({
    queryKey: ["all-sellers", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-sellers?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const sellers = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const filteredSellers = useMemo(() => {
    const filter = deferredFilter.toLowerCase();
    return sellers.filter(
      (s: any) =>
        s.name?.toLowerCase().includes(filter) ||
        s.email?.toLowerCase().includes(filter) ||
        s.shop?.name?.toLowerCase().includes(filter)
    );
  }, [sellers, deferredFilter]);

  const handleExportCSV = () => {
    if (!filteredSellers.length) return alert("No sellers to export!");

    const headers = ["Name", "Email", "Shop Name", "Address", "Joined"];
    const rows = filteredSellers.map((s: any) => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.shop?.name ?? ""}"`,
      `"${s.shop?.address ?? ""}"`,
      new Date(s.createdAt).toLocaleDateString(),
    ]);

    const csv =
      headers.join(",") + "\n" + rows.map((r: any) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sellers_page_${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(
    () => [
      {
        header: "Avatar",
        cell: ({ row }: any) => (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-white font-bold">
            {row.original.avatar ? (
              <img
                src={row.original.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{row.original.name?.[0]}</span>
            )}
          </div>
        ),
      },
      {
        header: "Name",
        cell: ({ row }: any) => <span>{row.original.name}</span>,
      },
      {
        header: "Email",
        cell: ({ row }: any) => (
          <span className="text-gray-300">{row.original.email}</span>
        ),
      },
      {
        header: "Shop Name",
        cell: ({ row }: any) =>
          row.original.shop ? (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shop/${row.original.shop.id}`}
              className="text-blue-400 hover:underline transition"
            >
              {row.original.shop.name}
            </Link>
          ) : (
            <span className="text-gray-500 italic">No shop</span>
          ),
      },
      {
        header: "Address",
        cell: ({ row }: any) => (
          <span className="text-gray-300">
            {row.original.shop?.address ?? "-"}
          </span>
        ),
      },
      {
        header: "Joined",
        cell: ({ row }: any) => (
          <span className="text-gray-400 text-sm">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl text-white font-semibold tracking-wide">
          All Sellers
        </h2>
        <button
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-transform hover:scale-[1.03]"
        >
          <Download size={20} /> Export CSV
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm text-gray-400">
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={18} className="mx-1 text-gray-400" />
        <span className="text-gray-300">All Sellers</span>
      </div>

      {/* Search Input */}
      <div className="mb-6 flex items-center bg-gray-800/70 px-3 py-2 rounded-md border border-gray-700 focus-within:ring-2 focus-within:ring-blue-600 transition-all duration-200">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search sellers..."
          className="w-full bg-transparent text-white outline-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-inner animate-fadeIn">
        {isLoading ? (
          <p className="text-center text-gray-400 py-6 italic">
            Loading Sellers...
          </p>
        ) : filteredSellers.length === 0 ? (
          <p className="text-center text-gray-500 py-6 italic">
            No sellers found.
          </p>
        ) : (
          <table className="w-full text-white border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="border-b border-gray-800/80 bg-gray-800/40"
                >
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3 text-left text-gray-300 font-medium uppercase tracking-wide text-xs"
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800/60 hover:bg-gray-800/70 transition-all duration-200 hover:scale-[1.01]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-3 text-sm text-gray-200 whitespace-nowrap"
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
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded-md bg-gray-800 text-white hover:bg-blue-700 disabled:opacity-40 transition"
        >
          Previous
        </button>
        <span className="text-gray-300">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded-md bg-gray-800 text-white hover:bg-blue-700 disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
