"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#22c55e", "#facc15", "#3b82f6"];

const staticData = [
  { name: "Phone", value: 45 },
  { name: "Tablet", value: 25 },
  { name: "Computer", value: 30 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#222] text-white text-xs px-3 py-2 rounded-md shadow-md">
        <p className="font-semibold">{data.name}</p>
        <p>Usage: {data.value}%</p>
      </div>
    );
  }
  return null;
};

export default function DeviceUsagePie() {
  return (
    <motion.div
      className="bg-[#111] p-4 rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-white mb-2 font-semibold">Device Usage</h2>
      <p className="text-gray-400 text-sm mb-4">
        How users access your platform
      </p>

      <div className="w-full h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={staticData}
              dataKey="value"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              label={({ name, percent }: any) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {staticData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#111"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ color: "#ccc", fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
