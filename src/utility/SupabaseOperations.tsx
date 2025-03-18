import { useQuery } from "@tanstack/react-query";
import supabase from "../clients/supabase";
import { UserRoles } from "../types/responses";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        throw error;
      }
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
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("student_id", userId);
      if (error) {
        throw error;
      }
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
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("active", true);
      if (error) {
        throw error;
      }
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
};

const QueryError = ({ error, entity }: { error: Error, entity: string }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch {entity}: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
} 

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
  QueryError,
};
