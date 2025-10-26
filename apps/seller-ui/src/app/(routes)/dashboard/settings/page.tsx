"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import GeneralTab from "apps/seller-ui/src/shared/modules/settings/GeneralTab";
import DomainsTab from "apps/seller-ui/src/shared/modules/settings/DomainsTab";
import WithdrawTab from "apps/seller-ui/src/shared/modules/settings/WithdrawTab";

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    "general" | "domains" | "withdraw"
  >("general");

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white font-semibold tracking-wide">
          Settings
        </h2>
      </div>

      <div className="flex items-center mb-6 text-sm text-gray-400">
        <Link href={"/dashboard"} className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={18} className="mx-1 text-gray-400" />
        <span className="text-gray-300">Settings</span>
      </div>

      <div className="border-b border-gray-800/70 mb-6">
        <nav className="flex gap-6 text-sm">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("domains")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "domains"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Custom Domains
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "withdraw"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Withdraw Method
          </button>
        </nav>
      </div>

      {activeTab === "general" && <GeneralTab />}
      {activeTab === "domains" && <DomainsTab />}
      {activeTab === "withdraw" && <WithdrawTab />}
    </div>
  );
}
