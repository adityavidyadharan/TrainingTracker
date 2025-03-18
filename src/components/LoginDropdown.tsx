import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Person } from "react-bootstrap-icons";
import supabase from "../clients/supabase";

export default function LoginDropdown() {
  const [user, setUser] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user?.email || null);
      }
    );
    return () => authListener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" onClick={() => navigate("/profile")}>
          <Person className="mr-2" /> {user || "Account"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {user ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-danger cursor-pointer">
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/login">Login</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
