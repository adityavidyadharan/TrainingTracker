import supabase from "../clients/supabase";
import { formatUserRole } from "../utility/Formatting";
import { useNavigate } from "react-router";
import { useUser } from "../providers/UserProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const navigate = useNavigate();
  const user = useUser().user;

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     if (!user) {
  //       navigate("/login");
  //     }
  //   };
  //   fetchUser();
  // }, [navigate, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-center">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-3">
              <p>
                <span className="font-bold">Name:</span>{" "}
                {user.user_metadata.full_name}
              </p>
              <p>
                <span className="font-bold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-bold">Role:</span>{" "}
                {formatUserRole(user.user_role)}
              </p>
              <Button
                variant="destructive"
                className="w-full mt-6"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2">Loading...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
