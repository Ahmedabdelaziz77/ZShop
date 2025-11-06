import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/inbox") return null;
  return <div></div>;
}
