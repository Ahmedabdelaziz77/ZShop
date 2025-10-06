import { X, Loader2 } from "lucide-react";

export default function DeleteConfirmationModal({
  product,
  onClose,
  onConfirm,
  onRestore,
  isConfirming,
  isRestoring,
}: {
  product: any;
  onClose: () => void;
  onConfirm: () => void;
  onRestore: () => void;
  isConfirming: boolean;
  isRestoring: boolean;
}) {
  const isDeleted = product?.isDeleted;
  const isLoading = isConfirming || isRestoring;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn">
      {/* Modal Container */}
      <div
        className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl w-[90%] max-w-md
                   transform transition-all duration-300 ease-out scale-100 sm:scale-105"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl font-semibold text-white tracking-wide">
            {isDeleted ? "Restore Product" : "Delete Product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 text-sm leading-relaxed text-gray-300">
          {isDeleted ? (
            <>
              Do you want to restore{" "}
              <span className="font-semibold text-white">{product?.title}</span>{" "}
              back to your product list?
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">{product?.title}</span>
              ?<br />
              <span className="text-gray-400">
                This product will be moved to a deleted state and permanently
                removed after <b>24 hours</b>. You can restore it within this
                time.
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-200 bg-gray-700
                       hover:bg-gray-600 hover:text-white focus:ring-2 focus:ring-gray-500
                       disabled:opacity-50 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={isDeleted ? onRestore : onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 transition-all
                        ${
                          isDeleted
                            ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        }
                        text-white disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />{" "}
                {isDeleted ? "Restoring..." : "Deleting..."}
              </>
            ) : (
              <>{isDeleted ? "Restore" : "Delete"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
