import { useQuery } from "@tanstack/react-query";
import { useUser } from "../providers/UserProvider";
import supabase from "../clients/supabase";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { TrainingHistorical } from "../types/responses";
import DataTable from "../components/DataTable";
import getBadgeVariant from "../utility/BadgeColors";
import { Badge } from "../components/ui/badge";
import { DateTime } from "luxon";
import { Link } from "react-router";
import { Button } from "../components/ui/button";

type TrainingData = TrainingHistorical & {
  student: { name: string; id: string };
  section: { name: string };
};
// type Training = {
//   event_type: Database["public"]["Enums"]["event_type"];
//   id: number;
//   notes: string | null;
//   pi_id: string;
//   section_id: number;
//   student_id: string;
//   timestamp: string;
// }

export default function RecentTrainings() {
  const user = useUser().user;
  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select(
          "*, section:sections!section_id(name), pi:users!pi_id(name), student:users!student_id(id, name)",
        )
        .eq("pi_id", user?.id || "")
        .limit(10);
      if (error) {
        throw error;
      }
      return data || [];
    },
  });

  const columnHelper = createColumnHelper<TrainingData>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("section.name", {
        header: "Section",
        cell: (row) => row.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("student.name", {
        header: "Student",
        cell: (row) => {
          return (
            <Button variant="link">
              <Link to={`/search?sid=${row.row.original.student.id}`}>
                {row.getValue()}
              </Link>
            </Button>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("timestamp", {
        header: "Timestamp",
        cell: (row) => {
          const date = DateTime.fromISO(row.getValue());
          return date.toLocaleString(DateTime.DATETIME_MED);
        },
        enableSorting: true,
      }),
      columnHelper.accessor("event_type", {
        header: "Event Type",
        cell: (row) => (
          <Badge className={getBadgeVariant(row.getValue())}>
            {row.getValue()}
          </Badge>
        ),
        enableSorting: true,
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: trainings,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "timestamp", desc: true }],
    },
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Recent Trainings
        </h2>
        <DataTable
          table={table}
          isLoading={isLoading}
          noDataMessage="No recent trainings"
        />
      </div>
    </div>
  );
}
