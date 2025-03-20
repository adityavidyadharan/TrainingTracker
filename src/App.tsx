import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import LandingPage from "./views/LandingPage";
import TrainingStatus from "./views/TrainingStatus";
import Login from "./views/Login";
import Profile from "./views/Profile";
import { UserProvider } from "./providers/UserProvider";
import LogTraining from "./views/LogTraining";
import UserSearch from "./views/UserSearch";
import UserRoles from "./views/admin/UserRoles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Header from "./components/Header";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Logout from "./views/Logout";
import RecentTrainings from "./views/RecentTrainings";

function App() {
  const queryClient = new QueryClient();
  return (
    <BrowserRouter basename="/TrainingTracker">
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <UserProvider>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <ProtectedRoutes>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/training" element={<LogTraining />} />
                  <Route path="/status" element={<TrainingStatus />} />
                  <Route path="/search" element={<UserSearch />} />
                  <Route path="/roles" element={<UserRoles />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route
                    path="/recent/trainings"
                    element={<RecentTrainings />}
                  />
                </Routes>
              </ProtectedRoutes>
            </SidebarInset>
          </UserProvider>
        </SidebarProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
