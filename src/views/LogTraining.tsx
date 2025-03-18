import { useState, useEffect } from "react";
import { useUser } from "../providers/UserProvider";
import supabase from "../clients/supabase";
import { EventType } from "../types/responses";
import { useLocation, useNavigate } from "react-router";
import { Tables } from "../types/db";
import { lookupSection, lookupStudent } from "../utility/SupabaseOperations";
import { DateTime } from "luxon";

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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function LogTraining() {
  const [trainingId, setTrainingId] = useState<number | null>(null);
  const [emails, setEmails] = useState([""]);
  const [toolGroups, setToolGroups] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedToolGroup, setSelectedToolGroup] = useState<number | null>(
    null
  );
  const [eventType, setEventType] = useState<EventType>("trained");
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState<string>(
    DateTime.now().toISO()?.slice(0, 16) || ""
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const PIuser = useUser().user;
  const location = useLocation();
  const navigate = useNavigate();

  const existingData =
    (location.state?.training as Tables<"trainings">) || null;

  useEffect(() => {
    if (existingData) setIsEdit(true);
    const populateInfo = async () => {
      if (existingData) {
        setTrainingId(existingData.id);
        setEmails([
          (await lookupStudent(existingData.student_id))?.email || "",
        ]);
        setSelectedToolGroup((await lookupSection(existingData.section_id))?.id || null);
        setEventType(existingData.event_type);
        setNotes(existingData.notes || "");
        setTimestamp(DateTime.fromISO(existingData.timestamp).toISO()?.slice(0, 16) || "");
      }
    };
    populateInfo();
  }, [existingData]);

  useEffect(() => {
    const fetchToolGroups = async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("id, name")
        .eq("active", true);
      if (error) console.error("Error fetching tool groups:", error);
      else setToolGroups(data || []);
    };
    fetchToolGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!PIuser) {
      setError("You must be logged in to log a training event.");
      return;
    }

    const { data: students, error: studentError } = await supabase
      .from("users")
      .select("id, email")
      .in(
        "email",
        emails.filter((email) => email.trim() !== "")
      );

    if (studentError || !students || students.length === 0) {
      setError(
        "Some or all student emails were not found. Please check and try again."
      );
      return;
    }
    if (!selectedToolGroup) {
      setError("Please select a tool group.");
      return;
    }

    const trainingRecords = students.map((student) => ({
      pi_id: PIuser.id,
      student_id: student.id,
      section_id: selectedToolGroup,
      event_type: eventType,
      timestamp: DateTime.fromISO(timestamp).toISO() || "",
      notes,
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
      setEmails([""]);
      setSelectedToolGroup(null);
      setEventType("trained");
      setNotes("");
      setTimestamp(DateTime.now().toISO()?.slice(0, 16) || "");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Log Training Event</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Label htmlFor="emails">Student Emails</Label>
            {emails.map((email, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const newEmails = [...emails];
                    newEmails[index] = e.target.value;
                    setEmails(newEmails);
                  }}
                  required
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                  disabled={emails.length === 1}
                  className="shrink-0"
                >
                  -
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmails([...emails, ""])}
              className="mt-2"
            >
              + Add Email
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toolGroup">Tool Group</Label>
            <Select
              value={selectedToolGroup?.toString() || ""}
              onValueChange={(value) => setSelectedToolGroup(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tool group" />
              </SelectTrigger>
              <SelectContent>
                {toolGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select 
              value={eventType} 
              onValueChange={(value) => setEventType(value as EventType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trained">Trained</SelectItem>
                <SelectItem value="retrained">Retrained</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timestamp">Timestamp</Label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input 
              id="instructor" 
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
      </div>
    </div>
  );
}
