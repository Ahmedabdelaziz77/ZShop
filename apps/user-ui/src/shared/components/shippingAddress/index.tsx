"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { countries } from "apps/user-ui/src/configs/constants";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { MapPin, Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Loader from "../Loader";

export default function ShippingAddressSection() {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      zip: "",
      country: "Egypt",
      isDefault: "false",
    },
  });

  const { mutate: addAddress, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post("/api/add-address", payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      reset();
      setShowModal(false);
    },
  });

  const { mutate: deleteAddress, isPending: idDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`api/delete-address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
    staleTime: 3 * 60 * 60,
  });

  const onSubmit = async (data: any) => {
    addAddress({ ...data, isDefault: data?.isDefault === "true" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
          Saved Addresses
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Addresses */}
      <div>
        {addressesLoading ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Loading addresses...
          </p>
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">
            No saved addresses found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {addresses.map((address: any) => (
              <div
                key={address.id}
                className="relative border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {address?.isDefault && (
                  <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
                    Default
                  </span>
                )}

                <div className="flex items-start gap-3 text-gray-700">
                  <div className="mt-0.5 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-sm leading-relaxed">
                    <p className="font-semibold text-gray-800">
                      {address?.label} — {address?.name}
                    </p>
                    <p className="text-gray-600">
                      {address?.street}, {address?.city}, {address?.zip},{" "}
                      {address?.country}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline transition"
                    onClick={() => deleteAddress(address.id)}
                    disabled={idDeleting}
                  >
                    <Trash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-fadeIn border border-gray-100">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-5 h-5" />
              {""}
            </button>

            {/* Header */}
            <h3 className="text-xl font-semibold text-gray-800 mb-5 text-center">
              Add New Address
            </h3>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  {...register("label")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <input
                  placeholder="Full Name"
                  {...register("name", { required: "Name is required!" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Street */}
              <div>
                <input
                  placeholder="Street Address"
                  {...register("street", { required: "Street is required!" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
                {errors.street && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.street.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <input
                  placeholder="City"
                  {...register("city", { required: "City is required!" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <input
                  placeholder="ZIP / Postal Code"
                  {...register("zip", { required: "ZIP Code is required!" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
                {errors.zip && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.zip.message}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  {...register("country")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Setting
                </label>
                <select
                  {...register("isDefault")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="true">Set as Default</option>
                  <option value="false">Not Default</option>
                </select>
              </div>

              {/* Submit */}
              <button
                className="w-full bg-blue-600 text-white font-medium text-sm py-2.5 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-70"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader color="text-white" size={20} />
                    Saving...
                  </div>
                ) : (
                  "Save Address"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
