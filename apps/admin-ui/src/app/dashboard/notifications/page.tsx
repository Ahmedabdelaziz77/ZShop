import BreadCrumbs from "apps/admin-ui/src/shared/components/breadCrumbs";

export default function Page() {
  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Notifications</h2>
      <BreadCrumbs title="Notifications" />
      <p className="text-center py-24 text-white text-sm font-Poppins">
        No Notifications available yet!
      </p>
    </div>
  );
}
