import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "../../types/db";
import supabase from "../../clients/supabase";
import { updateUserRole } from "../../utility/SupabaseOperations";
import { UserRoles } from "../../types/responses";
import { toast } from "sonner";

type User = Pick<Tables<"users">, "id" | "name" | "email" | "role">;

import "@tanstack/react-table";
import { formatUserRole } from "../../utility/Formatting";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";
import TablePagination from "../../components/TablePagination";
import DataTable from "../../components/DataTable";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends unknown, TValue> {
    headerClassName?: string;
    bodyClassName?: string;
  }
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  const {
    data: users = [],
    isFetching,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("*");
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      newRole,
    }: {
      name: string;
      userId: string;
      newRole: UserRoles;
    }) => updateUserRole(userId, newRole),
    onSuccess: (_data, { name, newRole }) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast("Role updated successfully", {
        description: `Set role for ${name} to ${newRole}`,
      });
    },
  });

  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => {
          return (
            <Link
              to={`/search?sid=${info.row.original.id}`}
              className="underline"
            >
              {info.getValue()}
            </Link>
          );
        },
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => formatUserRole(info.getValue()),
        enableSorting: true,
      }),
      columnHelper.display({
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          const [tempRole, setTempRole] = useState(user.role);

          const hasChanged = tempRole !== user.role;

          const handleSave = () => {
            updateRoleMutation.mutate({
              userId: user.id,
              name: user.name,
              newRole: tempRole,
            });
          };

          return (
            <div className="flex items-center gap-2">
              <Select
                value={tempRole}
                onValueChange={(value) => setTempRole(value as UserRoles)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="provisional_pi">Provisional PI</SelectItem>
                  <SelectItem value="full_pi">Full PI</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-16 flex justify-end">
                {hasChanged && (
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                )}
              </div>
            </div>
          );
        },
      }),
    ],
    [columnHelper, updateRoleMutation]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const pages = table.getPageCount();

  if (isError) {
    return (
      <div className="container mx-auto py-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There was an error loading the user data. Please try again later.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["users"] })
              }
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex gap-4 mb-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-1/3"
          disabled={isLoading}
        />
        <Select
          value={roleFilter}
          onValueChange={setRoleFilter}
          disabled={isLoading}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="provisional_pi">Provisional PI</SelectItem>
            <SelectItem value="full_pi">Full PI</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {(roleFilter || globalFilter) && (
          <Button variant="outline" onClick={() => {setRoleFilter(""); setGlobalFilter("")}}>
            Clear
          </Button>
        )}
        <Button
          className="cursor-pointer"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
          disabled={isLoading}
        >
          {isFetching ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      <div className="border rounded-md">
        <DataTable table={table} isLoading={isLoading} />
      </div>
      <TablePagination pagination={pagination} users={users} pages={pages} table={table} />
    </div>
  );
}
