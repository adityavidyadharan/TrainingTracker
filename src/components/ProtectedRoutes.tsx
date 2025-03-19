import { useLocation, useNavigate } from "react-router";
import { useUser } from "../providers/UserProvider";
import { useEffect } from "react";

export default function ProtectedRoutes({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't redirect on the home page `/`
  const isHomePage = location.pathname === "/";
  const isLoginRedirect = location.pathname === "/profile";

  useEffect(() => {
    if (!user && !isHomePage && !isLoginRedirect) {
      navigate("/login");
    }
  }, [user, navigate, isHomePage]);

  return children;
}
