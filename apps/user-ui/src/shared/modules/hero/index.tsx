"use client";

import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative flex flex-col justify-center items-center bg-[#0E3F4F] overflow-hidden min-h-[90vh] w-full">
      {/* --- BACKGROUND GRADIENTS --- */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-cyan-400/10 blur-[150px] top-[-100px] left-[-200px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-teal-400/10 blur-[150px] bottom-[-100px] right-[-100px] animate-pulse delay-300" />
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between w-[90%] md:w-[80%] mx-auto gap-8">
        {/* --- LEFT TEXT --- */}
        <div className="text-center md:text-left md:w-1/2 animate-slideInLeft">
          <p className="font-inter text-white/80 text-lg mb-2 tracking-wide opacity-0 animate-fadeIn delay-[200ms]">
            Starting from <span className="text-yellow-400">$40</span>
          </p>

          <h1 className="font-poppins text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] opacity-0 animate-fadeIn delay-[400ms]">
            The Best Watch <br />
            Collection <span className="text-cyan-300">2025</span>
          </h1>

          <p className="font-oregano text-2xl md:text-3xl text-white mt-5 opacity-0 animate-fadeIn delay-[700ms]">
            Exclusive offer{" "}
            <span className="text-yellow-400 font-bold">10%</span> off this week
          </p>

          {/* --- BUTTON --- */}
          <button
            onClick={() => router.push("/products")}
            className="group relative inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-400
                       text-gray-900 font-semibold rounded-full overflow-hidden shadow-lg transition-all duration-300
                       hover:scale-[1.05] hover:shadow-cyan-400/40 animate-fadeIn delay-[1000ms]"
          >
            <span className="relative z-10">Shop Now</span>
            <MoveRight className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
          </button>
        </div>

        {/* --- RIGHT IMAGE --- */}
        <div className="md:w-1/2 flex justify-center relative animate-fadeIn delay-[600ms]">
          <div className="absolute -z-10 w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-cyan-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-[450px] h-[450px] flex items-center justify-center animate-float">
            <Image
              src="https://ik.imagekit.io/fz0xzwtey/products/slider-img-1.png"
              alt="Luxury watch"
              width={450}
              height={450}
              className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] select-none"
              priority
            />
          </div>
        </div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-cyan-300 rounded-full animate-ping" />
        <div className="absolute bottom-[25%] right-[20%] w-3 h-3 bg-yellow-300 rounded-full animate-ping delay-300" />
      </div>
    </section>
  );
}
