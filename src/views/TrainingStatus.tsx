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
import {
  EventTypePlusNotStarted,
  Section,
  SectionWithProgress,
  TrainingHistorical,
} from "../types/responses";
import PrereqBadge from "../components/PrereqBadge";
import { useUser } from "../providers/UserProvider";
import getBadgeClass from "../utility/BadgeColors";
import TrainingCard from "../components/TrainingCard";

export default function TrainingStatus({ user_id }: { user_id?: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [trainings, setTrainings] = useState<
    Record<number, TrainingHistorical[]>
  >({});
  const [progress, setProgress] = useState<Record<number, EventTypePlusNotStarted>>({});
  const [loading, setLoading] = useState(true);
  let user: string;
  const currentUser = useUser().user;
  if (user_id) {
    user = user_id;
  } else {
    user = currentUser?.id || "";
  }

  const fetchInfo = async () => {
    setLoading(true);
    const { data: sectionsData, error } = await supabase
      .from("sections")
      .select("id, name, prereq")
      .eq("active", true);

    if (error) {
      console.error("Error fetching sections:", error);
      return;
    } else {
      setSections(sectionsData);
    }
    if (!user) return;

    const { data: trainingData, error: trainingError } = await supabase
      .from("trainings")
      .select("*, pi:users!pi_id(name)")
      .eq("student_id", user)
      .order("timestamp", { ascending: true });
    if (trainingError) {
      console.error("Error fetching trainings:", error);
    } else {
      // Group trainings by section_id
      const trainingsObj: Record<number, TrainingHistorical[]> = {};
      trainingData.forEach((training) => {
        if (!trainingsObj[training.section_id]) {
          trainingsObj[training.section_id] = [];
        }
        trainingsObj[training.section_id].push(training);
      });
      Object.keys(trainingsObj).forEach((key) => {
        const sectionId = parseInt(key);
        trainingsObj[sectionId].sort(
          (a: TrainingHistorical, b: TrainingHistorical) => {
            return (
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime()
            );
          }
        );
      });
      setTrainings(trainingsObj);
      // Determine progress for each section
      const progressObj: Record<number, EventTypePlusNotStarted> = {};
      sectionsData.forEach((section) => {
        if (trainingsObj[section.id]) {
          const lastTraining =
            trainingsObj[section.id][0];
          progressObj[section.id] = lastTraining.event_type;
        } else {
          progressObj[section.id] = "not started";
        }
      });
      setProgress(progressObj);
    }
    setLoading(false);
  };

  const deleteTraining = async (trainingId: number) => {
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", trainingId);
    if (error) {
      console.error("Error deleting training:", error);
    } else {
      fetchInfo();
    }
  };

  
  useEffect(() => {
    fetchInfo();
  }, []);

  const listPrereq = (id: number): SectionWithProgress[] => {
    const prereqs = [];
    let currentId: number | null = id;
    while (currentId) {
      const section = sections.find((s) => s.id === currentId);
      if (!section) break;
      prereqs.push({ ...section, progress: progress[section.id] });
      currentId = section.prereq;
    }
    prereqs.shift();
    return prereqs.reverse();
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
                            <Badge
                              className={getBadgeClass(progress[section.id])}
                              pill
                            >
                              {progress[section.id]}
                            </Badge>
                          </Col>
                        </Row>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          <PrereqBadge prereqs={listPrereq(section.id)} />
                        </Row>
                        <Row>
                          {trainings[section.id] ? (
                            trainings[section.id].map((training, idx) => (
                              <TrainingCard
                                training={training}
                                idx={idx}
                                key={idx}
                                deleteTraining={deleteTraining}
                              />
                            ))
                          ) : (
                            <p className="text-muted mb-0">
                              No steps recorded yet.
                            </p>
                          )}
                        </Row>
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
