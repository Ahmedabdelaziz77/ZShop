"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../../packages/components/input/index";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormData = {
  email: string;
  password: string;
};

export default function Page() {
  const { register, handleSubmit } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-admin`,
        data,
        { withCredentials: true }
      );
      return res.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push("/dashboard");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid Credentials";
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="absolute w-72 h-72 bg-blue-600/20 rounded-full blur-3xl top-10 left-10 animate-pulse-slow" />
      <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse-slower" />

      <div
        className={`w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 transform transition-all duration-700 ${
          mounted
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-95"
        }`}
      >
        <h1 className="text-3xl font-semibold text-center text-white font-poppins mb-2 animate-fadeIn">
          Welcome Admin
        </h1>
        <p className="text-center text-gray-300 text-sm mb-6 animate-fadeIn delay-150">
          Sign in to access your dashboard
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 animate-fadeIn delay-200"
        >
          <Input
            label="Email"
            placeholder="example@gmail.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid Email Address",
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="********"
            {...register("password", {
              required: "Password is required",
            })}
          />

          {serverError && (
            <p className="text-red-400 text-sm mt-1 text-center">
              {serverError}
            </p>
          )}

          <button
            disabled={loginMutation.isPending}
            type="submit"
            className="w-full mt-4 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white text-sm font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-400 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400 animate-fadeIn delay-300">
          © {new Date().getFullYear()} Zshop Admin Portal
        </div>
      </div>
    </div>
  );
}
