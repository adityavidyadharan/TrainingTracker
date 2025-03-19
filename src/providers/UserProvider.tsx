import { createContext, useState, useEffect, useContext } from "react";
import supabase from "../clients/supabase";
import { RoledUser, UserRoles } from "../types/responses";
import { jwtDecode } from "jwt-decode";

const UserContext = createContext<{ user: RoledUser | null }>({
  user: null,
});

type JWT = {
  user_role: UserRoles;
  user_email: string;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RoledUser | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const jwt = jwtDecode<JWT>(session.access_token);
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
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
