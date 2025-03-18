import { useEffect, useState } from "react";
import { Link } from "react-router";
import supabase from "../clients/supabase";
import LoginDropdown from "./LoginDropdown";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@radix-ui/react-navigation-menu";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(session !== null);
    });
  }, []);

  return (
    <nav className="flex items-center justify-between p-4 border-b shadow-sm">
      {/* Brand */}
      <Link to="/" className="text-lg font-semibold">
        ISGT Training Tracker
      </Link>

      {/* Navigation Links */}
      <NavigationMenu className="hidden lg:flex" dir="rtl">
        <NavigationMenuList className="space-x-4">
          {isLoggedIn ? (
            <>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/status">Training Status</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/training">Log Training</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/search">User Search</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/roles">User Roles</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </>
          ) : (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/login">Login</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Login Dropdown */}
      <LoginDropdown />
    </nav>
  );
}

function NavLinks({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="flex flex-col lg:flex-row lg:space-x-4">
      {isLoggedIn ? (
        <>
          <Link to="/status" className="hover:underline">Training Status</Link>
          <Link to="/training" className="hover:underline">Log Training</Link>
          <Link to="/search" className="hover:underline">User Search</Link>
          <Link to="/roles" className="hover:underline">User Roles</Link>
        </>
      ) : (
        <Link to="/login" className="hover:underline">Login</Link>
      )}
    </div>
  );
}
