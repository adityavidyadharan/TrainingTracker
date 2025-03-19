import { createContext, useState, useEffect, useContext } from "react";
import supabase from "../clients/supabase";
import { RoledUser, UserRoles } from "../types/responses";
import { jwtDecode } from "jwt-decode";

const UserContext = createContext<{ user: RoledUser | null; loading: boolean }>(
  {
    user: null,
    loading: true,
  },
);

type JWT = {
  user_role: UserRoles;
  user_email: string;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RoledUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const jwt = jwtDecode<JWT>(session.access_token);
        setLoading(false);
        setUser({
          ...session.user,
          user_role: jwt.user_role,
          email: jwt.user_email,
          name: session.user.user_metadata.full_name,
        });
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (session?.user) {
          const jwt = jwtDecode<JWT>(session.access_token);
          const role = jwt.user_role;
          const email = jwt.user_email;
          setLoading(false);
          setUser({
            ...session.user,
            user_role: role,
            email,
            name: session.user.user_metadata.full_name,
          });
        } else {
          setUser(null);
        }
      },
    );

    return () => authListener?.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
