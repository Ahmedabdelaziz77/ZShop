"use client";

import { useMutation } from "@tanstack/react-query";
import Loader from "apps/user-ui/src/shared/components/Loader";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormData = {
  email: string;
  password: string;
};

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  /** 🔹 Helper: Extract readable error message */
  const getErrorMessage = (error: AxiosError, fallback: string) =>
    (error.response?.data as { message?: string })?.message ||
    error.message ||
    fallback;

  /** 🔹 Start resend countdown safely */
  const startResendTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /** 🔹 Step 1: Request OTP */
  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) =>
      (
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`,
          { email }
        )
      ).data,
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      setServerError(getErrorMessage(error, "Failed to send OTP."));
    },
  });

  /** 🔹 Step 2: Verify OTP */
  const verifyOtpMutation = useMutation({
    mutationFn: async () =>
      (
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,
          { email: userEmail, otp: otp.join("") }
        )
      ).data,
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      setServerError(getErrorMessage(error, "Invalid OTP. Try again!"));
    },
  });

  /** 🔹 Step 3: Reset Password */
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) =>
      (
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`,
          { email: userEmail, newPassword: password }
        )
      ).data,
    onSuccess: () => {
      setStep("email");
      toast.success("Password reset successfully! Please login.");
      setServerError(null);
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      setServerError(getErrorMessage(error, "Can't reset password."));
    },
  });

  /** 🔹 OTP Handlers */
  const handleOtpChange = (i: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[i] = value;
    setOtp(newOtp);
    if (value && i < inputRefs.current.length - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i < otp.length - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  /** 🔹 Resend OTP */
  const resendOtp = () => {
    if (userEmail) {
      setOtp(["", "", "", ""]);
      requestOtpMutation.mutate({ email: userEmail });
    }
  };

  const onSubmitEmail = ({ email }: { email: string }) =>
    requestOtpMutation.mutate({ email });

  const onSubmitPassword = ({ password }: { password: string }) =>
    resetPasswordMutation.mutate({ password });

  return (
    <div className="w-full min-h-[85vh] bg-gray-100 py-12 flex flex-col items-center animate-fadeIn">
      {/* HEADER */}
      <h1 className="text-4xl font-bold text-gray-900 font-Poppins animate-slideDown">
        Forgot Password
      </h1>
      <p className="text-base text-gray-500 mt-2 animate-fadeIn delay-100 mb-2">
        Home <span className="mx-1">•</span> Forgot-password
      </p>

      {/* FORM WRAPPER */}
      <div className="w-full flex justify-center mt-8">
        <div className="md:w-[480px] w-full bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl animate-fadeUp">
          {/* STEP 1: EMAIL */}
          {step === "email" && (
            <>
              <h3 className="text-2xl font-semibold text-center text-gray-900">
                Reset your password
              </h3>
              <p className="text-center text-gray-500 mt-2 mb-6 text-sm">
                Go back to{" "}
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:underline transition-colors"
                >
                  Login
                </Link>
              </p>

              <form
                onSubmit={handleSubmit(onSubmitEmail)}
                className="space-y-5"
              >
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

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full rounded-lg bg-black text-white py-3 text-base font-medium hover:bg-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestOtpMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader size={24} color="text-white" /> Sending OTP...
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>

                {requestOtpMutation.isError && serverError && (
                  <p className="text-red-500 text-sm text-center mt-2 animate-shake">
                    {serverError}
                  </p>
                )}
              </form>
            </>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      if (el) inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    placeholder="-"
                    maxLength={1}
                    aria-label={`OTP digit ${i + 1}`}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-semibold"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
                className="w-full mt-4 rounded-lg bg-blue-500 text-white py-3 text-base font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyOtpMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={20} color="text-white" /> Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="text-blue-500 cursor-pointer hover:underline"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>

              {verifyOtpMutation.isError && serverError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {serverError}
                </p>
              )}
            </div>
          )}

          {/* STEP 3: RESET */}
          {step === "reset" && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label className="block text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {String(errors.password.message)}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full rounded-lg bg-black text-white py-3 text-base font-medium hover:bg-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetPasswordMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader size={24} color="text-white" /> Resetting...
                    </div>
                  ) : (
                    "Reset password"
                  )}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
