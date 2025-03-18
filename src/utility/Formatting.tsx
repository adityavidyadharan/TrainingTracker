import { UserRoles } from "../types/responses";

function formatUserRole(user: UserRoles): string {
  switch (user) {
    case "admin":
      return "Administrator";
    case "full_pi":
      return "Full PI";
    case "provisional_pi":
      return "Provisional PI";
    case "student":
      return "Student";
    default:
      return "Unknown";
  }
}

export { formatUserRole };
