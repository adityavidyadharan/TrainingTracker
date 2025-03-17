import { User } from "@supabase/auth-js";
import { Database, Tables } from "./db";

interface Section {
  id: number;
  name: string;
  prereq: number | null;
}

interface SectionWithProgress extends Section {
  progress: EventTypePlusNotStarted;
}

type TrainingHistorical = Tables<"trainings"> & { pi: { name: string } };

type UserRoles = Database["public"]["Enums"]["user_role"];
type RoledUser = User & { user_role: string };

type EventType = Database["public"]["Enums"]["event_type"];
type EventTypePlusNotStarted = EventType | "not started";

export type {
  Section,
  SectionWithProgress,
  UserRoles,
  RoledUser,
  TrainingHistorical,
  EventType,
  EventTypePlusNotStarted,
};
