import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import supabase from '../clients/supabase';
import { Tables } from '../types/db';
import TrainingStatus from './TrainingStatus';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

type User = Pick<Tables<'users'>, 'id' | 'name' | 'email'>;

export default function UserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const student_id = searchParams.get('sid');
    if (student_id) {
      (async () => {
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', student_id);

        if (supabaseError) {
          setError(supabaseError.message);
        }

        if (data) {
          setSelectedUser(data[0]);
          setSearchQuery(data[0].email);
        }
      })();
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setUsers([]);
    setSelectedUser(null);

    const url = new URL(window.location.href);
    url.searchParams.delete('sid');
    window.history.pushState({}, '', url.toString());

    try {
      if (!searchQuery.trim()) {
        setLoading(false);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('id, name, email')
        .or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        );

      if (supabaseError) {
        throw supabaseError;
      }

      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="max-w-2xl mx-auto px-4">
        <h3 className="text-2xl font-bold mb-4">User Lookup & Training Status</h3>

        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="searchQuery">Search by Name or Email</Label>
            <Input
              id="searchQuery"
              type="text"
              placeholder="Enter text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {users.length > 0 && !selectedUser && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[140px]">View Log</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          const url = new URL(window.location.href);
                          url.searchParams.set('sid', u.id.toString());
                          window.history.pushState({}, '', url.toString());
                          setSelectedUser(u);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedUser && (
        <Card className="mt-6 max-w-4xl mx-auto">
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
