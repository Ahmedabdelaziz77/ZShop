"use client";

type Props = {
  open: boolean;
  loading?: boolean;
  purgeAt?: Date | string | null; // optional: show deadline
  onClose: () => void;
  onConfirm: () => void;
};

export default function RestoreShopModal({
  open,
  loading,
  purgeAt,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  const deadline = purgeAt
    ? new Date(typeof purgeAt === "string" ? purgeAt : purgeAt).toLocaleString()
    : null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 text-gray-200 shadow-xl">
        <div className="border-b border-gray-800 px-5 py-4">
          <p className="text-lg font-semibold">Restore Shop</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-sm leading-relaxed">
            You can restore your shop within{" "}
            <strong className="text-white">28 days</strong> from the date of
            deletion.
          </p>

          {deadline && (
            <div className="rounded-lg border border-blue-700/60 bg-blue-900/20 p-3">
              <p className="text-sm">
                Deadline to restore:{" "}
                <span className="font-medium text-blue-300">{deadline}</span>
              </p>
            </div>
          )}

          <p className="text-sm text-gray-400">
            Restoring will re-enable your shop and associated products. You can
            delete it again later if needed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-800 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-700 px-3 py-2 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-md px-3 py-2 ${
              loading
                ? "bg-blue-400/60 text-white/80 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Restoring..." : "Confirm Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
