"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import GoogleButton from "apps/user-ui/src/shared/components/google-button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function Signup() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, _setServerError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [_userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
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
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registeration`,
        data
      );
      return res.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

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
    if (e.key === "Backspace" && !otp[i] && i > 0)
      inputRefs.current[i - 1]?.focus();

    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();

    if (e.key === "ArrowRight" && i < otp.length - 1)
      inputRefs.current[i + 1]?.focus();
  };

  const resendOtp = () => {};

  return (
    <div className="w-full min-h-[85vh] bg-gray-100 py-12 flex flex-col items-center animate-fadeIn">
      {/* HEADER */}
      <h1 className="text-4xl font-bold text-gray-900 font-Poppins animate-slideDown">
        Signup
      </h1>
      <p className="text-base text-gray-500 mt-2 animate-fadeIn delay-100">
        Home <span className="mx-1">•</span> Signup
      </p>

      {/* FORM WRAPPER */}
      <div className="w-full flex justify-center mt-8">
        <div className="md:w-[480px] w-full bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl animate-fadeUp">
          <h3 className="text-2xl font-semibold text-center text-gray-900">
            Create your account
          </h3>
          <p className="text-center text-gray-500 mt-2 mb-6 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-medium hover:underline transition-colors"
            >
              Login
            </Link>
          </p>

          {/* GOOGLE BUTTON */}
          <GoogleButton />

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3 text-gray-400 text-sm">Or sign up with</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* NAME FIELD */}
              <div className="animate-fadeIn delay-150">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Ahmed"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  {...register("name", {
                    required: "Name is required",
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 animate-shake">
                    {String(errors.name.message)}
                  </p>
                )}
              </div>

              {/* EMAIL FIELD */}
              <div className="animate-fadeIn delay-200">
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
              <div className="animate-fadeIn delay-300">
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

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full mt-4 rounded-lg bg-black text-white py-3 text-base font-medium hover:bg-gray-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Signup
              </button>

              {serverError && (
                <p className="text-red-500 text-sm text-center mt-2 animate-shake">
                  {serverError}
                </p>
              )}
            </form>
          ) : (
            // OTP
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp.map((digit, i) => (
                  <input
                    type="text"
                    key={i}
                    ref={(el) => {
                      if (el) inputRefs.current[i] = el;
                    }}
                    maxLength={1}
                    aria-label={`OTP digit ${i + 1}`}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
              >
                Verify OTP
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="text-blue-500 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
