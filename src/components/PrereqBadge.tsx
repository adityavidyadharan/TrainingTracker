import { Badge } from "react-bootstrap";
import { SectionWithProgress } from "../types/responses";
import getBadgeClass from "../utility/BadgeColors";

export default function PrereqBadge({ prereqs }: { prereqs: SectionWithProgress[] }) {
  return (
    <div>
      <span>Prerequisites: </span>
      {prereqs.length > 0 ? (
        prereqs.map((prereq) => (
          <Badge key={prereq.id} className={getBadgeClass(prereq.progress)} pill>
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
