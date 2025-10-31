"use client";

import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function Page() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `order/api/get-order-details/${orderId}`
      );
      setOrder(res.data.order);
    } catch (err) {
      console.error("failed to fetch order details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );

  if (!order)
    return (
      <p className="text-center text-sm text-red-500 mt-10 font-medium">
        Order not found.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-100">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition"
        >
          <ArrowLeft size={18} />
          Go Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-white">
        Order <span className="text-blue-400">#{order.id.slice(-6)}</span>
      </h1>

      {/* Delivery Progress Tracker */}
      <div className="mb-10">
        {/* Labels */}
        <div className="flex justify-between text-xs font-medium mb-3 text-gray-400">
          {statuses.map((status, i) => {
            const activeIndex = statuses.indexOf(order.deliveryStatus);
            const isReached = i <= activeIndex;
            return (
              <span
                key={status}
                className={`${
                  isReached ? "text-blue-400 font-semibold" : "text-gray-500"
                }`}
              >
                {status}
              </span>
            );
          })}
        </div>

        {/* Progress Bar + Dots */}
        <div className="relative flex justify-between items-center mt-4">
          {/* Full gray line */}
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-700 rounded-full transform -translate-y-1/2"></div>

          {/* Blue progress line */}
          <div
            className="absolute top-1/2 left-0 h-[3px] bg-blue-500 rounded-full transform -translate-y-1/2 transition-all duration-500 ease-in-out"
            style={{
              width: `${
                (statuses.indexOf(order.deliveryStatus) /
                  (statuses.length - 1)) *
                100
              }%`,
            }}
          />

          {/* Steps */}
          {statuses.map((status, i) => {
            const reached = i <= statuses.indexOf(order.deliveryStatus);
            const current = i === statuses.indexOf(order.deliveryStatus);
            return (
              <div
                key={status}
                className={`relative z-10 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-500 ${
                  current
                    ? "bg-blue-600 shadow-lg shadow-blue-500/40 scale-110"
                    : reached
                    ? "bg-blue-500"
                    : "bg-gray-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    reached ? "bg-white" : "bg-gray-400"
                  }`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Info */}
      <div className="border border-gray-800 rounded-xl p-6 mb-8 bg-gray-900/70">
        <h2 className="text-lg font-semibold mb-4 text-white">Order Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-300">
          <p>
            <span className="font-medium text-gray-400">Payment Status:</span>{" "}
            <span
              className={`${
                order.status === "Paid" ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-400">Total Paid:</span>{" "}
            <span className="text-green-400">${order.total.toFixed(2)}</span>
          </p>
          {order.discountAmount > 0 && (
            <p>
              <span className="font-medium text-gray-400">Discount:</span>{" "}
              <span className="text-teal-400">
                -${order.discountAmount.toFixed(2)}
              </span>
            </p>
          )}
          {order.couponCode && (
            <p>
              <span className="font-medium text-gray-400">Coupon:</span>{" "}
              <span className="text-blue-400">
                {order.couponCode.public_name}
              </span>
            </p>
          )}
          <p>
            <span className="font-medium text-gray-400">Date:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="border border-gray-800 rounded-xl p-6 mb-8 bg-gray-900/70">
          <h2 className="text-lg font-semibold mb-3 text-white">
            Shipping Address
          </h2>
          <div className="space-y-1 text-sm text-gray-300">
            <p>{order.shippingAddress.name}</p>
            <p>
              {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/70">
        <h2 className="text-lg font-semibold mb-4 text-white">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="flex items-center gap-5 border border-gray-800 bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200"
            >
              <img
                src={
                  item.product?.images[0]?.url ||
                  "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=500&auto=format&fit=crop&q=80"
                }
                alt={item.product?.title || "Product Image"}
                className="w-16 h-16 object-cover rounded-md border border-gray-700"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-100">
                  {item?.product?.title || "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-400">
                  Quantity: {item?.quantity}
                </p>
                {item?.selectedOptions &&
                  Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      {Object.entries(item.selectedOptions).map(
                        ([key, value]: [string, any]) =>
                          value && (
                            <span key={key} className="mr-3">
                              <span className="font-medium capitalize text-gray-300">
                                {key}:{" "}
                              </span>
                              {value}
                            </span>
                          )
                      )}
                    </div>
                  )}
              </div>
              <p className="text-sm font-semibold text-gray-200">
                ${item?.price?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
