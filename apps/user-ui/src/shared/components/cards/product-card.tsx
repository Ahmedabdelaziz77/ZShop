import Link from "next/link";
import Rating from "../ratings";
import { useEffect, useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import ProductDetailsCard from "./product-details-card";

export default function ProductCard({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;
        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60000);
      return clearInterval(interval);
    }
  }, [isEvent, product?.ending_date]);
  return (
    <div className="w-full min-h-[350px] bg-white rounded-xl relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group py-2">
      {/* OFFER TAG */}
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-md animate-pulse">
          OFFER
        </div>
      )}

      {/* LIMITED STOCK TAG */}
      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          Limited Stock
        </div>
      )}

      {/* IMAGE */}
      <Link href={`/product/${product?.slug}`}>
        <img
          src={
            product.images[0]?.url ||
            "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=500&auto=format&fit=crop&q=80"
          }
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[200px] object-cover rounded-t-md transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* SHOP NAME */}
      <Link
        href={`/shop/${product?.shop?.id}`}
        className="block text-blue-500 text-sm font-medium my-2 px-3 hover:underline"
      >
        {product?.shop?.name}
      </Link>

      {/* TITLE */}
      <Link href={`/product/${product?.slug}`}>
        <h3 className="text-base text-gray-800 font-semibold px-3 line-clamp-1 group-hover:text-black transition">
          {product?.title}
        </h3>
      </Link>

      {/* RATING */}
      <div className="mt-2 px-3">
        <Rating rating={product?.ratings} size={15} />
      </div>

      {/* PRICES + SALES */}
      <div className="mt-3 flex justify-between items-center px-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-gray-900">
              ${product?.sale_price}
            </span>

            {product?.regular_price &&
              product?.regular_price > product?.sale_price && (
                <>
                  <span className="text-sm line-through text-gray-400">
                    ${product?.regular_price}
                  </span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -
                    {Math.round(
                      (100 * (product?.regular_price - product?.sale_price)) /
                        product?.regular_price
                    )}
                    %
                  </span>
                </>
              )}
          </div>
          <span className="text-[11px] text-gray-500 mt-1">
            {product?.totalSales} sold ✅
          </span>
        </div>
      </div>

      {/* EVENT TIMER */}
      {isEvent && timeLeft && (
        <div className="mt-2 px-3">
          <span className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
            {timeLeft}
          </span>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="absolute flex flex-col gap-3 right-3 top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0">
        <div className="bg-white rounded-full p-[6px] shadow-lg hover:shadow-xl transition-all hover:scale-110">
          <Heart
            className="cursor-pointer"
            size={22}
            fill={"red"}
            stroke={"red"}
          />
        </div>
        <div className="bg-white rounded-full p-[6px] shadow-lg hover:shadow-xl transition-all hover:scale-110">
          <Eye
            className="cursor-pointer text-[#4b5563]"
            size={22}
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="bg-white rounded-full p-[6px] shadow-lg hover:shadow-xl transition-all hover:scale-110">
          <ShoppingBag className="cursor-pointer text-[#4b5563]" size={22} />
        </div>
      </div>

      {open && <ProductDetailsCard product={product} setOpen={setOpen} />}
    </div>
  );
}
