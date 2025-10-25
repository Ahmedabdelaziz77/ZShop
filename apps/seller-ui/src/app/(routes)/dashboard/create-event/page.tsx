"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Wand, X } from "lucide-react";
import { useRouter } from "next/navigation";

import Input from "packages/components/input/index";
import ColorSelector from "packages/components/color-selector";
import CustomSpecifications from "packages/components/custom-specifications";
import CustomProperties from "packages/components/custom-properties";

import SizeSelector from "packages/components/size-selector";

import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder";
import Loader from "apps/seller-ui/src/shared/components/Loader";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";

import dynamic from "next/dynamic";
import Image from "next/image";
import { enhancements } from "apps/seller-ui/src/utils/AI.enhancement";
import toast from "react-hot-toast";

const RichTextEditor = dynamic(
  () => import("packages/components/rich-text-editor"),
  { ssr: false }
);

interface UploadedImage {
  fileId: string;
  file_url: string;
}

export default function Page() {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, _setIsChanged] = useState(true);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageUploadingLoader, setImageUploadingLoader] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setImageUploadingLoader(true);
    try {
      const fileName = await convertFileToBase64(file);
      const res = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName }
      );

      const uploadedImage: UploadedImage = {
        fileId: res.data.fileId,
        file_url: res.data.file_url,
      };
      const updatedImages = [...images];
      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && images.length < 8)
        updatedImages.push(null);

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (err) {
      console.error(err);
    } finally {
      setImageUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: {
            fileId: imageToDelete.fileId!,
          },
        });
      }
      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8)
        updatedImages.push(null);

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDraft = () => {};

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);
    try {
      const transformationUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformationUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

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

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-event", formData);
      router.push("/dashboard/all-events");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* HEADINGS */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Event
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Event</span>
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
              images={images}
              imageUploadingLoader={imageUploadingLoader}
              onImageChange={handleImageChange}
              setSelectedImage={setSelectedImage}
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
                images={images}
                imageUploadingLoader={imageUploadingLoader}
                onImageChange={handleImageChange}
                setSelectedImage={setSelectedImage}
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
                label="Event Title *"
                placeholder="Enter event title"
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
                  placeholder="Enter short description for quick view"
                  {...register("short_description", {
                    required: "Description is required!",
                    validate: (value) => {
                      const wordCount = value?.trim()?.split(/\s+/).length || 0;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>

              {/* TAGS */}
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="promo, launch, livestream"
                  {...register("tags", {
                    required: "Separate related tags with a comma",
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
                  placeholder="event-slug"
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
                  name="subCategory"
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
                      {useMemo(
                        () =>
                          (selectedCategory
                            ? subCategoriesData[selectedCategory] || []
                            : []
                          ).map((subcategory: string) => (
                            <option
                              className="bg-black"
                              value={subcategory}
                              key={subcategory}
                            >
                              {subcategory}
                            </option>
                          )),
                        [selectedCategory, subCategoriesData]
                      )}
                    </select>
                  )}
                />
                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message as string}
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
                      const wordCount =
                        value?.split(/\s+/).filter((word: string) => word)
                          .length || 0;
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

              {/* EVENT DATES (NEW) */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Event Start (optional)
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-700 bg-gray-900 text-white rounded-md p-2 text-sm"
                  {...register("starting_date", {
                    setValueAs: (v) => (v ? new Date(v).toISOString() : null),
                  })}
                />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Event End (optional)
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-700 bg-gray-900 text-white rounded-md p-2 text-sm"
                  {...register("ending_date", {
                    setValueAs: (v) => (v ? new Date(v).toISOString() : null),
                    validate: (value) => {
                      const startISO = watch("starting_date");
                      if (!value || !startISO) return true;
                      const start = new Date(startISO);
                      const end = new Date(value);
                      if (isNaN(start.getTime()) || isNaN(end.getTime()))
                        return true;
                      if (end <= start) return "End must be after Start";
                      return true;
                    },
                  })}
                />
                {errors.ending_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.ending_date.message)}
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
                <label className="block font-semibold text-gray-300 mb-2 text-sm">
                  Select Discount Codes{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>

                {discountLoading ? (
                  <p className="text-gray-400 text-sm italic">
                    Loading discount codes...
                  </p>
                ) : discountCodes.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    No discount codes available.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes.map((discount: any) => {
                      const isSelected = watch("discountCodes")?.includes(
                        discount.id
                      );

                      return (
                        <button
                          key={discount.id}
                          type="button"
                          onClick={() => {
                            const currentSelection =
                              watch("discountCodes") || [];
                            const updatedSelection = isSelected
                              ? currentSelection.filter(
                                  (id: string) => id !== discount.id
                                )
                              : [...currentSelection, discount.id];
                            setValue("discountCodes", updatedSelection);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
              ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700"
                  : "bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500 hover:text-white"
              }`}
                        >
                          <span>{discount?.public_name}</span>
                          <span className="ml-2 text-xs font-normal opacity-80">
                            {discount.discountValue}
                            {discount.discountType === "percentage" ? "%" : "$"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/*  */}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FOR IMAGE ENHANCEMENTS */}
      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
            <div className="flex items-center justify-between pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Event Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(!openImageModal)}
              />
            </div>
            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
              <Image
                src={selectedImage}
                alt="event-image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                unoptimized
              />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-white text-sm font-semibold">
                  AI Enhancements
                </h3>
                <div className="grid grid-cols-2 gap-3 mx-h-[250px] overflow-y-auto">
                  {enhancements?.map(({ label, effect }) => (
                    <button
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORM BUTTONS */}
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
