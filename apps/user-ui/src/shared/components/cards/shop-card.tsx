import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: [];
    ratings?: number;
    category?: string;
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="group relative w-full rounded-xl cursor-pointer bg-white border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* COVER IMAGE */}
      <div className="h-[130px] w-full relative">
        <Image
          src={
            shop?.coverBanner ||
            "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=500&auto=format&fit=crop&q=80"
          }
          alt="Cover"
          fill
          className="object-cover w-full h-full brightness-90 group-hover:brightness-100 transition-all duration-300"
        />

        {/* SMALL AVATAR centered at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white group-hover:scale-105 transition-transform duration-300">
            <Image
              src={
                shop?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* SHOP NAME / INFO */}
      <div className="mt-10 text-center px-4 pb-4">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          {shop.name}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {shop?.followers?.length ?? 0} Followers
        </p>

        {/* ADDRESS AND RATINGS */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop?.address && (
            <span className="flex items-center gap-1 max-w-[130px]">
              <MapPin className="w-4 h-4 shrink-0 text-blue-500" />
              <span className="truncate">{shop?.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {shop?.ratings ?? "N/A"}
          </span>
        </div>

        {/* CATEGORY BADGE */}
        {shop?.category && (
          <div className="mt-3">
            <span className="inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium capitalize">
              {shop?.category}
            </span>
          </div>
        )}

        {/* BUTTON LINK */}
        <div className="mt-4">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-300 hover:underline"
          >
            Visit Shop
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
