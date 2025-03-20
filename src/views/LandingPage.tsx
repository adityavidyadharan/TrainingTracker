import { Link } from "react-router";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the ISGT Training Tracker
        </h1>
        <p className="text-gray-600 mb-4">
          Brought to you by a CS student with too much free time
        </p>
        <Button variant="outline">
          <Link to="https://youtu.be/dQw4w9WgXcQ">Donate here</Link>
        </Button>
      </div>
    </div>
  );
}
