"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

export default function LogoSection() {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axiosInstance.get("/api/get-logo");
        if (res.data?.success && res.data.logo) {
          setLogo(res.data.logo);
        }
      } catch (error) {
        console.error("Failed to fetch site logo:", error);
      }
    };
    fetchLogo();
  }, []);

  return (
    <div>
      <Link href={"/"}>
        <Image
          src={logo || "/logo.png"}
          alt="logo"
          width={100}
          height={100}
          className="object-contain"
        />
      </Link>
    </div>
  );
}
