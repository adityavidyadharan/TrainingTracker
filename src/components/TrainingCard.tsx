import { useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../providers/UserProvider";
import { TrainingHistorical } from "../types/responses";
import { Loader2 } from "lucide-react";

// Shadcn UI components
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import getBadgeVariant from "../utility/BadgeColors";

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
    <Card key={idx} className="mb-2">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
          <div>
            <Badge className={getBadgeVariant(training.event_type)}>
              {training.event_type}
            </Badge>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">
              Date: {new Date(training.timestamp).toLocaleDateString()}
            </span>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">
              Trained/Tested By:
              <br /> {training.pi.name}
            </span>
          </div>
          
          {canModify && (
            <div className="flex justify-start md:justify-end gap-2">
              <Button size="sm" variant="outline" onClick={handleEdit}>
                Edit
              </Button>
              
              {loading ? (
                <Button size="sm" variant="destructive" disabled>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Deleting
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(training.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
