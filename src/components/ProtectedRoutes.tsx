import { useLocation, useNavigate } from "react-router";
import { useUser } from "../providers/UserProvider";
import { useEffect } from "react";

export default function ProtectedRoutes({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  
  const isHomePage = location.pathname === "/home";
  const isLoginRedirect = location.pathname === "/profile";
  useEffect(() => {
    if (!user && !isHomePage && !isLoginRedirect && !loading) {
      navigate("/login");
    }
  }, [user, navigate, isHomePage]);
  
  return children;
}
