'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { fetchUsers, suspendUser } from '@/lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers()
            .then(setUsers)
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    const handleSuspend = async (id: string) => {
        try {
            await suspendUser(id);
            setUsers(users.map((user) => (user._id === id ? { ...user, isSuspended: true } : user)));
        } catch (error) {
            console.error('Error suspending user:', error);
        }
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-semibold text-black">Manage Users</h1>
            <Card className="bg-white shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-black">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.isSuspended ? 'Suspended' : 'Active'}</TableCell>
                                    <TableCell>
                                        {!user.isSuspended && (
                                            <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Suspend</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-600">No users available.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}