import SellerProfile from "apps/user-ui/src/shared/modules/seller/seller-profile";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Metadata } from "next";
async function fetchSellerDetails(id: string) {
  const res = await axiosInstance.get(`/seller/api/get-seller/${id}`);
  return res.data;
}

export async function generateMetaData({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await fetchSellerDetails(params.id);

  return {
    title: `${data?.shop?.name} | Zshop Marketplace`,
    description:
      data?.shop?.bio ||
      "Explore products and services from trusted sellers on Zshop.",
    openGraph: {
      title: `${data?.shop?.name} | Zshop Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Zshop.",
      type: "website",
      images: [
        {
          url:
            data?.shop?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          width: 800,
          height: 600,
          alt: data?.shop?.name || "Shop Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data?.shop?.name} | Zshop Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Zshop.",
      images: [
        data?.shop?.avatar ||
          "https://cdn-icons-png.flaticon.com/512/847/847969.png",
      ],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(id);
  const data = await fetchSellerDetails(id);
  return (
    <div>
      <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
  );
}
