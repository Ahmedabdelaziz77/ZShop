"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Search, Eye, Star, ChevronRight, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

export default function ProductList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredFilter = useDeferredValue(globalFilter);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["all-products", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-products?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev: any) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const filteredProducts = useMemo(() => {
    const filter = deferredFilter.toLowerCase();
    return products.filter(
      (p: any) =>
        p.title.toLowerCase().includes(filter) ||
        p.category?.toLowerCase().includes(filter) ||
        p.shop?.name?.toLowerCase().includes(filter)
    );
  }, [products, deferredFilter]);

  const handleExportCSV = () => {
    if (!filteredProducts.length) {
      alert("No products to export!");
      return;
    }

    const headers = [
      "Title",
      "Category",
      "Price",
      "Stock",
      "Rating",
      "Shop Name",
      "Created At",
    ];

    const rows = filteredProducts.map((p: any) => [
      `"${p.title}"`,
      `"${p.category ?? ""}"`,
      p.sale_price,
      p.stock,
      p.ratings ?? 5,
      `"${p.shop?.name ?? ""}"`,
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      headers.join(",") + "\n" + rows.map((r: any) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `products_page_${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(
    () => [
      {
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images?.[0]?.url || "/placeholder.png"}
            alt={row.original.title}
            width={48}
            height={48}
            className="w-12 h-12 rounded-md object-cover shadow-sm"
          />
        ),
      },
      {
        header: "Title",
        cell: ({ row }: any) => (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="text-blue-400 hover:underline hover:text-blue-300 transition"
            title={row.original.title}
          >
            {row.original.title.length > 25
              ? `${row.original.title.slice(0, 25)}...`
              : row.original.title}
          </Link>
        ),
      },
      {
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={`font-medium ${
              row.original.stock < 10
                ? "text-red-500"
                : "text-green-400 hover:text-green-300"
            }`}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        header: "Category",
        cell: ({ row }: any) => (
          <span className="text-gray-300">{row.original.category}</span>
        ),
      },
      {
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={16} />
            <span className="text-white">{row.original.ratings ?? 5}</span>
          </div>
        ),
      },
      {
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-gray-300">
            {row.original.shop?.name ?? "-"}
          </span>
        ),
      },
      {
        header: "Created",
        cell: ({ row }: any) => (
          <span className="text-gray-300 text-sm">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            title="View Product"
            className="hover:text-blue-400 transition"
          >
            <Eye size={18} />
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white font-semibold tracking-wide">
          All Products
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-transform duration-200 hover:scale-[1.03]"
          >
            <Download size={20} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center mb-6 text-sm text-gray-400">
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={18} className="mx-1 text-gray-400" />
        <span className="text-gray-300">All Products</span>
      </div>

      <div className="mb-6 flex items-center bg-gray-800/70 px-3 py-2 rounded-md border border-gray-700 focus-within:ring-2 focus-within:ring-blue-600 transition-all duration-200">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-inner animate-fadeIn">
        {isLoading ? (
          <p className="text-center text-gray-400 py-6 italic">
            Loading Products...
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-6 italic">
            No products found.
          </p>
        ) : (
          <table className="w-full text-white border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gray-800/80 bg-gray-800/40"
                >
                  {headerGroup.headers.map((header) => (
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

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded-md bg-gray-800 text-white hover:bg-blue-700 disabled:opacity-40 transition"
        >
          Prev
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
