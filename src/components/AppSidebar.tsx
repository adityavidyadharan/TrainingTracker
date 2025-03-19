import {
  CircleUser,
  Home,
  ListCheck,
  Search,
  Settings,
  SquarePen,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import { useUser } from "../providers/UserProvider";
import { useEffect, useState } from "react";

// Menu items.
const items = [
  {
    title: "PIs",
    url: "/",
    items: [
      { title: "User Search", url: "/search", icon: Search },
      { title: "Log Training", url: "/training", icon: SquarePen },
    ],
    roles: ["admin", "full_pi", "provisional_pi"]
  },
  {
    title: "Admin",
    url: "/",
    items: [{ title: "User Roles", url: "/roles", icon: Settings }],
    roles: ["admin"],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const url = location.pathname;
  const [userRole, setUserRole] = useState<string>("student");
  const { user } = useUser();
  useEffect(() => {
    if (user) {
      setUserRole(user.user_role);
    }
  }, [user]);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={url === "/home"}>
                  <Link to="/home">
                    <Home size={24} />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={url === "/status"}>
                  <Link to="/status">
                    <ListCheck size={24} />
                    <span>Training Status</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={url === "/profile"}>
                  <Link to="/profile">
                    <CircleUser size={24} />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {items.map(
          (item) =>
            item.roles.includes(userRole) && (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={url === item.url}>
                          <Link to={item.url}>
                            <item.icon size={24} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ),
        )}
      </SidebarContent>
    </Sidebar>
  );
}
