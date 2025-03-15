import supabase from "../clients/supabase";

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

export { lookupSection, lookupStudent };
