import { Navbar as BNavbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router";
import LoginDropdown from "./LoginDropdown";
import { useEffect, useState } from "react";
import supabase from "../clients/supabase";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(
      (_, session) => {
        setIsLoggedIn(session !== null);
      }
    );
  }, []);

  return (
    <BNavbar bg="light" expand="lg">
      <Container>
        <BNavbar.Brand href="/">ISGT Training Tracker</BNavbar.Brand>
        <BNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {isLoggedIn ? (
              <>
                <Link to="/status" className="nav-link">
                  Training Status
                </Link>
                <Link to="/training" className="nav-link">
                  Log Training
                </Link>
              </>
            ) :(
            <Link to="/login" className="nav-link">
              Login
            </Link>)}
          </Nav>
        </BNavbar.Collapse>
        <BNavbar.Collapse className="justify-content-end">
            <LoginDropdown />
        </BNavbar.Collapse>
      </Container>
    </BNavbar>
  );
}
