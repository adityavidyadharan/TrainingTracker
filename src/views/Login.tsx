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
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
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
