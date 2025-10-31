"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { useMemo, useState, useDeferredValue } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronRight, Download, Search, Ban } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function AllUsersPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const deferredFilter = useDeferredValue(globalFilter);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-users?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const users = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const filteredUsers = useMemo(() => {
    const filter = deferredFilter.toLowerCase();
    return users.filter((u: any) => {
      const matchesText =
        u.name?.toLowerCase().includes(filter) ||
        u.email?.toLowerCase().includes(filter);
      const matchesRole =
        roleFilter === "all" || u.role?.toLowerCase() === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, deferredFilter, roleFilter]);

  // BAN
  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/admin/api/ban-user/${userId}`);
    },
    onSuccess: () => {
      toast.success("User banned successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to ban user!");
    },
  });

  // UNBAN
  const unbanMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/admin/api/unban-user/${userId}`);
    },
    onSuccess: () => {
      toast.success("User unbanned successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to unban user!");
    },
  });

  const handleExportCSV = () => {
    if (!filteredUsers.length) return alert("No users to export!");

    const headers = ["Name", "Email", "Role", "Joined", "Banned"];
    const rows = filteredUsers.map((u: any) => [
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      new Date(u.createdAt).toLocaleDateString(),
      u.isBanned ? "Yes" : "No",
    ]);

    const csv =
      headers.join(",") + "\n" + rows.map((r: any) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users_page_${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <span className="text-blue-400">{row.original.role}</span>
        ),
      },
      {
        header: "Joined",
        cell: ({ row }: any) => (
          <span className="text-gray-300 text-sm">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Status",
        cell: ({ row }: any) => (
          <span
            className={`font-medium ${
              row.original.isBanned ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {row.original.isBanned ? "Banned" : "Active"}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => {
          const user = row.original;
          const isBanned = user.isBanned;

          return (
            <button
              title={isBanned ? "Unban User" : "Ban User"}
              onClick={() => {
                setSelectedUser(user);
                setIsModalOpen(true);
              }}
              className={`transition ${
                isBanned
                  ? "text-emerald-500 hover:text-emerald-400"
                  : "text-red-500 hover:text-red-400"
              }`}
            >
              <Ban size={18} />
            </button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl text-white font-semibold tracking-wide">
          All Users
        </h2>

        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-transform hover:scale-[1.03]"
          >
            <Download size={20} /> Export CSV
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm text-gray-400">
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={18} className="mx-1 text-gray-400" />
        <span className="text-gray-300">All Users</span>
      </div>

      {/* Search Input */}
      <div className="mb-6 flex items-center bg-gray-800/70 px-3 py-2 rounded-md border border-gray-700 focus-within:ring-2 focus-within:ring-blue-600 transition-all duration-200">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full bg-transparent text-white outline-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900/80 p-4 rounded-lg border border-gray-800 shadow-inner animate-fadeIn">
        {isLoading ? (
          <p className="text-center text-gray-400 py-6 italic">
            Loading Users...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-6 italic">
            No users found.
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

      {/* Ban / Unban Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
          <DialogPanel
            as="div"
            className="bg-gradient-to-b from-gray-900 to-gray-950 text-white p-6 rounded-2xl border border-gray-700/80 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.01] max-w-sm w-full"
          >
            {selectedUser && (
              <>
                <DialogTitle
                  className={`text-xl font-semibold mb-3 flex items-center gap-2 ${
                    selectedUser.isBanned ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  <span className="text-yellow-400">⚠️</span>
                  {selectedUser.isBanned ? "Unban User" : "Ban User"}
                </DialogTitle>

                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  {selectedUser.isBanned ? (
                    <>
                      You’re about to{" "}
                      <span className="text-emerald-400 font-medium">
                        unban
                      </span>{" "}
                      <span className="font-medium">{selectedUser.name}</span>.
                      <br />
                      <span className="text-gray-400 text-xs">
                        This will restore their access immediately.
                      </span>
                    </>
                  ) : (
                    <>
                      You’re about to{" "}
                      <span className="text-red-400 font-medium">ban</span>{" "}
                      <span className="font-medium">{selectedUser.name}</span>.
                      <br />
                      <span className="text-gray-400 text-xs">
                        This action will restrict their access immediately. You
                        can unban them later if needed.
                      </span>
                    </>
                  )}
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition text-sm font-medium"
                  >
                    Cancel
                  </button>

                  {selectedUser.isBanned ? (
                    <button
                      onClick={() => unbanMutation.mutate(selectedUser.id)}
                      disabled={unbanMutation.isPending}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                        unbanMutation.isPending
                          ? "bg-emerald-700/60 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {unbanMutation.isPending ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          <Ban size={16} /> Confirm Unban
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => banMutation.mutate(selectedUser.id)}
                      disabled={banMutation.isPending}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                        banMutation.isPending
                          ? "bg-red-700/60 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {banMutation.isPending ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          <Ban size={16} /> Confirm Ban
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>

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
