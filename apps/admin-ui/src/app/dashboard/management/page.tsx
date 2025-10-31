"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { useState, useMemo } from "react";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { toast } from "react-hot-toast";

export default function TeamManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  // Fetch all admins
  const { data, isLoading } = useQuery({
    queryKey: ["all-admins"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/api/get-all-admins`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const admins = data?.admins ?? [];

  // Mutation: Add new admin
  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      await axiosInstance.put(`/admin/api/add-new-admin`, { email });
    },
    onSuccess: () => {
      toast.success("Admin role assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-admins"] });
      setEmail("");
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to assign admin role");
    },
  });

  const columns = useMemo(
    () => [
      {
        header: "Name",
        cell: ({ row }: any) => <span>{row.original.name}</span>,
      },
      {
        header: "Email",
        cell: ({ row }: any) => <span>{row.original.email}</span>,
      },
      {
        header: "Role",
        cell: ({ row }: any) => (
          <span className="text-blue-400 capitalize">{row.original.role}</span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: admins,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl text-white font-semibold tracking-wide">
          Team Management
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-transform hover:scale-[1.03]"
        >
          <Plus size={20} /> Add Admin
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm text-gray-400">
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={18} className="mx-1 text-gray-400" />
        <span className="text-gray-300">Team Management</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-inner animate-fadeIn">
        {isLoading ? (
          <p className="text-center text-gray-400 py-6 italic">
            Loading Admins...
          </p>
        ) : admins.length === 0 ? (
          <p className="text-center text-gray-500 py-6 italic">
            No admins found.
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
                  className="border-b border-gray-800/60 hover:bg-gray-800/70 transition-all duration-200"
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

      {/* Add Admin Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <DialogPanel className="bg-gray-900 text-white p-6 rounded-xl border border-gray-700 shadow-lg max-w-sm w-full">
            <DialogTitle className="text-lg font-semibold text-blue-400 mb-3">
              Add New Admin
            </DialogTitle>
            <p className="text-sm text-gray-400 mb-4">
              Enter the email of the user you want to promote to admin.
            </p>

            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mb-4 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => addAdminMutation.mutate(email)}
                disabled={addAdminMutation.isPending || !email}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                  addAdminMutation.isPending
                    ? "bg-blue-700/60 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {addAdminMutation.isPending ? "Processing..." : "Confirm Add"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Animations */}
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
