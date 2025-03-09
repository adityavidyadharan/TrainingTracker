import { createContext, useState, useEffect, useContext } from "react";
import supabase from "../clients/supabase";
import { RoledUser } from "../types/responses";

const UserContext = createContext<{ user: RoledUser | null; loading: boolean }>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RoledUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("role")  // Adjust this based on your schema
          .eq("id", user.id)
          .single();
        
        if (!error) {
          setUser({ ...user, user_role: data?.role });
        } else {
          console.error(error);
        }
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        fetchUser();
      } else {
        setUser(null);
      }
    });

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
