import { useNavigate } from "react-router";
import supabase from "../clients/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Logout() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-center">Logout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p>Are you sure you want to logout?</p>
            <Button
              variant="destructive"
              className="w-full mt-6 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
