import { Auth } from "@supabase/auth-ui-react";
import { useEffect } from "react";
import supabase from "../clients/supabase";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) navigate("/profile");
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center mb-3">Login</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["azure"]}
          providerScopes={{ azure: "openid profile email" }}
          onlyThirdPartyProviders 
          // redirectTo={`${window.location.origin}/TrainingTracker/#/oauth-redirect`}
          redirectTo={`${window.location.origin}/TrainingTracker/profile`}
        />
      </div>
    </div>
  );
}
