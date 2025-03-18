import { Badge } from "@/components/ui/badge";
import { SectionWithProgress } from "../types/responses";
import getBadgeVariant from "../utility/BadgeColors";

export default function PrereqBadge({
  prereqs,
}: {
  prereqs: SectionWithProgress[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span>Prerequisites: </span>
      {prereqs.length > 0 ? (
        prereqs.map((prereq) => (
          <Badge key={prereq.id} className={getBadgeVariant(prereq.progress)}>
            {prereq.name}
          </Badge>
        ))
      ) : (
        <Badge variant="secondary">None</Badge>
      )}
    </div>
  );
}
