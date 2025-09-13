"use client";

import GoogleButton from "apps/user-ui/src/shared/components/google-button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, _setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {};

  return (
    <div className="w-full min-h-[85vh] bg-gray-100 py-12 flex flex-col items-center animate-fadeIn">
      {/* HEADER */}
      <h1 className="text-4xl font-bold text-gray-900 font-Poppins animate-slideDown">
        Login
      </h1>
      <p className="text-base text-gray-500 mt-2 animate-fadeIn delay-100">
        Home <span className="mx-1">•</span> Login
      </p>

      {/* FORM WRAPPER */}
      <div className="w-full flex justify-center mt-8">
        <div className="md:w-[480px] w-full bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl animate-fadeUp">
          <h3 className="text-2xl font-semibold text-center text-gray-900">
            Login to Zshop
          </h3>
          <p className="text-center text-gray-500 mt-2 mb-6 text-sm">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 font-medium hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>

          {/* GOOGLE BUTTON */}
          <GoogleButton />

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3 text-gray-400 text-sm">Or sign in with</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* EMAIL FIELD */}
            <div className="animate-fadeIn delay-150">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 animate-shake">
                  {String(errors.email.message)}
                </p>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div className="animate-fadeIn delay-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 animate-shake">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex justify-between items-center text-sm animate-fadeIn delay-300">
              <label className="flex items-center text-gray-600 cursor-pointer transition-colors hover:text-gray-800">
                <input
                  type="checkbox"
                  className="mr-2 rounded accent-blue-600"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
              <Link
                href={"/forgot-password"}
                className="text-blue-600 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full rounded-lg bg-black text-white py-3 text-base font-medium hover:bg-gray-900 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Login
            </button>

            {serverError && (
              <p className="text-red-500 text-sm text-center mt-2 animate-shake">
                {serverError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
