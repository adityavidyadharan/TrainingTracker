import { EventType } from "../types/responses";

export default function getBadgeClass(event?: EventType | "not started"): string {
  if (!event) return "bg-secondary";
  const lower = event.toLowerCase();
  if (lower === "completed") return "bg-success";
  if (lower === "trained") return "bg-primary";
  if (lower === "retrained") return "bg-warning text-dark";
  return "bg-secondary";
};
