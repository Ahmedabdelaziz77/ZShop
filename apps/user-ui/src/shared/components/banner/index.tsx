"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

export default function HeroBanner() {
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await axiosInstance.get("/api/get-banner");
        if (res.data?.success && res.data.banner) {
          setBanner(res.data.banner);
        }
      } catch (error) {
        console.error("Failed to fetch site banner:", error);
      }
    };
    fetchBanner();
  }, []);

  return (
    <div className="md:w-1/2 flex justify-center relative animate-fadeIn delay-[600ms]">
      <div className="absolute -z-10 w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-cyan-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="relative w-[450px] h-[450px] flex items-center justify-center animate-float">
        <Image
          src={
            banner ||
            "https://ik.imagekit.io/fz0xzwtey/products/slider-img-1.png"
          }
          alt="Site Banner"
          width={450}
          height={450}
          className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] select-none object-contain"
          priority
        />
      </div>
    </div>
  );
}
