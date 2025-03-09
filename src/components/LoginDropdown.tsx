import { useEffect, useState } from "react";
import { Button, NavDropdown } from "react-bootstrap";
import { Person } from "react-bootstrap-icons";
import supabase from "../clients/supabase";
import { Link, useNavigate } from "react-router";

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
    <NavDropdown
      title={
        <span>
          <Person className="me-2" /> {user || "Account"}
        </span>
      }
      align="end"
    >
      {user ? (
        <>
          <NavDropdown.Item as={Link} to="/profile">
            Profile
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Button}
            variant="link"
            onClick={handleLogout}
            className="text-danger w-100"
          >
            Logout
          </NavDropdown.Item>
        </>
      ) : (
        <NavDropdown.Item as={Link} to="/login">
          Login
        </NavDropdown.Item>
      )}
    </NavDropdown>
  );
}
