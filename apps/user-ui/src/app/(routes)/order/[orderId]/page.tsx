"use client";

import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
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
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/order/api/get-order-details/${orderId}`
        );
        setOrder(res.data.order);
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
      </div>
    );

  if (!order)
    return (
      <p className="text-center text-sm text-red-500 mt-10 font-medium">
        Order not found.
      </p>
    );

  const activeIndex = statuses.indexOf(order.deliveryStatus);
  const progressWidth = (activeIndex / (statuses.length - 1)) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-gray-800">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Order <span className="text-blue-600">#{order.id.slice(-6)}</span>
      </h1>

      {/* Delivery Progress Tracker */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-medium mb-3 text-gray-500">
          {statuses.map((status, i) => {
            const isReached = i <= activeIndex;
            return (
              <span
                key={status}
                className={`${
                  isReached ? "text-blue-600 font-semibold" : "text-gray-400"
                }`}
              >
                {status}
              </span>
            );
          })}
        </div>

        <div className="relative flex justify-between items-center mt-4">
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-200 rounded-full transform -translate-y-1/2"></div>

          <div
            className="absolute top-1/2 left-0 h-[3px] bg-blue-500 rounded-full transform -translate-y-1/2 transition-all duration-500 ease-in-out"
            style={{
              width: `${progressWidth}%`,
            }}
          />

          {statuses.map((status, i) => {
            const reached = i <= activeIndex;
            const current = i === activeIndex;
            return (
              <div
                key={status}
                className={`relative z-10 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-500 ${
                  current
                    ? "bg-blue-600 shadow-lg shadow-blue-300/50 scale-110"
                    : reached
                    ? "bg-blue-500"
                    : "bg-gray-300"
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

      {/* Order Summary */}
      <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Order Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium text-gray-500">Payment Status:</span>{" "}
            <span
              className={`${
                order.status === "Paid" ? "text-green-600" : "text-yellow-600"
              } font-medium`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-500">Total Paid:</span>{" "}
            <span className="text-blue-600 font-semibold">
              ${order.total.toFixed(2)}
            </span>
          </p>

          {/* ✅ Discount Section */}
          {order.discountAmount > 0 && (
            <p>
              <span className="font-semibold">Discount Applied:</span>{" "}
              <span className="text-green-700">
                -${order.discountAmount.toFixed(2)}{" "}
                {order.couponCode?.discountType === "percentage"
                  ? `(${order.couponCode.discountValue}%)`
                  : `$${order.couponCode?.discountValue} off`}
              </span>
            </p>
          )}

          {/* ✅ Coupon Section */}
          {order.couponCode && (
            <p>
              <span className="font-semibold">Coupon:</span>{" "}
              <span className="text-blue-700">
                {order.couponCode.public_name}
              </span>
            </p>
          )}

          <p>
            <span className="font-medium text-gray-500">Date:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Shipping Address
          </h2>
          <div className="space-y-1 text-sm text-gray-700">
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
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="flex items-center gap-5 border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200"
            >
              <img
                src={
                  item.product?.images[0]?.url ||
                  "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=500&auto=format&fit=crop&q=80"
                }
                alt={item.product?.title || "Product Image"}
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {item?.product?.title || "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-500">
                  Quantity: {item?.quantity}
                </p>
                {item?.selectedOptions &&
                  Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.selectedOptions).map(
                        ([key, value]: [string, any]) =>
                          value && (
                            <span key={key} className="mr-3">
                              <span className="font-medium capitalize text-gray-600">
                                {key}:{" "}
                              </span>
                              {value}
                            </span>
                          )
                      )}
                    </div>
                  )}
              </div>
              <p className="text-sm font-semibold text-gray-800">
                ${item?.price?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
