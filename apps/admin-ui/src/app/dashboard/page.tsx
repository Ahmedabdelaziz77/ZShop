import DeviceUsagePie from "../../shared/components/charts/device-usage-pie";
import GeoMap from "../../shared/components/charts/geo-map";
import RecentOrdersTable from "../../shared/components/charts/recent-orders";
import SalesChart from "../../shared/components/charts/sales-chart";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="col-span-2">
        <SalesChart />
      </div>
      <DeviceUsagePie />
      <RecentOrdersTable />
      <div className="col-span-2">
        <GeoMap />
      </div>
    </div>
  );
}
