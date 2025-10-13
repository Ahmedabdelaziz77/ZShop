"use client";

import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import Image from "next/image";
import Link from "next/link";

export default function Wishlist() {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);

  const decreaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      wishlist: state.wishlist.map((item) =>
        item.id === id && (item.quantity ?? 1) > 1
          ? { ...item, quantity: (item.quantity ?? 1) - 1 }
          : item
      ),
    }));
  };
  const increaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      wishlist: state.wishlist.map((item) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromWishlist(id, user, location, deviceInfo);
  };

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div className="pb-10">
          <h1 className="md:pt-12 font-semibold text-4xl leading-tight mb-4 font-jost">
            Wishlist
          </h1>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Link href="/" className="hover:text-black transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-500">Wishlist</span>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-20">
            Your wishlist is empty — start adding products!
          </div>
        ) : (
          <div className="overflow-x-auto shadow-sm rounded-lg">
            <table className="w-full border-collapse text-gray-700">
              <thead className="bg-gray-100 text-left text-sm font-medium uppercase tracking-wide">
                <tr>
                  <th className="py-3 pl-4">Product</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Quantity</th>
                  <th className="py-3">Action</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {wishlist?.map((item: any, index: number) => (
                  <tr
                    key={item.id}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="flex items-center gap-4 p-4">
                      <Image
                        src={
                          item?.images?.[0]?.url ||
                          "https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        }
                        alt={item?.title}
                        width={80}
                        height={80}
                        className="rounded-md border"
                      />
                      <span className="font-medium">{item.title}</span>
                    </td>
                    <td className="px-6 font-semibold">
                      ${item.sale_price.toFixed(2)}
                    </td>
                    <td>
                      <div className="flex justify-center items-center border border-gray-300 rounded-full w-[90px] p-1">
                        <button
                          onClick={() => decreaseQuantity(item?.id)}
                          className="text-black text-xl px-2 hover:text-red-500 transition"
                        >
                          -
                        </button>
                        <span className="px-3 text-sm">{item?.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item?.id)}
                          className="text-black text-xl px-2 hover:text-green-600 transition"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          addToCart(item, user, location, deviceInfo)
                        }
                        className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition"
                      >
                        Add To Cart
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-500 transition text-sm"
                      >
                        ✕ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
