"use client";

import { shops } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import {
  Calendar,
  Clock,
  Globe,
  Heart,
  MapPin,
  Star,
  Users,
  XIcon,
  YoutubeIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "../../components/cards/product-card";

const TABS = ["Products", "Offers", "Reviews"];

export default function SellerProfile({
  shop,
  followersCount,
}: {
  shop: shops;
  followersCount: number;
}) {
  const [activeTab, setActiveTab] = useState("Products");
  const [followers, setFollowers] = useState(followersCount);
  const [isFollowing, setIsFollowing] = useState(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-seller-products/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
  });

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["seller-events"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-seller-events/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
  });

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shop?.id) return;
      try {
        const res = await axiosInstance.get(
          `/seller/api/is-following/${shop?.id}`
        );
        setIsFollowing(res.data.isFollowing !== null);
      } catch (err) {
        console.error("Failed to fetch follow status!", err);
      }
    };
    fetchFollowStatus();
  }, [shop?.id]);

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing)
        await axiosInstance.post("/seller/api/unfollow-shop", {
          shopId: shop?.id,
        });
      else
        await axiosInstance.post("/seller/api/follow-shop", {
          shopId: shop?.id,
        });
    },
    onSuccess: () => {
      setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ["is-following", shop?.id] });
    },
  });

  // Tracking
  const TRACK_URL =
    (process.env.NEXT_PUBLIC_TRACK_URL ?? "http://localhost:6010") + "/track";

  async function postTrack(payload: any) {
    try {
      await fetch(TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (e) {
      console.error("Tracking failed:", e);
    }
  }

  useEffect(() => {
    if (!isLoading && user?.id && shop?.id && location && deviceInfo) {
      postTrack({
        userId: user.id,
        shopId: shop.id,
        action: "shop_visit",
        country: location.country || "Unknown",
        city: location.city || "Unknown",
        device: deviceInfo || "Unknown Device",
      });
    }
  }, [user, shop, location, deviceInfo, isLoading]);

  // Animations
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1 }}
      className="min-h-screen bg-[#0f111a] text-white pb-10 overflow-x-hidden"
    >
      {/* Banner */}
      <motion.div
        variants={fadeIn}
        className="relative w-full h-[300px] overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <Image
            src={
              shop?.coverBanner ||
              "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80"
            }
            alt="Seller Cover"
            fill
            className="object-cover opacity-80"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </motion.div>

      {/* Profile Section */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="w-[90%] lg:w-[75%] mx-auto mt-[-80px] flex flex-col lg:flex-row gap-6 relative z-20"
      >
        {/* Left Card */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="bg-[#181b28] w-full lg:w-[70%] p-6 rounded-xl shadow-lg border border-gray-800 hover:border-blue-600 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-[110px] h-[110px] rounded-full overflow-hidden border-4 border-[#2b2f45] shadow-md"
            >
              <Image
                src={
                  (shop as any)?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                }
                alt="Shop Avatar"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <motion.h1
                variants={fadeUp}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold tracking-wide"
              >
                {shop?.name}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-gray-300 text-sm mt-1 max-w-[90%]"
              >
                {shop?.bio || "You will get anything related to this category."}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center gap-4 mt-3 text-gray-400"
              >
                <div className="flex items-center gap-1">
                  <Star fill="#facc15" size={18} />
                  <span>{shop?.ratings || "N/A"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={18} />
                  <span>{followers} Followers</span>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex items-center gap-2 mt-3 text-gray-400 text-sm"
              >
                <Clock size={16} />
                <span>{shop?.opening_hours || "Mon - Fri 9am to 10pm"}</span>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex items-center gap-2 mt-2 text-gray-400 text-sm"
              >
                <MapPin size={16} />
                <span>{shop?.address || "No Address Provided"}</span>
              </motion.div>
            </div>

            {/* Follow Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleFollowMutation.mutate()}
              disabled={toggleFollowMutation.isPending}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              }`}
            >
              <Heart size={18} />
              {isFollowing ? "Unfollow" : "Follow"}
            </motion.button>
          </div>
        </motion.div>

        {/* Right Card */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          className="bg-[#181b28] p-6 rounded-xl shadow-lg border border-gray-800 hover:border-blue-600 transition-all duration-300 w-full lg:w-[30%]"
        >
          <h2 className="text-lg font-semibold text-white mb-3">
            Shop Details
          </h2>
          <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
            <Calendar size={16} />
            <span>
              Joined At: {new Date(shop?.createdAt!).toLocaleDateString()}
            </span>
          </div>

          {shop?.website && (
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
              <Globe size={16} />
              <Link
                href={shop.website}
                target="_blank"
                className="text-blue-400 hover:underline"
              >
                {shop.website}
              </Link>
            </div>
          )}

          {shop?.socialLinks && shop?.socialLinks.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm text-gray-400 mb-2">Follow Us:</h3>
              <div className="flex gap-3">
                {shop.socialLinks.map((link: any, i: number) => (
                  <motion.a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-70 hover:opacity-100"
                    whileHover={{ scale: 1.15 }}
                  >
                    {link.type === "youtube" && <YoutubeIcon />}
                    {link.type === "x" && <XIcon />}
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Tabs Section */}
      <motion.div
        variants={fadeUp}
        className="w-[90%] lg:w-[75%] mx-auto mt-10"
      >
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-lg font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {activeTab === "Products" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-[250px] bg-gray-800 animate-pulse rounded-lg"
                    />
                  ))
                ) : products?.length ? (
                  products.map((product: any) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-6">
                    No products available yet!
                  </p>
                )}
              </div>
            )}

            {activeTab === "Offers" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isEventsLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[250px] bg-gray-800 animate-pulse rounded-lg"
                    />
                  ))
                ) : events?.length ? (
                  events.map((product: any) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} isEvent />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-6">
                    No offers available yet!
                  </p>
                )}
              </div>
            )}

            {activeTab === "Reviews" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 py-10"
              >
                No Reviews Available yet!
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
