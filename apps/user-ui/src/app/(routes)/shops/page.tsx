"use client";

import { countries, shopCategories } from "apps/user-ui/src/configs/constants";
import ShopCard from "apps/user-ui/src/shared/components/cards/shop-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();

  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const updateURL = () => {
    const params = new URLSearchParams();

    if (selectedCategories?.length > 0)
      params.set("categories", selectedCategories.join(","));

    if (selectedCountries?.length > 0)
      params.set("countries", selectedCountries.join(","));

    params.set("page", page.toString());
    params.set("limit", "12");
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();

      if (selectedCategories?.length > 0)
        query.set("categories", selectedCategories.join(","));

      if (selectedCountries?.length > 0)
        query.set("countries", selectedCountries.join(","));
      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `product/api/get-filtered-shops?${query.toString()}`
      );
      setShops(res.data.shops);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch filtered shops.", err);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [selectedCategories, page]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat: string) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((cou) => cou !== country)
        : [...prev, country]
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-white via-gray-50 to-gray-100 pb-14 transition-all duration-500 ease-in-out">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        {/* Header */}
        <div className="pb-[50px] text-center">
          <h1 className="md:pt-[40px] font-semibold text-[40px] sm:text-[44px] leading-tight mb-[10px] font-jost text-gray-800 transition-all duration-500 hover:text-blue-600">
            All Shops
          </h1>
          <div className="flex justify-center items-center text-gray-500 text-sm sm:text-base">
            <Link
              href={"/"}
              className="hover:text-blue-600 hover:underline transition-all"
            >
              Home
            </Link>
            <span className="inline-block w-[5px] h-[5px] bg-gray-400 rounded-full mx-2" />
            <span className="text-gray-600">All Shops</span>
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="w-full lg:w-[270px] rounded-2xl bg-white p-6 space-y-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            {/* CATEGORY FILTER */}
            <div className="">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b border-b-slate-200">
                Categories
              </h3>
              <ul className="space-y-2 mt-2">
                {shopCategories?.map((category: any) => (
                  <li
                    key={category.value}
                    className="flex items-center px-2 py-[3px] rounded-md hover:bg-blue-50 transition-all"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                        className="accent-blue-600 cursor-pointer"
                      />
                      <span className="transition-all hover:text-blue-700">
                        {category.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              {/* COUNTRIES FILTER */}
              <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-200 mt-2 pb-2">
                Countries
              </h3>
              <ul className="space-y-2 !mt-3">
                {countries?.map((country: any) => (
                  <li
                    key={country.code}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(country.code)}
                        onChange={() => toggleCountry(country.code)}
                        className="accent-blue-600"
                      />
                      {country.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* GRID */}
          <div className="flex-1 px-2 lg:px-3">
            {isShopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 animate-fadeIn">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    className="h-[250px] bg-gray-300 rounded-xl animate-pulse shadow-sm"
                    key={i}
                  />
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-5 transition-all duration-500 animate-fadeIn">
                {shops?.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center animate-fadeIn mt-8">
                No Shops Found!
              </p>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium shadow-sm transition-all duration-300 ${
                      page === i + 1
                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md scale-105"
                        : "bg-white text-gray-800 hover:bg-blue-50 hover:scale-105"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
