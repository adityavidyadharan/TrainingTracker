import { EventTypePlusNotStarted } from "../types/responses";

export default function getBadgeVariant(event?: EventTypePlusNotStarted): "default" | "secondary" | "destructive" {
  if (!event) return "secondary";
  const lower = event.toLowerCase();
  switch (lower) {
    case "not started":
      return "secondary";
    case "completed":
      return "default";
    case "trained":
      return "secondary";
    case "retrained":
      return "destructive";
    default:
      return "default";
  }
};
