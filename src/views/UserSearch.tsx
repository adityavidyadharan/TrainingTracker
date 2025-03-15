import React, { useEffect, useState } from 'react';
import { Form, Button, Spinner, Alert, Table, Card, Container } from 'react-bootstrap';
import supabase from '../clients/supabase';
import { Tables } from '../types/db';
import TrainingStatus from './TrainingStatus';
import { useSearchParams } from 'react-router';

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
        )

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
    <Container>

    
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      <h3>User Lookup & Training Status</h3>

      <Form onSubmit={handleSearch} className="mb-4">
        <Form.Group controlId="searchQuery">
          <Form.Label>Search by Name or Email</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" className="mt-2" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
        </Button>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {users.length > 0 && !selectedUser && (
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th style={{ width: '140px' }}>View Log</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Button
                    variant="info"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('sid', u.id.toString());
                      window.history.pushState({}, '', url.toString());
                      setSelectedUser(u);
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      </div>

      {selectedUser && (
        <Card className="mt-4">
          <Card.Header>
            Training Status for {selectedUser.name}
          </Card.Header>
          <Card.Body>
            <TrainingStatus user_id={selectedUser.id} />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};
