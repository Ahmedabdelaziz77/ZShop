import { X } from "lucide-react";
import Loader from "../Loader";

export default function DeleteDiscountCodeModal({
  discount,
  onClose,
  onConfirm,
  isLoading,
}: {
  discount: any;
  onClose: () => void;
  onConfirm?: any;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div
        className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-[450px] shadow-xl
                   animate-[fadeIn_0.3s_ease-out]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-lg font-semibold text-white">
            Delete Discount Code
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-300 mt-5 leading-relaxed text-sm">
          Are you sure you want to delete{" "}
          <span className="font-medium text-white">
            {discount?.public_name}
          </span>
          ? <br />
          <span className="text-red-400 font-medium">
            This action cannot be undone.
          </span>
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium
                       bg-gray-700 text-gray-200
                       hover:bg-gray-600 hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-gray-500
                       transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2
                       transition-all focus:outline-none focus:ring-2
                       ${
                         isLoading
                           ? "bg-red-400 text-white cursor-not-allowed"
                           : "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                       }`}
          >
            {isLoading ? (
              <>
                <Loader size={18} color="text-white" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
