"use client";

import { useState, useEffect } from "react";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { toast } from "react-hot-toast";
import { UploadCloud } from "lucide-react";

export default function CustomizationPage() {
  const [tab, setTab] = useState<"categories" | "logo" | "banner">(
    "categories"
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, string[]>>(
    {}
  );
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axiosInstance.get("/admin/api/get-site-config").then((res) => {
      const data = res.data.data;
      setCategories(data.categories || []);
      setSubCategories(data.subCategories || {});
      setLogo(data.logo || "");
      setBanner(data.banner || "");
    });
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const updated = [...categories, newCategory];
    await saveChanges(updated, subCategories);
    setNewCategory("");
  };

  const handleAddSubCategory = async () => {
    if (!selectedCategory || !newSubCategory.trim()) return;
    const updatedSubs = {
      ...subCategories,
      [selectedCategory]: [
        ...(subCategories[selectedCategory] || []),
        newSubCategory,
      ],
    };
    await saveChanges(categories, updatedSubs);
    setNewSubCategory("");
  };

  const saveChanges = async (
    cats: string[],
    subs: Record<string, string[]>
  ) => {
    try {
      await axiosInstance.put("/admin/api/update-categories", {
        categories: cats,
        subCategories: subs,
      });
      setCategories(cats);
      setSubCategories(subs);
      toast.success("Categories updated!");
    } catch {
      toast.error("Failed to update categories!");
    }
  };

  const convertFileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async (file: File | null, type: "logo" | "banner") => {
    if (!file) return;
    setUploading(true);
    try {
      const fileName = await convertFileToBase64(file);
      const res = await axiosInstance.post(`/admin/api/upload-${type}`, {
        fileName,
      });
      const uploadedUrl = res.data.file_url;

      if (type === "logo") setLogo(uploadedUrl);
      else setBanner(uploadedUrl);

      toast.success(
        `${type === "logo" ? "Logo" : "Banner"} uploaded successfully!`
      );
    } catch {
      toast.error(`Failed to upload ${type}!`);
    } finally {
      setUploading(false);
    }
  };

  const renderUploadBox = (type: "logo" | "banner") => {
    const currentImage = type === "logo" ? logo : banner;
    const label = type === "logo" ? "Upload Site Logo" : "Upload Banner Image";
    const description =
      type === "logo"
        ? "Recommended size: 150x150px, PNG or JPG"
        : "Recommended size: 1920x500px, JPG or WebP";

    return (
      <div className="flex flex-col items-start gap-4 w-full max-w-3xl">
        {currentImage && (
          <img
            src={currentImage}
            alt={type}
            className={`rounded-lg border border-gray-700 ${
              type === "logo"
                ? "w-32 h-32 object-contain"
                : "w-full h-56 object-contain"
            }`}
          />
        )}

        <label
          htmlFor={`${type}-upload`}
          className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-gray-800/50 transition"
        >
          <UploadCloud size={40} className="text-blue-400" />
          <span className="text-gray-300 font-medium">{label}</span>
          <span className="text-gray-500 text-sm">{description}</span>
          <div className="mt-3">
            <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold text-white transition">
              Choose File
            </span>
          </div>
          <input
            id={`${type}-upload`}
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files?.[0] || null, type)}
            className="hidden"
          />
        </label>

        {uploading && (
          <p className="text-sm text-gray-400 animate-pulse">Uploading...</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <h2 className="text-2xl font-semibold mb-6">Customization</h2>

      <div className="border-b border-gray-800 mb-4 flex gap-6">
        <button
          onClick={() => setTab("categories")}
          className={`pb-2 ${
            tab === "categories" ? "border-b-2 border-blue-500" : ""
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setTab("logo")}
          className={`pb-2 ${
            tab === "logo" ? "border-b-2 border-blue-500" : ""
          }`}
        >
          Logo
        </button>
        <button
          onClick={() => setTab("banner")}
          className={`pb-2 ${
            tab === "banner" ? "border-b-2 border-blue-500" : ""
          }`}
        >
          Banner
        </button>
      </div>

      {tab === "categories" && (
        <div>
          <div className="space-y-4 mb-6">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="font-semibold text-lg">{cat}</h3>
                <ul className="ml-6 list-disc text-gray-400">
                  {(subCategories[cat] || []).map((sub) => (
                    <li key={sub}>{sub}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
            />
            <button
              onClick={handleAddCategory}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
            >
              Add Category
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              placeholder="New subcategory"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
            />
            <button
              onClick={handleAddSubCategory}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
            >
              Add Subcategory
            </button>
          </div>
        </div>
      )}

      {tab === "logo" && renderUploadBox("logo")}
      {tab === "banner" && renderUploadBox("banner")}
    </div>
  );
}
