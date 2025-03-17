import { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Button, Form } from "react-bootstrap";
import { useUser } from "../providers/UserProvider";
import supabase from "../clients/supabase";
import { EventType } from "../types/responses";
import { useLocation, useNavigate } from "react-router";
import { Tables } from "../types/db";
import { lookupSection, lookupStudent } from "../utility/SupabaseOperations";
import { DateTime } from "luxon";

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
  const [timestamp, setTimestamp] = useState<DateTime>(
    DateTime.now()
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
        setTimestamp(DateTime.fromISO(existingData.timestamp));
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
      timestamp,
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
        return
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
      setTimestamp(new Date().toISOString().slice(0, 16));
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={10}>
          <h2 className="text-center mb-4">Log Training Event</h2>
        </Col>
      </Row>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form.Group controlId="emails">
          <Form.Label>Student Emails</Form.Label>
          {emails.map((email, index) => (
            <div key={index} className="d-flex align-items-center mt-2">
              <Form.Control
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
                variant="danger"
                onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                className="ms-2"
                disabled={emails.length === 1}
              >
                -
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => setEmails([...emails, ""])}
          >
            + Add Email
          </Button>
        </Form.Group>

        <Form.Group controlId="toolGroup">
          <Form.Label>Tool Group</Form.Label>
          <Form.Control
            as="select"
            value={selectedToolGroup || ""}
            onChange={(e) => setSelectedToolGroup(parseInt(e.target.value))}
            required
          >
            <option value="">Select a tool group</option>
            {toolGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="eventType">
          <Form.Label>Event Type</Form.Label>
          <Form.Control
            as="select"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            required
          >
            <option value="trained">Trained</option>
            <option value="retrained">Retrained</option>
            <option value="completed">Completed</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="notes">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="timestamp">
          <Form.Label>Timestamp</Form.Label>
          <Form.Control
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="instructor">
          <Form.Label>Instructor</Form.Label>
          <Form.Control type="text" value={PIuser?.email} readOnly disabled />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3">
          Log Training Event
        </Button>
      </Form>
    </Container>
  );
}
