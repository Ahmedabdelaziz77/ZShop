"use client";

import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import useSidebar from "apps/admin-ui/src/hooks/useSidebar";
import { usePathname } from "next/navigation";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import Logo from "apps/admin-ui/src/app/assets/svgs/logo";
import SidebarItem from "./sidebar.item";
import { Home } from "apps/admin-ui/src/app/assets/icons/home";
import SidebarMenu from "./sidebar.menu";
import {
  BellPlus,
  BellRing,
  FileClock,
  ListOrdered,
  LogOut,
  PackageSearch,
  PencilRuler,
  Settings,
  Store,
  Users,
} from "lucide-react";
import { Payment } from "apps/admin-ui/src/app/assets/icons/payment";
import { useEffect } from "react";

export default function SidebarWrapper() {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { admin } = useAdmin();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";
  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
    >
      <Sidebar.Header>
        <Box>
          <Link
            href={"/"}
            className="flex justify-center items-center text-center gap-2"
          >
            <Logo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {admin?.name.split(" ")[0]}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {admin?.email}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-3 h-full">
        <Sidebar.Body>
          {/* DASHBOARD */}
          <SidebarItem
            title="Dashboard"
            icon={<Home fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />

          <div className="mt-2 block">
            {/* MAIN MENU */}
            <SidebarMenu title="Main Menu">
              {/* LIST OF ORDERS */}
              <SidebarItem
                title="Orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
                isActive={activeSidebar === "/dashboard/orders"}
                href="/dashboard/orders"
              />

              {/* PAYMENTS */}
              <SidebarItem
                title="Payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
                isActive={activeSidebar === "/dashboard/payments"}
                href="/dashboard/payments"
              />

              {/* Products */}
              <SidebarItem
                title="Products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/products")}
                  />
                }
                isActive={activeSidebar === "/dashboard/products"}
                href="/dashboard/products"
              />

              {/* Events */}
              <SidebarItem
                title="Events"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/events")}
                  />
                }
                isActive={activeSidebar === "/dashboard/events"}
                href="/dashboard/events"
              />

              {/* USERS */}
              <SidebarItem
                title="Users"
                icon={
                  <Users size={24} color={getIconColor("/dashboard/users")} />
                }
                isActive={activeSidebar === "/dashboard/users"}
                href="/dashboard/users"
              />

              {/* SELLERS */}
              <SidebarItem
                title="Sellers"
                icon={
                  <Store size={22} color={getIconColor("/dashboard/sellers")} />
                }
                isActive={activeSidebar === "/dashboard/sellers"}
                href="/dashboard/sellers"
              />
            </SidebarMenu>

            {/* CONTROLLERS MENU */}
            <SidebarMenu title="Controllers">
              {/* LOGGERS */}
              <SidebarItem
                title="Loggers"
                icon={
                  <FileClock
                    size={22}
                    color={getIconColor("/dashboard/loggers")}
                  />
                }
                isActive={activeSidebar === "/dashboard/loggers"}
                href="/dashboard/loggers"
              />

              {/* MANAGEMENT */}
              <SidebarItem
                title="Management"
                icon={
                  <Settings
                    size={22}
                    color={getIconColor("/dashboard/management")}
                  />
                }
                isActive={activeSidebar === "/dashboard/management"}
                href="/dashboard/management"
              />

              {/* NOTIFICATIONS */}
              <SidebarItem
                title="Notifications"
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
                isActive={activeSidebar === "/dashboard/notifications"}
                href="/dashboard/notifications"
              />
            </SidebarMenu>

            {/* CUSTOMIZATION MENU */}
            <SidebarMenu title="Customization">
              {/* CUSTOMIZATION */}
              <SidebarItem
                title="All Customization"
                icon={
                  <PencilRuler
                    size={22}
                    color={getIconColor("/dashboard/customization")}
                  />
                }
                isActive={activeSidebar === "/dashboard/customization"}
                href="/dashboard/customization"
              />
            </SidebarMenu>

            {/* EXTRAS MENU */}
            <SidebarMenu title="Extras">
              {/* LOGOUT */}
              <SidebarItem
                title="Logout"
                icon={<LogOut size={20} color={getIconColor("/logout")} />}
                isActive={activeSidebar === "/logout"}
                href="/"
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
}
