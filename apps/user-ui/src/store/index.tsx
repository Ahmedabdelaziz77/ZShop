import { create } from "zustand";
import { persist } from "zustand/middleware";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];

  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => Promise<void> | void;

  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => Promise<void> | void;

  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => Promise<void> | void;

  removeFromWishlist: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => Promise<void> | void;
};

const TRACK_URL =
  (process.env.NEXT_PUBLIC_TRACK_URL ?? "http://localhost:6010") + "/track";

const isObjectId = (s: any) =>
  typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);

function extractUserId(u: any): string | null {
  if (!u) return null;
  let snap: any;
  try {
    snap = JSON.parse(JSON.stringify(u));
  } catch {
    snap = u;
  }
  const candidates = [
    snap?.id,
    snap?._id,
    snap?.user?.id,
    snap?.user?._id,
    snap?.data?.id,
    snap?.data?._id,
    snap?.userId,
  ];
  const found = candidates.find((x) => typeof x === "string");
  return isObjectId(found) ? (found as string) : null;
}

async function postTrack(payload: any) {
  const resInfo = { ok: false, status: 0, text: "" };
  try {
    const res = await fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    resInfo.ok = res.ok;
    resInfo.status = res.status;
    resInfo.text = await res.text().catch(() => "");
  } catch (e: any) {
    resInfo.ok = false;
    resInfo.status = 0;
    resInfo.text = String(e?.message ?? e);
  }
  return resInfo;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      /** ------ CART ------ */
      addToCart: async (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart.find((i) => i.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: (i.quantity ?? 1) + 1 }
                  : i
              ),
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity: product?.quantity }],
          };
        });

        const userId = extractUserId(user);
        if (!userId) {
          console.warn("CLIENT SKIP track (no valid userId) add_to_cart", {
            productId: product.id,
            userSnapshot: (() => {
              try {
                return JSON.parse(JSON.stringify(user));
              } catch {
                return user;
              }
            })(),
          });
          return;
        }

        const payload = {
          userId,
          productId: product.id,
          shopId: product.shopId,
          action: "add_to_cart",
          country: location?.country ?? "Unknown",
          city: location?.city ?? "Unknown",
          device: deviceInfo ?? "Unknown Device",
        };

        console.log("CLIENT add_to_cart -> POST /track", payload);
        const res = await postTrack(payload);
        console.log("CLIENT /track response", res);
      },

      removeFromCart: async (id, user, location, deviceInfo) => {
        const removedProduct = get().cart.find((i) => i.id === id);
        // optimistic UI
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) }));

        if (!removedProduct) {
          console.warn("CLIENT SKIP track remove_from_cart (no product)", {
            productId: id,
          });
          return;
        }

        const userId = extractUserId(user);
        if (!userId) {
          console.warn("CLIENT SKIP track (no valid userId) remove_from_cart", {
            productId: id,
            userSnapshot: (() => {
              try {
                return JSON.parse(JSON.stringify(user));
              } catch {
                return user;
              }
            })(),
          });
          return;
        }

        const payload = {
          userId,
          productId: removedProduct.id,
          shopId: removedProduct.shopId,
          action: "remove_from_cart",
          country: location?.country ?? "Unknown",
          city: location?.city ?? "Unknown",
          device: deviceInfo ?? "Unknown Device",
        };

        console.log("CLIENT remove_from_cart -> POST /track", payload);
        const res = await postTrack(payload);
        console.log("CLIENT /track response", res);
      },

      /** ------ WISHLIST ------ */
      addToWishlist: async (product, user, location, deviceInfo) => {
        set((state) => {
          const exists = state.wishlist.some((i) => i.id === product.id);
          if (exists) return state;
          return { wishlist: [...state.wishlist, product] };
        });

        const userId = extractUserId(user);
        if (!userId) {
          console.warn("CLIENT SKIP track (no valid userId) add_to_wishlist", {
            productId: product.id,
            userSnapshot: (() => {
              try {
                return JSON.parse(JSON.stringify(user));
              } catch {
                return user;
              }
            })(),
          });
          return;
        }

        const payload = {
          userId,
          productId: product.id,
          shopId: product.shopId,
          action: "add_to_wishlist",
          country: location?.country ?? "Unknown",
          city: location?.city ?? "Unknown",
          device: deviceInfo ?? "Unknown Device",
        };

        console.log("CLIENT add_to_wishlist -> POST /track", payload);
        const res = await postTrack(payload);
        console.log("CLIENT /track response", res);
      },

      removeFromWishlist: async (id, user, location, deviceInfo) => {
        const removedProduct = get().wishlist.find((i) => i.id === id);
        // optimistic UI
        set((state) => ({
          wishlist: state.wishlist.filter((i) => i.id !== id),
        }));

        if (!removedProduct) {
          console.warn("CLIENT SKIP track remove_from_wishlist (no product)", {
            productId: id,
          });
          return;
        }

        const userId = extractUserId(user);
        if (!userId) {
          console.warn(
            "CLIENT SKIP track (no valid userId) remove_from_wishlist",
            {
              productId: id,
              userSnapshot: (() => {
                try {
                  return JSON.parse(JSON.stringify(user));
                } catch {
                  return user;
                }
              })(),
            }
          );
          return;
        }

        const payload = {
          userId,
          productId: removedProduct.id,
          shopId: removedProduct.shopId,
          action: "remove_from_wishlist",
          country: location?.country ?? "Unknown",
          city: location?.city ?? "Unknown",
          device: deviceInfo ?? "Unknown Device",
        };

        console.log("CLIENT remove_from_wishlist -> POST /track", payload);
        const res = await postTrack(payload);
        console.log("CLIENT /track response", res);
      },
    }),
    { name: "store-storage" }
  )
);
