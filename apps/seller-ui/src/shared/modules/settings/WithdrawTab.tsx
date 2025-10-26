"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import StripeSLogo from "apps/seller-ui/src/assets/svgs/stripe-logo";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

type StripeAccount = {
  email?: string;
  businessName?: string;
  country?: string;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
  lastPayout?: string | null;
  dashboardUrl?: string | null;
  connected?: boolean;
};

export default function WithdrawMethodTab() {
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["stripe-account"],
    queryFn: async (): Promise<StripeAccount | null> => {
      try {
        const res = await axiosInstance.get("/seller/api/get-stripe-account");
        const p = res.data;
        if (!p?.success && p?.connected === false) return null;
        return {
          email: p?.email,
          businessName: p?.businessName,
          country: p?.country,
          payoutsEnabled: !!p?.payoutsEnabled,
          chargesEnabled: !!p?.chargesEnabled,
          lastPayout: p?.lastPayout ?? null,
          dashboardUrl: p?.dashboardUrl ?? null,
          connected: !!p?.connected || !!p?.chargesEnabled,
        };
      } catch (e: any) {
        if (e?.response?.status === 404) return null;
        throw e;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: connectStripe, isPending: linking } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/api/create-stripe-link");
      if (!res.data?.url) throw new Error("No Stripe link URL returned");
      return res.data.url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/70 p-6">
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading withdraw method…</span>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-lg border border-red-900/40 bg-red-900/20 p-6 text-red-200">
        Failed to load Stripe status.
        <button
          onClick={() => refetch()}
          className="ml-3 rounded-md border border-red-700/50 px-3 py-1 text-sm hover:bg-red-900/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.connected) {
    return (
      <div className="text-center rounded-lg border border-gray-800 bg-gray-900/70 p-8 text-gray-200">
        <h3 className="mb-4 text-2xl font-semibold">Withdraw Method</h3>
        <button
          onClick={() => connectStripe()}
          disabled={linking}
          className="m-auto flex w-full max-w-md items-center justify-center gap-3 rounded-lg bg-[#334155] py-2 text-lg text-white transition-colors hover:bg-[#1e293b] disabled:opacity-70"
        >
          {linking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Redirecting…
            </>
          ) : (
            <>
              Connect Stripe <StripeSLogo />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="text-gray-200">
      <h3 className="mb-4 text-2xl font-semibold">Withdraw Method</h3>

      <div className="rounded-lg border border-gray-800 bg-gray-900/70 p-6 text-gray-200">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-medium text-gray-100">
              Connected to Stripe
            </p>
            <p className="text-sm text-gray-400">{data.email ?? "—"}</p>
          </div>
        </div>

        <div className="grid gap-y-4 sm:grid-cols-2">
          <div className="rounded-md border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Business Name:</p>
            <p className="text-base text-gray-100">
              {data.businessName ?? "—"}
            </p>
          </div>

          <div className="rounded-md border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Country:</p>
            <p className="text-base text-gray-100">{data.country ?? "—"}</p>
          </div>

          <div className="rounded-md border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Payouts Enabled:</p>
            <p
              className={`text-base ${
                data.payoutsEnabled ? "text-emerald-400" : "text-gray-100"
              }`}
            >
              {data.payoutsEnabled ? "Yes" : "No"}
            </p>
          </div>

          <div className="rounded-md border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-sm text-gray-400">Charges Enabled:</p>
            <p
              className={`text-base ${
                data.chargesEnabled ? "text-emerald-400" : "text-gray-100"
              }`}
            >
              {data.chargesEnabled ? "Yes" : "No"}
            </p>
          </div>

          <div className="rounded-md border border-gray-800 bg-gray-900/50 p-4 sm:col-span-2">
            <p className="text-sm text-gray-400">Last Payout:</p>
            <p className="text-base text-gray-100">
              {data.lastPayout ?? "No payouts yet"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("https://dashboard.stripe.com/")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
          >
            Open Stripe Dashboard <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
