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
  Clock,
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
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const logOutHandler = async () => {
    await axiosInstance.get("/api/logout").then(() => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/login");
    });
  };

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
                onClick={() => setActiveTab("Inbox")}
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
            ) : (
              <></>
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
