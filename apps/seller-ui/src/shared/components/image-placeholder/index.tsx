import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface ImagePlaceHolderProps {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  index?: any;
  images: any;
  imageUploadingLoader: boolean;
  setSelectedImage: (e: string) => void;
  setOpenImageModal: (openImageModal: boolean) => void;
}

export default function ImagePlaceHolder({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = null,
  index = null,
  images,
  imageUploadingLoader,
  setSelectedImage,
  setOpenImageModal,
}: ImagePlaceHolderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index);
    }
  };
  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-auto bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}
    >
      <label htmlFor={`image-upload-${index}`} className="sr-only">
        x
      </label>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <>
          <button
            disabled={imageUploadingLoader}
            className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg"
            type="button"
            onClick={() => onRemove?.(index)}
          >
            <X size={16} />
            {""}
          </button>
          <button
            disabled={imageUploadingLoader}
            className="absolute top-3 right-[70px] p-2 !rounded bg-blue-500 shadow-lg cursor-pointer"
            onClick={() => {
              setOpenImageModal(true);
              setSelectedImage(images[index].file_url);
            }}
          >
            <WandSparkles size={16} />
            {""}
          </button>
        </>
      ) : (
        <label
          className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer"
          htmlFor={`image-upload-${index}`}
        >
          <Pencil size={16} />
        </label>
      )}
      {imagePreview ? (
        <Image
          width={400}
          height={300}
          src={imagePreview}
          alt="uploaded"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <>
          <p
            className={`text-gray-400 ${
              small ? "text-xl" : "text-4xl"
            } font-semibold`}
          >
            {size}
          </p>
          <p
            className={`text-gray-500 ${
              small ? "text-sm" : "text-lg"
            } pt-2 text-center`}
          >
            Please choose an image <br />
            according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
}
