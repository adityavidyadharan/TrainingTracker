// src/components/UserManagementPage.tsx

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Table, Form, Button, Container } from 'react-bootstrap';
import { Tables } from '../../types/db';
import supabase from '../../clients/supabase';
import { updateUserRole } from '../../utility/SupabaseOperations';
import { UserRoles } from '../../types/responses';

type User = Pick<Tables<"users">, "id" | "name" | "email" | "role">;

export default function UserManagementPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('*');
      return data || [];
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string, newRole: UserRoles }) => updateUserRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })

  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        header: 'Role',
        cell: ({ row }) => {
          const user = row.original;
          const [tempRole, setTempRole] = useState(user.role);

          const hasChanged = tempRole !== user.role;

          const handleSave = () => {
            updateRoleMutation.mutate({
              userId: user.id,
              newRole: tempRole,
            });
          };

          return (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Form.Select
                size="sm"
                value={tempRole}
                onChange={(e) => setTempRole(e.target.value as UserRoles)}
                style={{ width: 'auto' }}
              >
                <option value="user">User</option>
                <option value="provisional_pi">Provisional PI</option>
                <option value="full_pi">Full PI</option>
                <option value="admin">Admin</option>
              </Form.Select>
              {hasChanged && (
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Save
                </Button>
              )}
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
    <Container>
    <Table striped bordered hover>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
    </Container>
  );
}
