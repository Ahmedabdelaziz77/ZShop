import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function BreadCrumbs({ title }: { title: string }) {
  return (
    <nav
      className="w-full flex items-center text-sm text-gray-300 space-x-1 md:space-x-2 font-medium select-none"
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
      >
        Dashboard
      </Link>

      <ChevronRight
        size={18}
        className="text-gray-400 opacity-80 mx-1 md:mx-1.5"
      />

      <span className="text-gray-100 font-semibold tracking-wide">{title}</span>
    </nav>
  );
}
