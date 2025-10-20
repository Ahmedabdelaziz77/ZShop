export default function QuickActionCard({ Icon, title, description }: any) {
  return (
    <div className="group bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
        <Icon className="w-5 h-5 text-blue-600 group-hover:text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-sm text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-500 leading-snug">{description}</p>
      </div>
    </div>
  );
}
