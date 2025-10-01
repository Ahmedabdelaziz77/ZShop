"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "apps/seller-ui/src/shared/components/Loader";
import DeleteDiscountCodeModal from "apps/seller-ui/src/shared/components/modals/delete-discount-code";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { AxiosError } from "axios";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import Input from "packages/components/input";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/product/api/create-discount-code", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
      await axiosInstance.delete(
        `/product/api/delete-discount-code/${discountId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowDeleteModal(false);
    },
  });

  const handleDeleteClick = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes!");
      return;
    }
    createDiscountCodeMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          Create Discount
        </button>
      </div>

      {/* BREADCRUMBS */}
      <div className="flex items-center text-white">
        <Link href="/dashboard" className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      {/* DISCOUNT CODES */}
      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((discount: any) => (
                <tr
                  key={discount?.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discount?.public_name}</td>
                  <td className="p-3">
                    {discount?.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Flat ($)"}
                  </td>
                  <td className="p-3">
                    {discount.discountType === "percentage"
                      ? `${discount.discountValue}%`
                      : `$${discount.discountValue}`}
                  </td>
                  <td className="p-3">{discount.discountCode}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash size={18} />
                      {""}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {!isLoading && discountCodes?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-gray-400 text-center w-full pt-4"
                >
                  No Discount Codes Available !
                </td>
              </tr>
            )}
          </table>
        )}
      </div>

      {/* CREATE DISCOUNT MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div
            className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-[460px] shadow-xl
                 animate-[fadeIn_0.3s_ease-out]"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-semibold text-white">
                Create Discount Code
              </h3>
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
                {""}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {/* TITLE */}
              <div>
                <Input
                  label="Title (Public Name)"
                  {...register("public_name", {
                    required: "Title is required!",
                  })}
                />
                {errors.public_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.public_name.message}
                  </p>
                )}
              </div>

              {/* DISCOUNT TYPE */}
              <div>
                <label className="block font-medium text-gray-300 mb-1 text-sm">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2.5 rounded-md border border-gray-700 bg-gray-900 text-white text-sm
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                           transition-all duration-300 hover:border-gray-500 cursor-pointer"
                    >
                      <option
                        value="percentage"
                        className="bg-gray-800 text-white"
                      >
                        Percentage (%)
                      </option>
                      <option value="flat" className="bg-gray-800 text-white">
                        Flat Amount ($)
                      </option>
                    </select>
                  )}
                />
                {errors.discountType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              {/* DISCOUNT VALUE */}
              <div>
                <Input
                  label="Discount Value"
                  type="number"
                  min={1}
                  {...register("discountValue", {
                    required: "Value is required!",
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              {/* DISCOUNT CODE */}
              <div>
                <Input
                  label="Discount Code"
                  {...register("discountCode", {
                    required: "Discount Code is required!",
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountCode.message}
                  </p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={createDiscountCodeMutation.isPending}
                className={`w-full py-2.5 rounded-md font-semibold flex items-center justify-center gap-2
                     transition-all duration-200 focus:outline-none focus:ring-2
                     ${
                       createDiscountCodeMutation.isPending
                         ? "bg-blue-400 text-white cursor-not-allowed"
                         : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
                     }`}
              >
                {createDiscountCodeMutation.isPending ? (
                  <>
                    <Loader size={18} color="text-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create
                  </>
                )}
              </button>

              {/* ERROR MESSAGE */}
              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {(
                    createDiscountCodeMutation.error as AxiosError<{
                      message: string;
                    }>
                  )?.response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* DELETE DISCOUNT MODAL */}
      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() =>
            deleteDiscountCodeMutation.mutate(selectedDiscount?.id)
          }
          isLoading={deleteDiscountCodeMutation.isPending}
        />
      )}
    </div>
  );
}
