import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
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
import { Button } from "@/components/ui/button";
import { Tables } from "../../types/db";
import supabase from "../../clients/supabase";
import { updateUserRole } from "../../utility/SupabaseOperations";
import { UserRoles } from "../../types/responses";
import { toast } from "sonner";

type User = Pick<Tables<"users">, "id" | "name" | "email" | "role">;

import "@tanstack/react-table";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends unknown, TValue> {
    headerClassName?: string;
    bodyClassName?: string;
  }
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase.from("users").select("*");
      return data || [];
    },
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
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        header: "Role",
        meta: {
          headerClassName: "text-left",
        },
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
                    <SelectItem value="provisional_pi">
                      Provisional PI
                    </SelectItem>
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
  });

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error loading users!</div>;

  return (
    <div className="container mx-auto py-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.columnDef.meta?.bodyClassName}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
