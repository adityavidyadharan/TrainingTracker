import { Badge } from "react-bootstrap";
import { Section } from "../types/responses";

export default function PrereqBadge({ prereqs }: { prereqs: Section[] }) {
  return (
    <div>
      <span>Prerequisites: </span>
      {prereqs.length > 0 ? (
        prereqs.map((prereq) => (
          <Badge key={prereq.id} className="bg-info ms-1" pill>
            {prereq.name}
          </Badge>
        ))
      ) : (
        <Badge className="bg-secondary ms-1" pill>
          None
        </Badge>
      )}
    </div>
  );
}
