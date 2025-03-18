import { useQuery } from "@tanstack/react-query";
import supabase from "../clients/supabase";
import { UserRoles } from "../types/responses";

const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("*");
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

const useTrainings = (userId: string) => {
  return useQuery({
    queryKey: ["trainings", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("trainings")
        .select("*")
        .eq("student_id", userId);
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

const useSections = () => {
  return useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("*")
        .eq("active", true);
      return data || [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

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
    .then(({ data }) => data);
};

const updateUserRole = async (userId: string, newRole: UserRoles) => {
  return supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId)
    .then(({ error }) => error);
};

export {
  lookupSection,
  lookupStudent,
  updateUserRole,
  useUsers,
  useTrainings,
  useSections,
};
