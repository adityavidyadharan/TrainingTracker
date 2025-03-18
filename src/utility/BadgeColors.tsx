import { EventTypePlusNotStarted } from "../types/responses";

export default function getBadgeVariant(event?: EventTypePlusNotStarted): string {
  if (!event) return "secondary";
  const lower = event.toLowerCase();
  switch (lower) {
    case "not started":
      return "bg-gray-300 text-gray-800";
    case "completed":
      return "bg-lime-700 text-white";
    case "trained":
      return "bg-slate-600 text-white";
    case "retrained":
      return "bg-yellow-800 text-white";
    default:
      return "bg-white text-black";
  }
};
