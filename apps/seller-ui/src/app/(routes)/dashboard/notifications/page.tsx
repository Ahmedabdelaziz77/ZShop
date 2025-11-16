"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import BreadCrumbs from "apps/seller-ui/src/shared/components/breadCrumbs";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { CheckCircle2, ExternalLink, User, CircleDot } from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Page() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["seller-notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/seller-notifications");
      return res.data.notifications;
    },
  });

  const markAsRead = async (id: string) => {
    await axiosInstance.post("/seller/api/mark-notification-as-read", {
      notificationId: id,
    });

    queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });

    // ⬅️ SHOW TOAST (react-hot-toast)
    toast.success("Notification marked as read");
  };

  // === SORT unread first ===
  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications].sort((a, b) =>
      a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1
    );
  }, [notifications]);

  return (
    <div className="w-full min-h-screen p-8 bg-[#0D0D12]">
      <h2 className="text-2xl text-white font-semibold mb-2">Notifications</h2>
      <BreadCrumbs title="Notifications" />

      {!isLoading && sortedNotifications?.length === 0 && (
        <p className="text-center pt-24 text-white text-sm font-Poppins">
          No Notifications available yet!
        </p>
      )}

      {!isLoading && sortedNotifications?.length > 0 && (
        <div className="md:w-[80%] my-8 space-y-4">
          {sortedNotifications.map((not: any, idx: number) => (
            <div
              key={not.id}
              style={{
                animationDelay: `${idx * 80}ms`,
              }}
              className={`group border border-gray-800 rounded-xl p-5 shadow-lg
                transition-all duration-300 ease-out
                opacity-0 animate-fadeSlideUp
                hover:shadow-blue-900/20 hover:scale-[1.01]
                ${
                  !not.isRead
                    ? "bg-gradient-to-br from-[#1b1b22] to-[#111118] border-blue-800/40"
                    : "bg-[#131318]"
                }
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-lg">
                      {not.title}
                    </h3>
                    {!not.isRead && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-600 text-white">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {not.message}
                  </p>

                  <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                    <User size={13} />
                    <span>Created by: {not.creatorId}</span>
                  </div>

                  <p className="text-gray-500 text-xs">
                    Receiver:{" "}
                    <span className="text-gray-400">
                      {not.receiverId || "seller"}
                    </span>
                  </p>

                  <div className="flex gap-5 mt-2 text-gray-500 text-xs">
                    <span>
                      Created:{" "}
                      <span className="text-gray-400">
                        {new Date(not.createdAt).toLocaleString()}
                      </span>
                    </span>
                    <span>
                      Updated:{" "}
                      <span className="text-gray-400">
                        {new Date(not.updatedAt).toLocaleString()}
                      </span>
                    </span>
                  </div>

                  {not.redirect_link && (
                    <Link
                      href={not.redirect_link}
                      className="mt-3 text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300"
                    >
                      <ExternalLink size={16} /> View Details
                    </Link>
                  )}
                </div>

                {!not.isRead ? (
                  <button
                    onClick={() => markAsRead(not.id)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300
                      transition px-3 py-1 rounded-md border border-blue-700/40
                      hover:border-blue-500/60"
                  >
                    <CheckCircle2 size={16} />
                    <span className="text-sm">Mark as read</span>
                  </button>
                ) : (
                  <CircleDot
                    size={18}
                    className="text-gray-600 group-hover:text-gray-400 transition"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
