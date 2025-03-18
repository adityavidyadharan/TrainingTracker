import { useEffect, useState } from "react";
import supabase from "../clients/supabase";
import {
  EventTypePlusNotStarted,
  Section,
  SectionWithProgress,
  TrainingHistorical,
} from "../types/responses";
import PrereqBadge from "../components/PrereqBadge";
import { useUser } from "../providers/UserProvider";
import getBadgeVariant from "../utility/BadgeColors";
import TrainingCard from "../components/TrainingCard";

// Shadcn UI Components
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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
          const lastTraining = trainingsObj[section.id][0];
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
    <div className="max-w-4xl mx-auto mt-5">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Training Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section, i) => (
                <AccordionItem value={`item-${i}`} key={section.id}>
                  <AccordionTrigger className="px-4 no-underline">
                    <div className="flex justify-between w-full">
                      <div className="font-medium no-underline">{section.name}</div>
                      <Badge 
                        className={getBadgeVariant(progress[section.id])}
                      >
                        {progress[section.id]}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2">
                    <div className="mb-4">
                      <PrereqBadge prereqs={listPrereq(section.id)} />
                    </div>
                    <div className="space-y-4">
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
                        <p className="text-muted-foreground">
                          No steps recorded yet.
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
