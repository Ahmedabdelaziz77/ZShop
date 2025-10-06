"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import DeleteConfirmationModal from "apps/seller-ui/src/shared/components/modals/DeleteConfirmationModal";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ProductList() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-shop-products");
      return res?.data?.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) =>
      await axiosInstance.delete(`/product/api/delete-product/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (productId: string) =>
      await axiosInstance.put(`/product/api/restore-product/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images[0]?.url}
            alt={row.original.images[0]?.url}
            width={200}
            height={200}
            className="w-12 h-12 rounded-md object-cover shadow-sm"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;
          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-150"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={`font-medium ${
              row.original.stock < 10
                ? "text-red-500"
                : "text-green-400 hover:text-green-300"
            } transition-colors duration-200`}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => (
          <span className="text-gray-300">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={16} />
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex gap-3 items-center text-gray-400">
            <Link
              href={`/product/${row.original.id}`}
              className="hover:text-blue-400 transition-colors duration-150"
              title="View Product"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/product/${row.original.id}`}
              className="hover:text-yellow-400 transition-colors duration-150"
              title="Edit Product"
            >
              <Pencil size={18} />
            </Link>
            <button
              className="hover:text-teal-400 transition-colors duration-150"
              title="Analytics"
            >
              <BarChart size={18} />
            </button>
            <button
              className="hover:text-red-400 transition-colors duration-150"
              onClick={() => openDeleteModal(row.original)}
              title="Delete Product"
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white font-semibold tracking-wide">
          All Products
        </h2>
        <Link
          href={"/dashboard/create-product"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm
                     transition-transform duration-200 hover:scale-[1.03]"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* BREADCRUMBS */}
      <div className="flex items-center mb-6 text-sm text-gray-400">
        <Link href={"/dashboard"} className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={18} className="mx-1 text-gray-400" />
        <span className="text-gray-300">All Products</span>
      </div>

      {/* SEARCH BAR */}
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

      {/* TABLE */}
      <div className="overflow-x-auto bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-inner animate-fadeIn">
        {isLoading ? (
          <p className="text-center text-gray-400 py-6 italic">
            Loading Products...
          </p>
        ) : products.length === 0 ? (
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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

        {/* DELETE MODAL */}
        {showDeleteModal && (
          <DeleteConfirmationModal
            product={selectedProduct}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
            isConfirming={deleteMutation.isPending}
            isRestoring={restoreMutation.isPending}
          />
        )}
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
