"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type OrdersData = { month: string; count: number }[];

export default function SalesChart({
  ordersData,
}: {
  ordersData?: OrdersData;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const staticData = [
    { month: "Jan", count: 20 },
    { month: "Feb", count: 25 },
    { month: "Mar", count: 15 },
    { month: "Apr", count: 30 },
    { month: "May", count: 45 },
    { month: "Jun", count: 40 },
  ];

  const data = ordersData || staticData;

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      foreColor: "#9ca3af",
      background: "transparent",
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ["#3b82f6"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: ["#60a5fa"],
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "rgba(255,255,255,0.08)",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: data.map((d) => d.month),
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "#9ca3af" } },
    },
    tooltip: {
      theme: "dark",
      style: { fontSize: "12px" },
      y: {
        formatter: (val: number) => `$${val.toFixed(0)}k`,
      },
    },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      labels: { colors: "#ccc" },
      position: "top",
      horizontalAlign: "right",
    },
  };

  const series = [
    {
      name: "Revenue",
      data: data.map((d) => d.count),
    },
  ];

  return (
    <div className="bg-[#111] p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-lg">Revenue</h2>
        <span className="text-gray-400 text-xs">Last 6 Months</span>
      </div>
      <Chart options={options} series={series} type="area" height={260} />
    </div>
  );
}
