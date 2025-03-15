import { Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";
import getBadgeClass from "../utility/BadgeColors";
import { TrainingHistorical } from "../types/responses";
import { useUser } from "../providers/UserProvider";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function TrainingCard({
  training,
  idx,
  deleteTraining,
}: {
  training: TrainingHistorical;
  idx: number;
  deleteTraining: (trainingId: number) => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const user = useUser().user;
  if (!user) return null;
  const canModify = user.role === "admin" || user.id === training.pi_id;

  const handleEdit = () => {
    navigate("/training", { state: { training } });
  };

  const handleDelete = (trainingId: number) => {
    setLoading(true);
    deleteTraining(trainingId);
    setLoading(false);
  };

  return (
    <Card key={idx} className="mt-2">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={3}>
            <Badge className={getBadgeClass(training.event_type)} pill>
              {training.event_type}
            </Badge>
          </Col>
          <Col md={3}>
            <small className="text-muted">
              Date: {new Date(training.timestamp).toLocaleDateString()}
            </small>
          </Col>
          <Col md={3}>
            <small className="text-muted">
              Trained/Tested By:
              <br /> {training.pi.name}
            </small>
          </Col>
          {canModify && (
            <Col md={3} className="text-end">
              <small className="text-muted">
                <Button className="me-2" onClick={handleEdit}>
                  Edit
                </Button>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(training.id)}
                  >
                    Delete
                  </Button>
                )}
              </small>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
}
