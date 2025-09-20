"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { countries } from "apps/seller-ui/src/utils/countries";
import CreateShop from "apps/seller-ui/src/shared/modules/auth/create-shop";
import Loader from "apps/seller-ui/src/shared/components/Loader";
import StripeLogo from "apps/seller-ui/src/assets/svgs/stripe-logo";

export default function Signup() {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerId, setSellerId] = useState("");
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /** 🔹 Helper for extracting error messages */
  const getErrorMessage = (error: AxiosError, fallback: string) =>
    (error.response?.data as { message?: string })?.message ||
    error.message ||
    fallback;

  /** 🔹 Start resend countdown with cleanup */
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

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registeration`,
        data
      );
      return res.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`,
        {
          ...sellerData,
          otp: otp.join(""),
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  const onSubmit = (data: any) => {
    signupMutation.mutate(data);
  };

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

  const resendOtp = () => {
    if (sellerData) {
      setOtp(["", "", "", ""]);
      signupMutation.mutate(sellerData);
    }
  };

  const connectStripe = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`,
        { sellerId }
      );
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Stripe connection error", err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen bg-gray-50">
      {/* 🔹 Onboarding Stepper */}
      <div className="relative flex items-center justify-between md:w-[60%] mb-12">
        {/* Background line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10 rounded" />

        {/* Dynamic filled line */}
        <div
          className={`absolute top-5 left-0 h-1 bg-blue-600 -z-10 rounded transition-all duration-500
    ${activeStep === 1 ? "w-0" : activeStep === 2 ? "w-1/2" : "w-full"}`}
        />

        {[1, 2, 3].map((step) => {
          const isCompleted = step < activeStep;
          const isActive = step === activeStep;

          return (
            <div
              key={step}
              className="flex flex-col items-center w-1/3 text-center"
            >
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-white transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-green-500"
                      : isActive
                      ? "bg-blue-600 ring-4 ring-blue-200"
                      : "bg-gray-300"
                  }`}
              >
                {isCompleted ? "✓" : step}
              </div>
              <span
                className={`mt-2 text-sm font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {step === 1
                  ? "Create Account"
                  : step === 2
                  ? "Setup Shop"
                  : "Connect Bank"}
              </span>
            </div>
          );
        })}
      </div>

      {/* 🔹 Step Content */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg animate-fadeIn">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h3 className="text-2xl font-semibold text-center mb-4">
                  Create Account
                </h3>

                {/* NAME FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Ahmed"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">
                      {String(errors.name.message)}
                    </p>
                  )}
                </div>

                {/* EMAIL FIELD */}
                <div>
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

                {/* PHONE FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+201015491071"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                    {...register("phone_number", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: "Invalid phone number",
                      },
                    })}
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">
                      {String(errors.phone_number.message)}
                    </p>
                  )}
                </div>

                {/* COUNTRY LIST */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 !rounded"
                    {...register("country", {
                      required: "Country is required!",
                    })}
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">
                      {String(errors.country.message)}
                    </p>
                  )}
                </div>

                {/* PASSWORD FIELD */}
                <div>
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
                      aria-label="Toggle password visibility"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {passwordVisible ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500 animate-shake">
                      {String(errors.password.message)}
                    </p>
                  )}
                </div>

                {/* SIGNUP BUTTON */}
                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full mt-4 rounded-lg bg-black text-white py-3 text-base font-medium hover:bg-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader size={24} color="text-white" />
                      Signing up...
                    </div>
                  ) : (
                    "Signup"
                  )}
                </button>

                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {getErrorMessage(signupMutation.error, "Signup failed.")}
                    </p>
                  )}

                <p className="pt-3 text-center">
                  Already have an account?{" "}
                  <Link href={"/login"} className="text-blue-500">
                    Login
                  </Link>
                </p>
              </form>
            ) : (
              // OTP
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
                      className="w-12 h-12 text-center border border-gray-300 outline-none !rounded focus:ring-2 focus:ring-blue-500 transition-all text-lg font-semibold"
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
                      <Loader size={20} color="text-white" />
                      Verifying...
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

                {verifyOtpMutation.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      {getErrorMessage(
                        verifyOtpMutation.error,
                        "OTP verification failed."
                      )}
                    </p>
                  )}
              </div>
            )}
          </>
        )}

        {/* Step 2: Shop */}
        {activeStep === 2 && (
          <CreateShop setActiveStep={setActiveStep} sellerId={sellerId} />
        )}

        {/* Step 3: Stripe */}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Withdraw Method</h3>
            <button
              onClick={connectStripe}
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
            >
              Connect Stripe <StripeLogo />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
