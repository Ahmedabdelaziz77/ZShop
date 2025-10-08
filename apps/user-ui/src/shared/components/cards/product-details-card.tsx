import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Rating from "../ratings";
import { Heart, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartIcon } from "apps/user-ui/src/assets/svg/cart-icon";

interface ProductDetailsCardProps {
  product: any;
  setOpen: (open: boolean) => void;
}

export default function ProductDetailsCard({
  product,
  setOpen,
}: ProductDetailsCardProps) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(product?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(
    product?.sizes?.[0] || ""
  );
  const [quantity, setQuantity] = useState(1);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 animate-fadeIn"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[90%] md:w-[70%] min-h-[70vh] h-max bg-white shadow-xl rounded-2xl flex items-center p-6 relative overflow-y-scroll animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-[1px] right-[2px] bg-gray-100 hover:bg-gray-200 p-2 rounded-full shadow-sm transition-all hover:scale-110"
        >
          <X size={20} />
          {""}
        </button>

        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* LEFT SIDE */}
          <div className="w-full md:w-1/2 flex flex-col items-center animate-fadeUp">
            <Image
              src={product?.images?.[activeImage]?.url}
              alt="Product"
              width={400}
              height={400}
              className="rounded-lg object-contain h-[400px] w-[400px] transition-transform duration-300 hover:scale-105 animate-float"
            />

            {/* ✅ Thumbnails in row with wrap, no scroll */}
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-[400px]">
              {product?.images?.map((image: any, i: number) => (
                <div
                  key={i}
                  className={`cursor-pointer border rounded-md transition-all duration-200 ${
                    activeImage === i
                      ? "border-blue-500 shadow-md scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${i}`}
                    width={75}
                    height={75}
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ✅ RIGHT SIDE WITH COLORS & SIZES */}
          <div className="w-full md:w-1/2 flex flex-col gap-4 animate-fadeUp">
            {/* Shop Info */}
            <div className="border-b pb-3 border-gray-200 flex items-center justify-between relative">
              <div className="flex items-start gap-3">
                <Image
                  src={
                    product?.shop?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  }
                  alt="Shop Logo"
                  width={60}
                  height={60}
                  className="rounded-full w-[60px] h-[60px] object-cover animate-float"
                />
                <div>
                  <Link
                    href={`/shop/${product?.shop?.id}`}
                    className="text-lg font-medium"
                  >
                    {product?.shop?.name}
                  </Link>
                  <Rating rating={product?.shop?.ratings} size={14} />
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin size={18} />{" "}
                    {product?.shop?.address || "Location Not Available"}
                  </p>
                </div>
              </div>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md text-white bg-blue-700 hover:bg-blue-600 font-medium transition"
                onClick={() =>
                  router.push(`/inbox?shopId=${product?.shop?.id}`)
                }
              >
                💬 Chat
              </button>
            </div>

            <h3 className="text-xl font-semibold">{product?.title}</h3>
            <p className="text-gray-700">{product?.short_description}</p>

            {/* COLORS & SIZES */}
            <div className="flex flex-col md:flex-row items-start gap-5 mt-2">
              {product?.colors?.length > 0 && (
                <div>
                  <strong>Color:</strong>
                  <div className="flex gap-2 mt-1">
                    {product.colors.map((color: string, i: number) => (
                      <button
                        key={i}
                        className={`w-8 h-8 rounded-full transition-all ${
                          isSelected === color
                            ? "scale-110 border-gray-600 shadow-md"
                            : "border border-gray-300 shadow-sm"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setIsSelected(color)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product?.sizes?.length > 0 && (
                <div>
                  <strong>Size:</strong>
                  <div className="flex gap-2 mt-1">
                    {product.sizes.map((size: string, i: number) => (
                      <button
                        key={i}
                        className={`px-4 py-2 rounded-md transition ${
                          isSizeSelected === size
                            ? "bg-gray-800 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                        onClick={() => setIsSizeSelected(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">${product?.sale_price}</span>
              {product?.regular_price && (
                <span className="text-lg text-red-600 line-through">
                  ${product?.regular_price}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <button
                className={`px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded-md ${
                  quantity <= 1 ? "animate-shake" : ""
                }`}
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="px-4 py-1 bg-gray-100 rounded-md">
                {quantity}
              </span>
              <button
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded-md"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-5 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-lg font-medium transition relative overflow-hidden">
                <span className="absolute inset-0 bg-white/20 animate-shine"></span>
                <CartIcon size={18} /> Add to Cart
              </button>

              <Heart size={30} fill="red" />
            </div>

            <span
              className={product?.stock > 0 ? "text-green-600" : "text-red-600"}
            >
              {product?.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>

            <span className="text-gray-600 text-sm">
              Estimated Delivery:{" "}
              <strong>{estimatedDelivery.toDateString()}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
