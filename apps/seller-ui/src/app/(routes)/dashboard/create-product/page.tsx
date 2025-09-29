"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

import Input from "packages/components/input/index";
import ColorSelector from "packages/components/color-selector";
import CustomSpecifications from "packages/components/custom-specifications";
import CustomProperties from "packages/components/custom-properties";

import SizeSelector from "packages/components/size-selector";

import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder";
import Loader from "apps/seller-ui/src/shared/components/Loader";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";

import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("packages/components/rich-text-editor"),
  { ssr: false }
);

export default function Page() {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [_openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, _setIsChanged] = useState(true);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, _setLoading] = useState(false);

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;
    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
    setValue("images", updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((images) => {
      let updatedImages = [...images];
      if (index === -1) updatedImages[0] = null;
      else updatedImages.splice(index, 1);
      if (!updatedImages.includes(null) && updatedImages.length < 8)
        updatedImages.push(null);
      return updatedImages;
    });
    setValue("images", images);
  };

  const handleSaveDraft = () => {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`/product/api/get-categories`);
        return res.data;
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");
  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);
  const onSubmit = (data: any) => {
    console.log(data);
  };
  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* HEADINGS */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      {/* CONTENT LAYOUT */}
      <div className="py-4 w-full flex gap-6">
        {/* LEFTSIDE */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 × 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images?.slice(1).map((_, index) => (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                size="765 × 850"
                small={true}
                key={index}
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* PRODUCT DETAILS INPUTS LEFT SIDE */}
            <div className="w-2/4">
              {/* TITLE */}

              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required!" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              {/* Description  */}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register("description", {
                    required: "Description is required!",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>
              {/* TAGS */}
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple, flagship"
                  {...register("tags", {
                    required: "Seperate related tags with a coma,",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>
              {/*  WARRANTY */}
              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warranty"
                  {...register("warranty", {
                    required: "Warranty is required!",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              {/* SLUG */}

              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required!",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Invalid slug format! Use only lowercase letters, numbers, and hyphens.",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long!",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot be longer than 50 characters!",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              {/* BRAND */}

              <div className="mt-2">
                <Input
                  label="Brand *"
                  placeholder="Nike"
                  {...register("brand", {
                    required: "Brand is required!",
                  })}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              {/* COLOR SELECTOR INPUTS  */}

              <div className="mt-2">
                <ColorSelector control={control} />
              </div>

              {/*  CUSTOM SPECIFICATIONS*/}

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              {/*  CUSTOM PROPERTIES  */}
              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              {/* CASH ON DELIVERY */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  className="w-full border border-gray-700 bg-gray-900 text-white rounded-md p-2 text-sm
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
             transition-all duration-300 hover:border-gray-500 cursor-pointer"
                  defaultValue="yes"
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required!",
                  })}
                >
                  <option value="yes" className="bg-gray-800 text-white">
                    Yes
                  </option>
                  <option value="no" className="bg-gray-800 text-white">
                    No
                  </option>
                </select>

                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* PRODUCT DETAILS INPUTS RIGHT SIDE */}
            <div className="w-2/4">
              {/* CATEGORY */}
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading Categories</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required!" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 bg-gray-900 text-white rounded-md p-2 text-sm
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
             transition-all duration-300 hover:border-gray-500 cursor-pointer"
                    >
                      <option value="" className="bg-black">
                        Select Category
                      </option>
                      {categories.map((category: string) => (
                        <option
                          className="bg-black"
                          value={category}
                          key={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              {/* SUBCATEGORY */}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory *
                </label>
                <Controller
                  name="Subcategory"
                  control={control}
                  rules={{ required: "Subcategory is required!" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 bg-gray-900 text-white rounded-md p-2 text-sm
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
             transition-all duration-300 hover:border-gray-500 cursor-pointer"
                    >
                      <option value="" className="bg-black">
                        Select Subcategory
                      </option>
                      {subcategories.map((subcategory: string) => (
                        <option
                          className="bg-black"
                          value={subcategory}
                          key={subcategory}
                        >
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.Subcategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.Subcategory.message as string}
                  </p>
                )}
              </div>

              {/* RICHTEXTEDITOR */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required!",
                    validate: (value) => {
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 100 ||
                        "Description must be at least 100 words!"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>
              {/* VIDEO URL */}
              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                      message:
                        "Invalid Youtube embed URL! Use format: https://www.youtube.com/embed/xyz123",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              {/* REGULAR PRICE */}
              <div className="mt-2">
                <Input
                  label="Regular Price *"
                  placeholder="20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) =>
                      !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              {/* SALE PRICE */}
              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="18$"
                  {...register("sale_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Sale Price must be at least 1" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice)
                        return "Sale price must be less than Regular Price";
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              {/* PRODUCT STOCK */}
              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required!",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Stock Price must be at least 1",
                    },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number!";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              {/* SIZE SELECTOR */}
              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              {/* SELECTING DISCOUNT  */}
              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>
              </div>

              {/*  */}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-md border border-gray-600 bg-gray-800 text-gray-200
                 hover:bg-gray-700 hover:text-white transition-all duration-200
                 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          >
            Save Draft
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2.5 rounded-md font-medium flex items-center justify-center gap-2
      transition-all duration-200 focus:ring-2 focus:outline-none
      ${
        loading
          ? "bg-blue-400 text-white cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97] focus:ring-blue-500"
      }`}
        >
          {loading ? (
            <>
              <Loader size={15} color="text-white" />
              <span>Creating...</span>
            </>
          ) : (
            "Create"
          )}
        </button>
      </div>
    </form>
  );
}
