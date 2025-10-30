"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryData = [
  { name: "United States of America", users: 120, sellers: 30 },
  { name: "India", users: 100, sellers: 20 },
  { name: "United Kingdom", users: 85, sellers: 15 },
  { name: "Germany", users: 70, sellers: 10 },
  { name: "Egypt", users: 160, sellers: 5 },
  { name: "Syria", users: 6, sellers: 5 },
  { name: "China", users: 65, sellers: 5 },
];

function getColor(users: number) {
  if (users >= 100) return "#22c55e";
  if (users >= 70) return "#3b82f6";
  if (users > 0) return "#facc15";
  return "#222";
}

export default function GeoMap() {
  const [tooltip, setTooltip] = useState<{
    name: string;
    users: number;
    sellers: number;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="bg-[#111] p-4 rounded-xl relative">
      <h2 className="text-white mb-2 font-semibold">
        User & Seller Distribution
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Visual breakdown of global user & seller activity
      </p>

      <div className="relative">
        <ComposableMap projectionConfig={{ scale: 150 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) => (
              <AnimatePresence>
                {geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const match = countryData.find((c) => c.name === countryName);
                  const color = match ? getColor(match.users) : "#222";

                  return (
                    <motion.g
                      key={geo.rsmKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Geography
                        geography={geo}
                        fill={color}
                        stroke="#111"
                        onMouseMove={(e) => {
                          if (match) {
                            setTooltip({
                              name: match.name,
                              users: match.users,
                              sellers: match.sellers,
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </motion.g>
                  );
                })}
              </AnimatePresence>
            )}
          </Geographies>
        </ComposableMap>

        {tooltip && (
          <div
            className="fixed bg-[#222] text-white text-xs p-2 rounded-md shadow-md pointer-events-none z-50"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10,
              whiteSpace: "nowrap",
            }}
          >
            <div className="font-semibold">{tooltip.name}</div>
            <div>Users: {tooltip.users}</div>
            <div>Sellers: {tooltip.sellers}</div>
          </div>
        )}
      </div>
    </div>
  );
}
