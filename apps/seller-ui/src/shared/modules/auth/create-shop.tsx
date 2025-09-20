import { useMutation } from "@tanstack/react-query";
import { shopCategories } from "apps/seller-ui/src/utils/categories";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import Loader from "../../components/Loader";

export default function CreateShop({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /** 🔹 Error helper */
  const getErrorMessage = (error: AxiosError, fallback: string) =>
    (error.response?.data as { message?: string })?.message ||
    error.message ||
    fallback;

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (words: string) => words.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup New Shop
        </h3>

        {/* SHOP NAME */}
        <div>
          <label className="block text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            placeholder="Shop name"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 animate-shake">
              {String(errors.name.message)}
            </p>
          )}
        </div>

        {/* BIO */}
        <div>
          <label className="block text-gray-700 mb-2">
            Bio (Max 100 words) *
          </label>
          <textarea
            placeholder="Describe your shop..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 resize-none"
            {...register("bio", {
              required: "Shop bio is required",
              validate: (value) =>
                countWords(value) <= 100 || "Bio can't exceed 100 words",
            })}
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-red-500 animate-shake">
              {String(errors.bio.message)}
            </p>
          )}
        </div>

        {/* SHOP ADDRESS */}
        <div>
          <label className="block text-gray-700 mb-2">Address *</label>
          <input
            type="text"
            placeholder="Shop location"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
            {...register("address", { required: "Shop address is required" })}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500 animate-shake">
              {String(errors.address.message)}
            </p>
          )}
        </div>

        {/* OPENING HOURS */}
        <div>
          <label className="block text-gray-700 mb-2">Opening Hours *</label>
          <input
            type="text"
            placeholder="e.g., Mon-Fri 9AM - 6PM"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
            {...register("opening_hours", {
              required: "Opening hours are required",
            })}
          />
          {errors.opening_hours && (
            <p className="mt-1 text-xs text-red-500 animate-shake">
              {String(errors.opening_hours.message)}
            </p>
          )}
        </div>

        {/* WEBSITE */}
        <div>
          <label className="block text-gray-700 mb-2">Website</label>
          <input
            type="url"
            placeholder="https://example.com"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
            {...register("website", {
              pattern: {
                value:
                  /^(https?:\/\/)(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[^\s]*)?$/,
                message: "Enter a valid URL",
              },
            })}
          />
          {errors.website && (
            <p className="mt-1 text-xs text-red-500 animate-shake">
              {String(errors.website.message)}
            </p>
          )}
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-gray-700 mb-2">Category *</label>
          <select
            className="w-full p-3 border border-gray-300 !rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300"
            {...register("category", { required: "Category is required" })}
          >
            <option value="">Select a category</option>
            {shopCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-500 animate-shake">
              {String(errors.category.message)}
            </p>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={shopCreateMutation.isPending}
          className="w-full mt-4 rounded-lg bg-black text-white py-3 text-base font-medium hover:bg-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {shopCreateMutation.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader size={24} color="text-white" />
              Creating...
            </div>
          ) : (
            "Create Shop"
          )}
        </button>

        {/* ERROR MESSAGE */}
        {shopCreateMutation.isError &&
          shopCreateMutation.error instanceof AxiosError && (
            <p className="text-red-500 text-sm mt-2">
              {getErrorMessage(
                shopCreateMutation.error,
                "Failed to create shop"
              )}
            </p>
          )}
      </form>
    </div>
  );
}
