export default function StatCard({ title, count, Icon }: any) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
      <div>
        <h3 className="text-sm font-medium text-gray-500 tracking-wide uppercase">
          {title}
        </h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{count}</p>
      </div>
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
        <Icon className="w-7 h-7 text-blue-600" />
      </div>
    </div>
  );
}
