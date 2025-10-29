"use client";

import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Loader from "../Loader";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePassword() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const newPassword = watch("newPassword");

  const onSubmit = async (data: FormData) => {
    setError("");
    setMessage("");
    try {
      await axiosInstance.post("/api/change-password", data);
      setMessage("Password updated successfully!");
      reset();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white/80 rounded-2xl p-8 transition-all">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Update Your Password
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter your current password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            {...register("currentPassword", {
              required: "Current password is required!",
              minLength: {
                value: 8,
                message: "Must be at least 8 characters",
              },
            })}
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter a new secure password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            {...register("newPassword", {
              required: "New password is required!",
              minLength: {
                value: 8,
                message: "Must be at least 8 characters",
              },
              validate: {
                hasLower: (v) =>
                  /[a-z]/.test(v) || "Must include a lowercase letter",
                hasUpper: (v) =>
                  /[A-Z]/.test(v) || "Must include an uppercase letter",
                hasNumber: (v) => /\d/.test(v) || "Must include a number",
              },
            })}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.newPassword.message}
            </p>
          )}

          {/* Password strength indicator */}
          {newPassword && (
            <div className="mt-3">
              <div className="flex gap-1 mb-1">
                <span
                  className={`h-1 flex-1 rounded-full ${
                    newPassword.length >= 8 ? "bg-green-500" : "bg-red-300"
                  }`}
                ></span>
                <span
                  className={`h-1 flex-1 rounded-full ${
                    /[A-Z]/.test(newPassword) ? "bg-green-500" : "bg-red-300"
                  }`}
                ></span>
                <span
                  className={`h-1 flex-1 rounded-full ${
                    /\d/.test(newPassword) ? "bg-green-500" : "bg-red-300"
                  }`}
                ></span>
              </div>
              <p className="text-[11px] text-gray-500 text-center">
                Password Strength
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Re-enter new password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            {...register("confirmPassword", {
              required: "Please confirm your password!",
              validate: (v) => v === newPassword || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 rounded-lg text-white font-medium 
                     transition-all duration-200 shadow-sm 
                     ${
                       isSubmitting
                         ? "bg-blue-400 cursor-not-allowed"
                         : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                     }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader size={20} color="text-white" />
              Updating...
            </div>
          ) : (
            "Update Password"
          )}
        </button>
      </form>

      {/* Feedback */}
      <div className="mt-5 text-center">
        {error && (
          <p className="text-red-500 text-sm animate-fade-in">{error}</p>
        )}
        {message && (
          <p className="text-green-600 text-sm animate-fade-in">{message}</p>
        )}
      </div>
    </div>
  );
}
