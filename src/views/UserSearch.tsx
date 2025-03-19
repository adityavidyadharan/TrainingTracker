import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Tables } from "../types/db";
import TrainingStatus from "./TrainingStatus";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useUsers } from "../utility/SupabaseOperations";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import { useQueryClient } from "@tanstack/react-query";
import TablePagination from "../components/TablePagination";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

type User = Pick<Tables<"users">, "id" | "name" | "email">;

export default function UserSearch() {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [searchParams] = useSearchParams();

  const { data: users = [], isFetching, isLoading, isError } = useUsers();

  useEffect(() => {
    const student_id = searchParams.get("sid");
    if (isLoading) return;
    if (student_id) {
      (async () => {
        const user = users.find((u) => u.id === student_id);
        if (user) {
          setSelectedUser(user);
          setGlobalFilter(user.name);
        } else {
          setError("User not found");
        }
      })();
    } else {
      setSelectedUser(null);
    }
  }, [searchParams, users]);

  const columnHelper = createColumnHelper<User>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (row) => row.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (row) => row.getValue(),
        enableSorting: true,
      }),
      columnHelper.display({
        header: "View Log",
        cell: (info) => (
          <Button
            size="sm"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("sid", info.row.original.id.toString());
              window.history.pushState({}, "", url.toString());
              setSelectedUser(info.row.original);
              setGlobalFilter(info.row.original.name);
            }}
          >
            View
          </Button>
        ),
        enableGlobalFilter: false,
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const pages = table.getPageCount();

  return (
    <div className="container mx-auto py-4">
      <div className="max-w-2xl mx-auto px-4">
        <h3 className="text-2xl font-bold mb-4">
          User Lookup & Training Status
        </h3>
        <div className="flex gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setSelectedUser(null);
            }}
            className="w-1/3"
            disabled={isLoading}
          />
          {globalFilter && (
            <Button
              variant="outline"
              onClick={() => {
                setGlobalFilter("");
                setSelectedUser(null);
                const url = new URL(window.location.href);
                url.searchParams.delete("sid");
                window.history.pushState({}, "", url.toString());
              }}
            >
              Clear
            </Button>
          )}
          <Button
            className="cursor-pointer"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["users"] })
            }
            disabled={isLoading}
          >
            {isFetching ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{isError}</AlertDescription>
          </Alert>
        )}
        {!selectedUser && (
          <>
            <DataTable table={table} isLoading={isLoading} />
            <TablePagination
              pagination={pagination}
              users={users}
              pages={pages}
              table={table}
            />
          </>
        )}
      </div>

      {selectedUser && (
        <Card className="mt-6 max-w-4xl mx-auto container">
          <CardHeader>
            <CardTitle>Training Status for {selectedUser.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrainingStatus user_id={selectedUser.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
