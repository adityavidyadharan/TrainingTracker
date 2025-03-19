import { useState, useEffect } from "react";
import { useUser } from "../providers/UserProvider";
import supabase from "../clients/supabase";
import { useLocation, useNavigate } from "react-router";
import { Tables } from "../types/db";
import {
  QueryError,
  useSections,
  useUsers,
} from "../utility/SupabaseOperations";
import { DateTime } from "luxon";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  emails: z
    .array(
      z.object({
        value: z.string().email("Please enter a valid email address"),
      }),
    )
    .min(1, "At least one email is required"),
  toolGroup: z.string().min(1, "Please select a tool group"),
  eventType: z.enum(["trained", "retrained", "completed"]),
  notes: z.string().optional(),
  timestamp: z.string().min(1, "Timestamp is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LogTraining() {
  const [trainingId, setTrainingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const PIuser = useUser().user;
  const location = useLocation();
  const navigate = useNavigate();

  const existingData =
    (location.state?.training as Tables<"trainings">) || null;

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: [{ value: "" }],
      toolGroup: "",
      eventType: "trained",
      notes: "",
      timestamp: DateTime.now().toISO()?.slice(0, 16) || "",
    },
  });

  // Setup field array for dynamic emails
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emails",
  });

  const {
    data: toolGroups,
    error: toolGroupError,
    isLoading: toolGroupsLoading,
  } = useSections();

  if (toolGroupError) {
    return <QueryError error={toolGroupError} entity="tool groups" />;
  }

  const {
    data: users,
    error: usersError,
    isLoading: usersLoading,
  } = useUsers();

  if (usersError) {
    return <QueryError error={usersError} entity="users" />;
  }

  // Fetch data for editing
  useEffect(() => {
    if (existingData) setIsEdit(true);
    const populateInfo = async () => {
      if (existingData) {
        setTrainingId(existingData.id);
        // const student = await lookupStudent(existingData.student_id);
        const student = users?.find(
          (user) => user.id === existingData.student_id,
        );
        // const section = await lookupSection(existingData.section_id);
        const section = toolGroups?.find(
          (group) => group.id === existingData.section_id,
        );

        form.reset({
          emails: student?.email ? [{ value: student.email }] : [{ value: "" }],
          toolGroup: section?.id ? section.id.toString() : "",
          eventType: existingData.event_type,
          notes: existingData.notes || "",
          timestamp:
            DateTime.fromISO(existingData.timestamp).toISO()?.slice(0, 16) ||
            "",
        });
      }
    };
    populateInfo();
  }, [existingData, form]);

  const onSubmit = async (values: FormValues) => {
    setError("");
    setSuccess("");

    if (!PIuser) {
      setError("You must be logged in to log a training event.");
      return;
    }

    if (!values.toolGroup) {
      setError("Please select a tool group.");
      return;
    }

    const emailList = values.emails.map((e) => e.value);
    const students = users?.filter((user) => emailList.includes(user.email));
    const invalidStudents = emailList.filter(
      (email) => !students?.find((student) => student.email === email),
    );
    console.log("students", students);
    console.log("invalid", invalidStudents);

    if (invalidStudents.length) {
      setError(
        `The following student emails were not found: ${invalidStudents.join(", ")}`,
      );
      return;
    }

    if (!students || students.length === 0) {
      setError("No students found with the provided emails.");
      return;
    }

    const trainingRecords = students.map((student) => ({
      pi_id: PIuser.id,
      student_id: student.id,
      section_id: parseInt(values.toolGroup),
      event_type: values.eventType,
      timestamp: DateTime.fromISO(values.timestamp).toISO() || "",
      notes: values.notes,
    }));

    if (isEdit) {
      if (!trainingId) {
        setError("No training ID found for existing record.");
        return;
      }
      const { error: updateError } = await supabase
        .from("trainings")
        .update(trainingRecords[0])
        .eq("id", trainingId);
      if (updateError) {
        setError("Failed to update training event. Try again later.");
        console.error("Error updating training event:", updateError);
        return;
      }
      navigate(`/search?sid=${existingData?.student_id}`);
      return;
    }

    console.log(trainingRecords);

    const { error: insertError } = await supabase
      .from("trainings")
      .insert(trainingRecords);

    if (insertError) {
      setError("Failed to log training events. Try again later.");
      console.error("Error inserting training events:", insertError);
    } else {
      setSuccess("Training events logged successfully.");
      form.reset({
        emails: [{ value: "" }],
        toolGroup: "",
        eventType: "trained",
        notes: "",
        timestamp: DateTime.now().toISO()?.slice(0, 16) || "",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Log Training Event
        </h2>

        {usersLoading || toolGroupsLoading || !users || !toolGroups ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert
                  variant="default"
                  className="bg-green-50 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <FormLabel>Student Emails</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name={`emails.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="shrink-0"
                    >
                      -
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ value: "" })}
                  className="mt-2"
                >
                  + Add Email
                </Button>
              </div>

              <FormField
                control={form.control}
                name="toolGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tool Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tool group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {toolGroups.map((group) => (
                          <SelectItem
                            key={group.id}
                            value={group.id.toString()}
                          >
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trained">Trained</SelectItem>
                        <SelectItem value="retrained">Retrained</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timestamp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timestamp</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Instructor</FormLabel>
                <Input
                  type="text"
                  value={PIuser?.email || ""}
                  readOnly
                  disabled
                />
              </div>

              <Button type="submit" className="w-full">
                {isEdit ? "Update Training Event" : "Log Training Event"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
