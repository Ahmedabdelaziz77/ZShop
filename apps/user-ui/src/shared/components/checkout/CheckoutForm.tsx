"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

type Coupon = null | {
  discountAmount?: number | string;
  discountPercent?: number | string;
  discountProductId?: string;
  code?: string;
};

export default function CheckoutForm({
  clientSecret,
  cartItems,
  coupon,
  sessionId,
}: {
  clientSecret: string;
  cartItems: any[];
  coupon: Coupon;
  sessionId: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "failed" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const num = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  const subtotal = useMemo(
    () =>
      (cartItems || []).reduce(
        (sum: number, item: any) =>
          sum + num(item?.quantity) * num(item?.sale_price),
        0
      ),
    [cartItems]
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;
    const amount = num(coupon.discountAmount);
    if (amount > 0) return amount;

    const percent = num(coupon.discountPercent);
    if (percent > 0 && coupon?.discountProductId) {
      const target = (cartItems || []).find(
        (i: any) => i?.id === coupon.discountProductId
      );
      if (!target) return 0;
      const base = num(target?.sale_price) * num(target?.quantity);
      return (base * percent) / 100;
    }
    return 0;
  }, [coupon, cartItems]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount),
    [subtotal, discount]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }
    const res = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
      },
    });
    if (res.error) {
      setStatus("failed");
      setErrorMsg(res.error.message || "Something went wrong in payment!");
    } else {
      setStatus("success");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6"
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Secure Payment Checkout
        </h2>

        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-2">
          {(cartItems || []).map((item: any, i: number) => {
            const line = num(item?.quantity) * num(item?.sale_price);
            return (
              <div key={i} className="flex justify-between text-sm pb-1">
                <span>
                  {num(item?.quantity)} * {item?.title || "Item"}
                </span>
                <span>{fmt.format(line)}</span>
              </div>
            );
          })}

          <div className="flex justify-between font-semibold pt-2 border-t border-t-gray-300 mt-2">
            <span>Discount</span>
            <span className="text-gray-600">{fmt.format(discount)}</span>
          </div>

          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>{fmt.format(total)}</span>
          </div>
        </div>

        <PaymentElement />
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-500 flex items-center justify-center"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
          {loading ? "Processing" : "Pay Now"}
        </button>

        {errorMsg && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="w-5 h-5" />
            {errorMsg}
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
            <CheckCircle className="w-5 h-5" />
            Payment Successful!
          </div>
        )}
        {status === "failed" && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="w-5 h-5" />
            Payment Failed. Please try again!
          </div>
        )}
      </form>
    </div>
  );
}
