'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, UserPlus, Edit, Trash2, Loader2, Filter, X } from 'lucide-react';
import useUsers, { UserFilters } from '@/hooks/use-users';
import { toast } from 'sonner';

export default function UsersPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<UserFilters>>({
    page: 1,
    page_size: 10,
    ordering: '-date_joined',
  });

  const [showFilters, setShowFilters] = useState(false);

  const { users, loading, error, deleteUser, pagination, fetchUsers } = useUsers();

  // Fetch users when filters or searchQuery change
  useEffect(() => {
    const fetchParams: Partial<UserFilters> = {
      ...filters,
      search: searchQuery || undefined,
    };

    fetchUsers(fetchParams);
  }, [filters, searchQuery, fetchUsers]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchQuery || undefined,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRoleFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      roles: value === 'all' ? undefined : (value as 'student' | 'admin'),
      page: 1,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      is_active: value === 'all' ? undefined : value === 'active',
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEditUser = (userId: number) => {
    router.push(`/dashboard/users/edit/${userId}`);
  };

  const handleCreateUser = () => {
    router.push('/dashboard/users/create');
  };

  const totalPages = Math.ceil((pagination?.count || 0) / (filters.page_size || 10));

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all users in the system</p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={filters.roles || 'all'} onValueChange={handleRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      page: 1,
                      page_size: 10,
                      ordering: '-date_joined',
                    });
                    setSearchQuery('');
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="sr-only">Loading users...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-destructive">
              Failed to load users. Please try again later.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.roles === 'admin' ? 'default' : 'secondary'}>
                            {user.roles?.charAt(0).toUpperCase() + user.roles?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.date_joined).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {(totalPages > 1 || (filters?.page || 1) > 1) && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-medium">
                      {((filters.page || 1) - 1) * (filters.page_size || 10) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(
                        (filters.page || 1) * (filters.page_size || 10),
                        pagination?.count || 0
                      )}
                    </span>{' '}
                    of <span className="font-medium">{pagination?.count || 0}</span> users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                      disabled={(filters.page || 1) <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={(filters.page || 1) >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}