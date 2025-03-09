import { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Button, Form } from "react-bootstrap";
import { useUser } from "../providers/UserProvider";
import supabase from "../clients/supabase";
import { Database } from "../types/db";
import { EventType } from "../types/responses";

export default function LogTraining() {
  const [email, setEmail] = useState("");
  const [toolGroups, setToolGroups] = useState<{ id: number; name: string }[]>([]);
  const [selectedToolGroup, setSelectedToolGroup] = useState<number | null>(null);
  const [eventType, setEventType] = useState<EventType>("trained");
  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const PIuser = useUser().user;

  useEffect(() => {
    const fetchToolGroups = async () => {
      const { data, error } = await supabase.from("sections").select("id, name").eq("active", true);
      if (error) console.error("Error fetching tool groups:", error);
      else setToolGroups(data || []);
    };
    fetchToolGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate email exists
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();
    const studentID = data?.id;
    if (!PIuser) {
      setError("You must be logged in to log a training event.");
      return;
    }

    if (!studentID) {
      setError("Student email not found. Please check and try again.");
      return;
    }

    if (!selectedToolGroup) {
      setError("Please select a tool group.");
      return;
    }

    // Insert training record
    const { error: insertError } = await supabase.from("trainings").insert([
      {
        pi_id: PIuser.id,
        student_id: studentID,
        section_id: selectedToolGroup,
        event_type: eventType,
        timestamp,
      },
    ]);

    if (insertError) {
      setError("Failed to log training event. Try again later.");
      console.error("Error inserting training event:", insertError);
    } else {
      setSuccess("Training event logged successfully.");
      setEmail("");
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
      
      <Form.Group controlId="email">
        <Form.Label>Student Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
};
