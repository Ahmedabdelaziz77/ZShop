"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteShopModal({
  open,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const [confirmText, setConfirmText] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 text-gray-200 shadow-xl">
        <div className="border-b border-gray-800 px-5 py-4">
          <p className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            Delete Shop
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-sm leading-relaxed">
            Deleting your shop is a{" "}
            <strong className="text-white">permanent action</strong>. However,
            you have <strong className="text-white">28 days</strong> to restore
            your shop before it is permanently removed.
          </p>

          <div className="flex items-start gap-2 rounded-lg border border-yellow-700/60 bg-yellow-900/20 p-3">
            <AlertTriangle className="mt-0.5 text-yellow-400" size={18} />
            <div className="text-sm">
              <p className="font-medium text-yellow-300">Important</p>
              <p>
                Once the shop is permanently deleted, you{" "}
                <strong>cannot</strong> create a new account with the same email
                in the future.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-3">
            <p className="text-sm">
              You can <em>restore</em> your shop within 28 days from the date of
              deletion. After that, it will be <em>permanently removed</em>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-gray-400">
              Type <span className="font-mono text-gray-200">DELETE</span> to
              confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-800 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-700 px-3 py-2 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            disabled={loading || confirmText !== "DELETE"}
            onClick={onConfirm}
            className={`rounded-md px-3 py-2 ${
              loading || confirmText !== "DELETE"
                ? "bg-red-400/60 text-white/80 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
