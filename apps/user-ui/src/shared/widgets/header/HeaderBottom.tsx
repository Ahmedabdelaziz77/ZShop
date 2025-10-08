"use client";

import { useEffect, useState } from "react";
import { AlignLeft, ChevronDown } from "lucide-react";
import Link from "next/link";

import useUser from "apps/user-ui/src/hooks/useUser";
import { navItems } from "../../../configs/constants";

import { CartIcon } from "../../../assets/svg/cart-icon";
import { HeartIcon } from "../../../assets/svg/heart-icon";
import { ProfileIcon } from "../../../assets/svg/profile-icon";
import Loader from "../../components/Loader";

export default function HeaderBottom() {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const { user, isLoading } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100 ? true : false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky
          ? "fixed top-0 left-0 z-[200] bg-white shadow-lg pb-[2px]"
          : "relative"
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        <div
          className={`w-[280px] ${
            isSticky && "-mb-1"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>
        {/* DROPDOWN MENU */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } w-[280px] h-[400px] bg-[#f5f5f5]`}
          ></div>
        )}
        {/* NAV LINKS */}
        <div className="flex items-center">
          {navItems.map((item: NavItemsTypes, i: number) => (
            <Link href={item.href} key={i} className="px-5 font-medium text-lg">
              {item.title}
            </Link>
          ))}
        </div>
        {/* CART, WISHLIST, USER LOGIN SHOWS WHILE SCROLLING */}
        <div>
          {isSticky && (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                {!isLoading && user ? (
                  <>
                    <Link
                      href={"/profile"}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    >
                      <ProfileIcon />
                    </Link>
                    <Link href={"/profile"}>
                      <span className="block font-medium">Hello, </span>
                      <span className="font-semibold">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={"/login"}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    >
                      <ProfileIcon />
                    </Link>
                    <Link href={"/login"}>
                      <span className="block font-medium">Hello, </span>
                      <span className="font-semibold">
                        {isLoading ? (
                          <Loader size={16} color="text-black" />
                        ) : (
                          "Sign In"
                        )}
                      </span>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-5">
                <Link href={"/wishlist"} className="relative">
                  <HeartIcon />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">0</span>
                  </div>
                </Link>
                <Link href={"/cart"} className="relative">
                  <CartIcon />
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">0</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
