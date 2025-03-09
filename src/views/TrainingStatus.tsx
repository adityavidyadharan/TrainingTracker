import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Accordion,
  Badge,
  Spinner,
} from "react-bootstrap";
import supabase from "../clients/supabase";
import { Section } from "../types/responses";
import PrereqBadge from "../components/PrereqBadge";

export default function TrainingStatus() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("id, name, prereq")
        .eq("active", true);

      if (error) {
        console.error("Error fetching sections:", error);
      } else {
        setSections(data);
      }
      setLoading(false);
    };

    fetchSections();
  }, []);

  const listPrereq = (id: number) => {
    const prereqs = [];
    let currentId: number | null = id;
    while (currentId) {
      const section = sections.find((s) => s.id === currentId);
      if (!section) break;
      prereqs.push(section);
      currentId = section.prereq;
    }
    prereqs.shift();
    return prereqs.reverse();
  };

  const getBadgeClass = (stepOrStatus: string) => {
    const lower = stepOrStatus.toLowerCase();
    if (lower === "completed") return "bg-success";
    if (lower === "trained") return "bg-primary";
    if (lower === "failed test/retrained") return "bg-warning text-dark";
    if (lower === "not started") return "bg-secondary";
    return "bg-secondary";
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={10}>
          <Card>
            <Card.Header as="h3" className="text-center">
              Training Sections
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status" />
                </div>
              ) : (
                <Accordion>
                  {sections.map((section, i) => (
                    <Accordion.Item eventKey={i.toString()} key={section.id}>
                      <Accordion.Header>
                        <Row className="w-100">
                          <Col xs={6} md={6}>
                            <strong>{section.name}</strong>
                          </Col>
                          <Col xs={6} md={6} className="text-end">
                            <Badge className={getBadgeClass("completed")} pill>
                              Completed
                            </Badge>
                          </Col>
                        </Row>
                      </Accordion.Header>
                      <Accordion.Body>
                        <PrereqBadge
                          prereqs={listPrereq(section.id)}
                        />
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
