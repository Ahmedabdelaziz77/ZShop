"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Mail,
  Globe,
  Smartphone,
  Trash2,
  ChevronRight,
  ChevronDown,
  ChevronRightCircle,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import toast from "react-hot-toast";
import DeleteShopModal from "../../components/modals/DeleteShopModal";
import RestoreShopModal from "../../components/modals/RestoreShopModal";
import Collapse from "../../components/Collapse";

type GeneralSettings = {
  lowStockThreshold: number;
  notifications: { email: boolean; web: boolean; app: boolean };
};

export default function GeneralTab() {
  const qc = useQueryClient();
  const [openDelete, setOpenDelete] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);

  const [openLowStock, setOpenLowStock] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings", "general"],
    queryFn: async (): Promise<GeneralSettings> => {
      const res = await axiosInstance.get("/seller/api/get-shop-settings");
      const s = res?.data?.settings ?? {};
      return {
        lowStockThreshold: Number(s.lowStockThreshold ?? 10),
        notifications: {
          email: Boolean(s.notifications?.email ?? true),
          web: Boolean(s.notifications?.web ?? true),
          app: Boolean(s.notifications?.app ?? false),
        },
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: deletionState } = useQuery({
    queryKey: ["shop-deletion-state"],
    queryFn: async (): Promise<{
      isDeleted: boolean;
      deletedAt?: string | null;
    }> => {
      const res = await axiosInstance.get(
        "/seller/api/get-shop-deletion-state"
      );
      return res?.data ?? { isDeleted: false, deletedAt: null };
    },
    staleTime: 1000 * 30,
  });

  const isDeleted = !!deletionState?.isDeleted;
  const restoreDeadline = deletionState?.deletedAt
    ? new Date(deletionState.deletedAt)
    : null;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<GeneralSettings>({
    defaultValues: {
      lowStockThreshold: 10,
      notifications: { email: true, web: true, app: false },
    },
  });

  useEffect(() => {
    if (settings) {
      setValue("lowStockThreshold", settings.lowStockThreshold);
      setValue("notifications.email", settings.notifications.email);
      setValue("notifications.web", settings.notifications.web);
      setValue("notifications.app", settings.notifications.app);
    }
  }, [settings, setValue]);

  const updateMutation = useMutation({
    mutationFn: async (payload: GeneralSettings) =>
      axiosInstance.put("/seller/api/update-shop-settings", payload),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["settings", "general"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save settings");
    },
  });

  const deleteShopMutation = useMutation({
    mutationFn: async () => axiosInstance.delete("/seller/api/delete-shop"),
    onSuccess: () => {
      toast.success("Shop scheduled for deletion");
      setOpenDelete(false);
      qc.invalidateQueries({ queryKey: ["shop-deletion-state"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to delete shop"),
  });

  const restoreShopMutation = useMutation({
    mutationFn: async () => axiosInstance.put("/seller/api/restore-shop"),
    onSuccess: () => {
      toast.success("Shop restored");
      setOpenRestore(false);
      qc.invalidateQueries({ queryKey: ["shop-deletion-state"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to restore shop"),
  });

  const onSubmit = (formData: GeneralSettings) => {
    if (formData.lowStockThreshold < 0) {
      toast.error("Threshold must be 0 or greater");
      return;
    }
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ===== General Card ===== */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden shadow-sm animate-[softIn_.18s_ease]"
      >
        {/* Low Stock (collapsible) */}
        <div className="px-6 pt-5">
          <button
            type="button"
            onClick={() => setOpenLowStock((s) => !s)}
            className="w-full flex items-start justify-between group"
          >
            <div className="flex items-start gap-3 text-left">
              <Bell
                className="text-blue-300 mt-[2px] transition-transform duration-150 group-hover:scale-[1.04]"
                size={18}
              />
              <div>
                <p className="text-white font-medium">
                  Low Stock Alert Threshold
                </p>
                <p className="text-sm text-gray-400">
                  Get notified when stock falls below the set limit.
                </p>
              </div>
            </div>
            <span className="rounded-md p-1 transition-colors duration-200 hover:bg-gray-800/70">
              {openLowStock ? (
                <ChevronDown
                  size={18}
                  className="text-gray-300 transition-transform duration-200"
                />
              ) : (
                <ChevronRight
                  size={18}
                  className="text-gray-300 transition-transform duration-200"
                />
              )}
            </span>
          </button>

          <Collapse open={openLowStock}>
            <div className="mt-4 border-t border-gray-800 pt-4">
              <label className="block text-sm mb-2 text-gray-300">
                Threshold Value
              </label>
              <div className="flex gap-3 items-center">
                <Controller
                  name="lowStockThreshold"
                  control={control}
                  rules={{
                    required: "Required",
                    validate: (v) =>
                      Number.isFinite(Number(v)) &&
                      Number(v) >= 0 &&
                      Number(v) <= 1_000_000
                        ? true
                        : "Enter a valid number (0–1,000,000)",
                  }}
                  render={({ field }) => (
                    <input
                      type="number"
                      min={0}
                      className="w-40 px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow duration-200"
                      {...field}
                    />
                  )}
                />
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !isDirty}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium
                    transition-transform duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${
                      updateMutation.isPending || !isDirty
                        ? "bg-blue-400 text-white/90 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
              {errors.lowStockThreshold && (
                <p className="text-red-500 text-xs mt-2">
                  {String(errors.lowStockThreshold.message)}
                </p>
              )}
            </div>
          </Collapse>
        </div>

        <div className="my-5 border-t border-gray-800" />

        {/* Notifications (collapsible) */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => setOpenNotifications((s) => !s)}
            className="w-full flex items-start justify-between group"
          >
            <div className="flex items-start gap-3 text-left">
              <Mail
                className="text-yellow-300 mt-[2px] transition-transform duration-150 group-hover:scale-[1.04]"
                size={18}
              />
              <div>
                <p className="text-white font-medium">
                  Order Notification Preferences
                </p>
                <p className="text-sm text-gray-400">
                  Choose how you receive order notifications (Email, Web, App).
                </p>
              </div>
            </div>
            <span className="rounded-md p-1 transition-colors duration-200 hover:bg-gray-800/70">
              {openNotifications ? (
                <ChevronDown
                  size={18}
                  className="text-gray-300 transition-transform duration-200"
                />
              ) : (
                <ChevronRight
                  size={18}
                  className="text-gray-300 transition-transform duration-200"
                />
              )}
            </span>
          </button>

          <Collapse open={openNotifications}>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Toggle
                    label="Email"
                    icon={<Mail size={14} />}
                    checked={watch("notifications.email")}
                    onChange={(v) =>
                      setValue("notifications.email", v, { shouldDirty: true })
                    }
                  />
                  <Toggle
                    label="Web"
                    icon={<Globe size={14} />}
                    checked={watch("notifications.web")}
                    onChange={(v) =>
                      setValue("notifications.web", v, { shouldDirty: true })
                    }
                  />
                  <Toggle
                    label="App"
                    icon={<Smartphone size={14} />}
                    checked={watch("notifications.app")}
                    onChange={(v) =>
                      setValue("notifications.app", v, { shouldDirty: true })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !isDirty}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium
                    transition-transform duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${
                      updateMutation.isPending || !isDirty
                        ? "bg-blue-400 text-white/90 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </Collapse>
        </div>
      </form>

      {/* ===== Danger Zone ===== */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden shadow-sm animate-[softIn_.18s_ease]">
        <div className="px-6 py-4">
          <p className="text-red-400 font-semibold">Danger Zone</p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {!isDeleted ? (
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Trash2 className="text-red-400 mt-[2px]" size={18} />
                <div>
                  <p className="text-white font-medium">Delete Shop</p>
                  <p className="text-sm text-red-400">
                    Deleting your shop is irreversible. Proceed with caution.
                  </p>
                </div>
              </div>
              <button
                aria-label="Delete Shop"
                onClick={() => setOpenDelete(true)}
                className="p-1.5 rounded-full border border-gray-700/60 hover:bg-gray-800 transition-colors duration-150"
                title="Delete Shop"
              >
                <ChevronRightCircle size={20} className="text-gray-300" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <RotateCcw className="text-blue-400 mt-[2px]" size={18} />
                <div>
                  <p className="text-white font-medium">Restore Shop</p>
                  <p className="text-sm text-gray-400">
                    You can restore within 28 days of deletion.
                    {restoreDeadline && (
                      <>
                        {" "}
                        Deadline:{" "}
                        <span className="text-blue-300">
                          {restoreDeadline.toLocaleString()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                aria-label="Restore Shop"
                onClick={() => setOpenRestore(true)}
                className="px-3 py-1.5 rounded-md border border-blue-700/60 text-blue-200 hover:bg-blue-900/20 transition-colors duration-150"
                title="Restore Shop"
              >
                Restore
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DeleteShopModal
        open={openDelete}
        loading={deleteShopMutation.isPending}
        onClose={() => setOpenDelete(false)}
        onConfirm={() => deleteShopMutation.mutate()}
      />
      <RestoreShopModal
        open={openRestore}
        loading={restoreShopMutation.isPending}
        purgeAt={restoreDeadline}
        onClose={() => setOpenRestore(false)}
        onConfirm={() => restoreShopMutation.mutate()}
      />

      {/* Keyframes (inline) */}
      <style jsx>{`
        @keyframes softIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function Toggle({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${
          checked
            ? "bg-blue-600/20 text-blue-200 border-blue-700/40 hover:bg-blue-600/30"
            : "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 hover:bg-gray-800/60"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
