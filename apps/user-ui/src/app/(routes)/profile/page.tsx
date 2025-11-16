"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QuickActionCard from "apps/user-ui/src/shared/components/cards/quick-action-card";
import StatCard from "apps/user-ui/src/shared/components/cards/stat-card";
import ShippingAddressSection from "apps/user-ui/src/shared/components/shippingAddress";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import {
  BadgeCheck,
  Bell,
  CheckCircle,
  CircleDot,
  Clock,
  ExternalLink,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import OrdersTable from "apps/user-ui/src/shared/components/tables/orders-table";
import ChangePassword from "apps/user-ui/src/shared/components/changePassword";
import useRequireAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="flex justify-center p-10">Loading...</div>}
    >
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading } = useRequireAuth();

  const searchParams = useSearchParams();
  const queryTab = searchParams.get("active") || "Profile";
  const [activeTab, setActiveTab] = useState(queryTab);

  const { data: orders = [] } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/get-user-orders`);
      return res.data.orders;
    },
  });
  const totalOrders = orders.length;
  const processingOrders = orders.filter(
    (order: any) =>
      order?.deliveryStatus !== "Delivered" &&
      order?.deliveryStatus !== "Cancelled"
  ).length;
  const completedOrders = orders.filter(
    (order: any) => order?.deliveryStatus === "Delivered"
  ).length;

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("active", activeTab);
      if (activeTab === "inbox") router.replace(`/inbox`);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const logOutHandler = async () => {
    await axiosInstance.get("/api/logout").then(() => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/login");
    });
  };

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-user-notifications");
      return res.data.notifications;
    },
  });

  return (
    <div className="bg-gray-50 p-6 pb-14">
      <div className="md:max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5" />
              ) : (
                `${user?.name || "User"}`
              )}
            </span>{" "}
            👋
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" count={totalOrders} Icon={Clock} />
          <StatCard
            title="Processing Orders"
            count={processingOrders}
            Icon={Truck}
          />
          <StatCard
            title="Completed Orders"
            count={completedOrders}
            Icon={CheckCircle}
          />
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* LEFT NAV */}
          <div className="bg-white p-4 rounded-md shadow-md border border-gray-100 w-full md:w-1/5">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingCart}
                active={activeTab === "My Orders"}
                onClick={() => setActiveTab("My Orders")}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === "Inbox"}
                onClick={() => router.replace("/inbox")}
              />
              <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === "Notifications"}
                onClick={() => setActiveTab("Notifications")}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === "Shipping Address"}
                onClick={() => setActiveTab("Shipping Address")}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === "Change Password"}
                onClick={() => setActiveTab("Change Password")}
              />
              <NavItem
                label="Logout"
                Icon={LogOut}
                danger
                onClick={logOutHandler}
              />
            </nav>
          </div>

          {/* MAIN CONTENT */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 w-full md:w-[55%]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {activeTab}
            </h2>
            {activeTab === "Profile" && !isLoading && user ? (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      user?.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    }
                    alt="profile_image"
                    width={60}
                    height={60}
                    className="w-16 h-16 rounded-full border border-gray-200"
                  />
                  <button className="flex items-center gap-1 text-blue-500 text-xs font-medium">
                    <Pencil className="w-4 h-4" />
                    Change Photo
                  </button>
                </div>
                <p>
                  <span className="font-semibold">Name:</span> {user?.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-semibold">Joined:</span>{" "}
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Earned Points:</span>{" "}
                  {user?.points || 0}
                </p>
              </div>
            ) : activeTab === "Shipping Address" ? (
              <ShippingAddressSection />
            ) : activeTab === "My Orders" ? (
              <OrdersTable />
            ) : activeTab === "Change Password" ? (
              <ChangePassword />
            ) : activeTab === "Notifications" ? (
              <div className="space-y-4">
                {/* Loading */}
                {notificationsLoading && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}

                {/* Empty */}
                {!notificationsLoading && notifications?.length === 0 && (
                  <p className="text-center py-10 text-gray-500">
                    No Notifications available yet!
                  </p>
                )}

                {/* SORTED + Animated List */}
                {!notificationsLoading &&
                  notifications &&
                  [...notifications]
                    .sort((a, b) =>
                      a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1
                    )
                    .map((not, idx) => (
                      <div
                        key={not.id}
                        style={{ animationDelay: `${idx * 80}ms` }}
                        className={`group border border-gray-200 rounded-xl p-5 shadow-sm
              opacity-0 animate-fadeSlideUp transition-all duration-300 ease-out
              hover:shadow-md hover:border-blue-400
              ${!not.isRead ? "bg-blue-50 border-blue-300" : "bg-white"}
            `}
                      >
                        <div className="flex justify-between items-start">
                          {/* LEFT SIDE */}
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-gray-800 font-semibold text-base">
                                {not.title}
                              </h3>

                              {!not.isRead && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-600 text-white">
                                  NEW
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 text-sm">
                              {not.message}
                            </p>

                            {/* Creator */}
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                              <User className="w-3 h-3" /> Created by:{" "}
                              {not.creatorId}
                            </p>

                            {/* Dates */}
                            <div className="flex gap-4 text-xs text-gray-400 mt-1">
                              <span>
                                Created:&nbsp;
                                <span className="text-gray-500">
                                  {new Date(not.createdAt).toLocaleString()}
                                </span>
                              </span>

                              <span>
                                Updated:&nbsp;
                                <span className="text-gray-500">
                                  {new Date(not.updatedAt).toLocaleString()}
                                </span>
                              </span>
                            </div>

                            {/* Redirect link */}
                            {not.redirect_link && (
                              <Link
                                href={not.redirect_link}
                                className="mt-2 text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline"
                              >
                                View Details
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>

                          {/* ACTION BUTTON */}
                          {!not.isRead ? (
                            <button
                              onClick={async () => {
                                await axiosInstance.post(
                                  "/seller/api/mark-notification-as-read",
                                  { notificationId: not.id }
                                );

                                queryClient.invalidateQueries({
                                  queryKey: ["notifications"],
                                });
                                toast.success("Notification marked as read");
                              }}
                              className="text-blue-600 hover:text-blue-700
                  text-sm flex items-center gap-1 font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark as read
                            </button>
                          ) : (
                            <CircleDot className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
              </div>
            ) : (
              <p>Not Found</p>
            )}
          </div>

          {/* QUICK PANEL */}
          <div className="w-full md:w-1/4 space-y-4">
            <QuickActionCard
              Icon={Gift}
              title="Referral Program"
              description="Invite friends and earn rewards."
            />
            <QuickActionCard
              Icon={BadgeCheck}
              title="Your Badges"
              description="View your earned achievements"
            />
            <QuickActionCard
              Icon={Settings}
              title="Account Settings"
              description="Manage preferences and security."
            />
            <QuickActionCard
              Icon={Receipt}
              title="Billing History"
              description="Check your recent payments."
            />
            <QuickActionCard
              Icon={PhoneCall}
              title="Support Center"
              description="Need help? Contact support."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const NavItem = ({ label, Icon, active, danger, onClick }: any) => (
  <button
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
      active
        ? "bg-blue-100 text-blue-600"
        : danger
        ? "text-red-500 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);
