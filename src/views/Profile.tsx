import { useEffect } from "react";
import supabase from "../clients/supabase";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router";
import { useUser } from "../providers/UserProvider";

export default function Profile() {
  const navigate = useNavigate();
  const user = useUser().user

  useEffect(() => {
    const fetchUser = async () => {
      // if (!user) {
      //   navigate("/login");
      // }
    };
    fetchUser();
  }, [navigate, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <Card className="shadow-sm p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-3">Profile</Card.Title>
          {user ? (
            <div>
              <p><strong>Name:</strong> {user.user_metadata.full_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.user_metadata?.role || "User"}</p>
              <Button variant="danger" className="w-100 mt-3" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <div className="text-center">
              <Spinner animation="border" role="status" />
              <p className="mt-2">Loading...</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
