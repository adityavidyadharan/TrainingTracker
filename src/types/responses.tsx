import { User } from "@supabase/auth-js";

interface Section {
  id: number;
  name: string;
  prereq: number | null;
}

type RoledUser = User & { user_role: string };

export type {
  Section,
  RoledUser,
};
