import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

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
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

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
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="provisional_pi">Provisional PI</SelectItem>
            <SelectItem value="full_pi">Full PI</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button
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
        <Table>
          <TableHeader>
            {isLoading ? (
              <TableRow>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
              </TableRow>
            ) : (
              table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`cursor-pointer ${
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === "asc"
                            ? "text-blue-500"
                            : "text-red-500"
                          : ""
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </TableHead>
                  ))}
                </TableRow>
              ))
            )}
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-9 w-40" />
                          <Skeleton className="h-9 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              : table
                  .getRowModel()
                  .rows.filter((row) =>
                    roleFilter ? row.original.role === roleFilter : true
                  )
                  .map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            {!isLoading &&
              table
                .getRowModel()
                .rows.filter((row) =>
                  roleFilter ? row.original.role === roleFilter : true
                ).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
