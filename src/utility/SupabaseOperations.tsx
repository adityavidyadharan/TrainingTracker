import supabase from "../clients/supabase";
import { UserRoles } from "../types/responses";

const lookupSection = async (sectionId: number) => {
  return supabase
    .from("sections")
    .select("id, name")
    .eq("id", sectionId)
    .single()
    .then(({ data }) => data);
};

const lookupStudent = async (userId: string) => {
  return supabase
    .from("users")
    .select("id, email")
    .eq("id", userId)
    .single()
    .then(({ data }) => data)
};

const updateUserRole = async (userId: string, newRole: UserRoles) => {
  return supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId)
    .then(({ error }) => error);
}

export { lookupSection, lookupStudent, updateUserRole };
