"use client";

import React from "react";

export default function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-center mb-12 animate-fadeIn">
      {/* TITLE */}
      <h2 className="text-3xl md:text-4xl font-extrabold font-Poppins bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent select-none tracking-wide">
        {title}
      </h2>

      {/* UNDERLINE */}
      <div className="relative w-28 h-[3px] mx-auto mt-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shine" />
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
