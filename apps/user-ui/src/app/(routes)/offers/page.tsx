"use client";

import { useQuery } from "@tanstack/react-query";
import ProductCard from "apps/user-ui/src/shared/components/cards/product-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Range } from "react-range";

const MIN = 0,
  MAX = 1199;

export default function Page() {
  const router = useRouter();

  const [isProductLoading, setisProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

  const colors = [
    { name: "Black", code: "#000" },
    { name: "Red", code: "#ff0000" },
    { name: "Green", code: "#00ff00" },
    { name: "Blue", code: "#0000ff" },
    { name: "Yellow", code: "#ffff00" },
    { name: "Magenta", code: "#ff00ff" },
    { name: "Cyan", code: "#00ffff" },
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const updateURL = () => {
    const params = new URLSearchParams();
    params.set("priceRange", priceRange.join(","));
    if (selectedCategories?.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (selectedColors?.length > 0)
      params.set("colors", selectedColors.join(","));
    if (selectedSizes?.length > 0) params.set("sizes", selectedSizes.join(","));
    params.set("page", page.toString());
    params.set("limit", "12");
    router.replace(`/offers?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredProducts = async () => {
    setisProductLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("priceRange", priceRange.join(","));
      if (selectedCategories?.length > 0)
        query.set("categories", selectedCategories.join(","));
      if (selectedColors?.length > 0)
        query.set("colors", selectedColors.join(","));
      if (selectedSizes?.length > 0)
        query.set("sizes", selectedSizes.join(","));
      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `product/api/get-filtered-offers?${query.toString()}`
      );
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch filtered products.", err);
    } finally {
      setisProductLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data.categories;
    },
    staleTime: 1000 * 60 * 30,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat: string) => cat !== label)
        : [...prev, label]
    );
  };
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c: string) => c !== color)
        : [...prev, color]
    );
  };
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s: string) => s !== size)
        : [...prev, size]
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-white via-gray-50 to-gray-100 pb-14 transition-all duration-500 ease-in-out">
      <div className="w-[90%] lg:w-[80%] mx-auto">
        {/* Header */}
        <div className="pb-[50px] text-center">
          <h1 className="md:pt-[40px] font-semibold text-[40px] sm:text-[44px] leading-tight mb-[10px] font-jost text-gray-800 transition-all duration-500 hover:text-blue-600">
            All Offers
          </h1>
          <div className="flex justify-center items-center text-gray-500 text-sm sm:text-base">
            <Link
              href={"/"}
              className="hover:text-blue-600 hover:underline transition-all"
            >
              Home
            </Link>
            <span className="inline-block w-[5px] h-[5px] bg-gray-400 rounded-full mx-2" />
            <span className="text-gray-600">All Offers</span>
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="w-full lg:w-[270px] rounded-2xl bg-white p-6 space-y-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            {/* PRICE FILTER */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Price Filter
              </h3>
              <div className="ml-2">
                <Range
                  values={tempPriceRange}
                  step={1}
                  min={MIN}
                  max={MAX}
                  onChange={(values) => setTempPriceRange(values)}
                  renderTrack={({ props, children }) => {
                    const [min, max] = tempPriceRange;
                    const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                    const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;
                    return (
                      <div
                        {...props}
                        className="h-[6px] bg-blue-100 rounded-full relative cursor-pointer transition-all duration-200"
                        style={{ ...props.style }}
                      >
                        <div
                          className="absolute h-full bg-blue-600 rounded-full transition-all duration-200"
                          style={{
                            left: `${percentageLeft}%`,
                            width: `${percentageRight - percentageLeft}%`,
                          }}
                        />
                        {children}
                      </div>
                    );
                  }}
                  renderThumb={({ props }) => {
                    const { key, ...rest } = props;
                    return (
                      <div
                        key={key}
                        {...rest}
                        className="w-[18px] h-[18px] bg-blue-600 rounded-full shadow-md hover:scale-110 transform transition-transform duration-150"
                      />
                    );
                  }}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <div className="text-sm text-gray-600 font-medium">
                  ${tempPriceRange[0]} - ${tempPriceRange[1]}
                </div>
                <button
                  onClick={() => {
                    setPriceRange(tempPriceRange);
                    setPage(1);
                  }}
                  className="text-sm px-4 py-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md shadow-sm hover:shadow-md hover:scale-[1.03] transition-all"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* CATEGORY FILTER */}
            <div className="pt-3 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Filter by Category
              </h3>
              <ul className="space-y-2 mt-2">
                {isLoading ? (
                  <li className="text-center text-gray-500 animate-pulse">
                    Loading...
                  </li>
                ) : (
                  categories?.map((category: any) => (
                    <li
                      key={category}
                      className="flex items-center px-2 py-[3px] rounded-md hover:bg-blue-50 transition-all"
                    >
                      <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer w-full">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="accent-blue-600 cursor-pointer"
                        />
                        <span className="transition-all hover:text-blue-700">
                          {category}
                        </span>
                      </label>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* COLOR FILTER */}
            <div className="pt-3 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Filter by Color
              </h3>
              <ul className="space-y-2 mt-2">
                {colors?.map((color) => (
                  <li key={color.name}>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 rounded-md px-2 py-[3px] transition-all">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color.name)}
                        onChange={() => toggleColor(color.name)}
                        className="accent-blue-600 cursor-pointer"
                      />
                      <span
                        className="w-[16px] h-[16px] rounded-full border border-gray-300"
                        style={{ backgroundColor: color.code }}
                      />
                      <span className="hover:text-blue-700 transition-all">
                        {color.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* SIZE FILTER */}
            <div className="pt-3 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Filter by Size
              </h3>
              <ul className="space-y-2 mt-2">
                {sizes?.map((size) => (
                  <li key={size}>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 rounded-md px-2 py-[3px] transition-all">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="accent-blue-600 cursor-pointer"
                      />
                      <span className="font-medium hover:text-blue-700 transition-all">
                        {size}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* GRID */}
          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 animate-fadeIn">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    className="h-[250px] bg-gray-300 rounded-xl animate-pulse shadow-sm"
                    key={i}
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-5 transition-all duration-500 animate-fadeIn">
                {products?.map((product) => (
                  <ProductCard
                    product={product}
                    isEvent={product.starting_date}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center animate-fadeIn mt-8">
                No Offers Found!
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
