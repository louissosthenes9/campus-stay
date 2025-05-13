'use client';

import { Button } from '@/components/ui/button';
import { Building, Home, MessageSquare, Users, AlertCircle, School, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useStatsStore } from '@/stores/stats-store';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Dummy data
const dummyUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Broker', status: 'Active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Student', status: 'Suspended' },
];

const dummyListings = [
    { id: '1', name: 'Cozy Apartment', type: 'Apartment', location: 'Downtown', price: '$500', status: 'Available' },
    { id: '2', name: 'Student Dorm', type: 'Dorm', location: 'Campus', price: '$300', status: 'Occupied' },
];

const dummyComplaints = [
    {
        id: '1',
        complainant: 'John Doe',
        respondent: 'Jane Smith',
        property: 'Cozy Apartment',
        issue: 'Unresponsive broker',
        status: 'Pending',
        resolution: '',
    },
    {
        id: '2',
        complainant: 'Bob Johnson',
        respondent: 'Jane Smith',
        property: 'Student Dorm',
        issue: 'Hidden fees',
        status: 'Resolved',
        resolution: 'Refund issued',
    },
];

const dummyEnquiries = [
    {
        id: '1',
        student: 'John Doe',
        property: 'Cozy Apartment',
        date: '2025-05-01',
        status: 'Pending',
    },
    {
        id: '2',
        student: 'Bob Johnson',
        property: 'Student Dorm',
        date: '2025-05-02',
        status: 'Responded',
    },
];

const dummyAmenities = [
    { id: '1', name: 'Wi-Fi', description: 'High-speed internet access' },
    { id: '2', name: 'Laundry', description: 'On-site washing machines' },
    { id: '3', name: 'Gym', description: 'Fitness center with equipment' },
];

export default function AdminDashboardPage() {
    const {
        totalProperties,
        newProperties,
        availableProperties,
        availablePercentage,
        newEnquiries,
        enquiryIncreasePercentage,
        totalStudents,
        activeStudentPercentage,
        recentProperties,
        recentEnquiries,
        fetchStats,
    } = useStatsStore();

    // Local state for forms
    const [universityForm, setUniversityForm] = useState({ name: '', city: '', country: '' });
    const [complaintForm, setComplaintForm] = useState({ id: '', status: '', resolution: '' });
    const [amenityForm, setAmenityForm] = useState({ name: '', description: '' });
    const [universities, setUniversities] = useState<{ id: string; name: string; city: string; country: string }[]>([]);
    const [amenities, setAmenities] = useState<{ id: string; name: string; description: string }[]>(dummyAmenities);

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchStats();
                toast.success('Welcome to your admin dashboard!', { position: 'top-right' });
            } catch (error) {
                console.error('Error loading admin dashboard data:', error);
                toast.error('Failed to load admin dashboard data.', { position: 'top-right' });
            }
        };
        loadData();
    }, [fetchStats]);

    const handleSuspendUser = (userId: string) => {
        toast.success(`User ${userId} suspended for fraud.`, { position: 'top-right' });
        // In a real app, update user status in the backend
    };

    const handleComplaintSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(`Complaint ${complaintForm.id} updated.`, { position: 'top-right' });
        // In a real app, update complaint in the backend
        setComplaintForm({ id: '', status: '', resolution: '' });
    };

    const handleUniversitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUniversity = {
            id: Math.random().toString(),
            ...universityForm,
        };
        setUniversities([...universities, newUniversity]);
        toast.success('University added successfully!', { position: 'top-right' });
        setUniversityForm({ name: '', city: '', country: '' });
    };

    const handleAmenitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAmenity = {
            id: Math.random().toString(),
            ...amenityForm,
        };
        setAmenities([...amenities, newAmenity]);
        toast.success('Amenity added successfully!', { position: 'top-right' });
        setAmenityForm({ name: '', description: '' });
    };

    const handleDeleteAmenity = (amenityId: string) => {
        setAmenities(amenities.filter((amenity) => amenity.id !== amenityId));
        toast.success(`Amenity ${amenityId} deleted.`, { position: 'top-right' });
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-semibold text-black">Admin Dashboard</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Admin Dashboard Statistics">
                <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-black">Total Properties</CardTitle>
                        <Building className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProperties ?? 2}</div>
                        <p className="text-xs text-gray-600">+{newProperties ?? 1} new this month</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-black">Available Properties</CardTitle>
                        <Home className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableProperties ?? 1}</div>
                        <p className="text-xs text-gray-600">{availablePercentage ?? 50}% of total properties</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-black">New Enquiries</CardTitle>
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newEnquiries ?? 2}</div>
                        <p className="text-xs text-gray-600">{enquiryIncreasePercentage ?? 10}% increase from last month</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-black">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents ?? 3}</div>
                        <p className="text-xs text-gray-600">{activeStudentPercentage ?? 66}% currently active</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="bg-white shadow-md flex flex-wrap">
                    <TabsTrigger value="users" className="text-black data-[state=active]:text-indigo-600">Users</TabsTrigger>
                    <TabsTrigger value="listings" className="text-black data-[state=active]:text-indigo-600">Listings</TabsTrigger>
                    <TabsTrigger value="complaints" className="text-black data-[state=active]:text-indigo-600">Complaints</TabsTrigger>
                    <TabsTrigger value="enquiries" className="text-black data-[state=active]:text-indigo-600">Enquiries</TabsTrigger>
                    <TabsTrigger value="universities" className="text-black data-[state=active]:text-indigo-600">Universities</TabsTrigger>
                    <TabsTrigger value="amenities" className="text-black data-[state=active]:text-indigo-600">Amenities</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-4">
                    <Card className="bg-white shadow-md">
                        <CardContent className="pt-4">
                            <Table>
                                <TableCaption>A list of all users.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dummyUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {user.status}
                        </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.status === 'Active' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => handleSuspendUser(user.id)}
                                                        aria-label={`Suspend user ${user.name}`}
                                                    >
                                                        Suspend
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="listings" className="mt-4">
                    <Card className="bg-white shadow-md">
                        <CardContent className="pt-4">
                            <Table>
                                <TableCaption>A list of all property listings.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(recentProperties ?? dummyListings).map((property) => (
                                        <TableRow key={property.id}>
                                            <TableCell className="font-medium">{property.name}</TableCell>
                                            <TableCell>{property.type}</TableCell>
                                            <TableCell>{property.location}</TableCell>
                                            <TableCell>
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                property.status === 'Available'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                            }`}
                        >
                          {property.status}
                        </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                                                    Number(property.price.replace('$', '')),
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="complaints" className="mt-4">
                    <Card className="bg-white shadow-md">
                        <CardContent className="pt-4">
                            <Table>
                                <TableCaption>A list of all complaints.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Complainant</TableHead>
                                        <TableHead>Respondent</TableHead>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Issue</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dummyComplaints.map((complaint) => (
                                        <TableRow key={complaint.id}>
                                            <TableCell className="font-medium">{complaint.complainant}</TableCell>
                                            <TableCell>{complaint.respondent}</TableCell>
                                            <TableCell>{complaint.property}</TableCell>
                                            <TableCell>{complaint.issue}</TableCell>
                                            <TableCell>
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                complaint.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {complaint.status}
                        </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                    onClick={() =>
                                                        setComplaintForm({
                                                            id: complaint.id,
                                                            status: complaint.status,
                                                            resolution: complaint.resolution,
                                                        })
                                                    }
                                                    aria-label={`Resolve complaint ${complaint.id}`}
                                                >
                                                    Resolve
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {complaintForm.id && (
                                <div className="mt-6">
                                    <h2 className="text-lg font-semibold text-black">Resolve Complaint</h2>
                                    <form onSubmit={handleComplaintSubmit} className="space-y-4 mt-4">
                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <select
                                                id="status"
                                                value={complaintForm.status}
                                                onChange={(e) => setComplaintForm({ ...complaintForm, status: e.target.value })}
                                                className="w-full border rounded-md p-2"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="resolution">Resolution Notes</Label>
                                            <Textarea
                                                id="resolution"
                                                value={complaintForm.resolution}
                                                onChange={(e) => setComplaintForm({ ...complaintForm, resolution: e.target.value })}
                                                placeholder="Enter resolution details"
                                            />
                                        </div>
                                        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                            Submit Resolution
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="enquiries" className="mt-4">
                    <Card className="bg-white shadow-md">
                        <CardContent className="pt-4">
                            <Table>
                                <TableCaption>A list of recent enquiries.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(recentEnquiries ?? dummyEnquiries).map((enquiry) => (
                                        <TableRow key={enquiry.id}>
                                            <TableCell className="font-medium">{enquiry.student}</TableCell>
                                            <TableCell>{enquiry.property}</TableCell>
                                            <TableCell>{new Date(enquiry.date).toLocaleDateString('en-US')}</TableCell>
                                            <TableCell>
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                enquiry.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : enquiry.status === 'Responded'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {enquiry.status}
                        </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/enquiries/${enquiry.id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                        aria-label={`View enquiry ${enquiry.id}`}
                                                    >
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="universities" className="mt-4">
                    <Card className="bg-white shadow-md">
                        <CardContent className="pt-4">
                            <h2 className="text-lg font-semibold text-black mb-4">Add University</h2>
                            <form onSubmit={handleUniversitySubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">University Name</Label>
                                    <Input
                                        id="name"
                                        value={universityForm.name}
                                        onChange={(e) => setUniversityForm({ ...universityForm, name: e.target.value })}
                                        placeholder="Enter university name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={universityForm.city}
                                        onChange={(e) => setUniversityForm({ ...universityForm, city: e.target.value })}
                                        placeholder="Enter city"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={universityForm.country}
                                        onChange={(e) => setUniversityForm({ ...universityForm, country: e.target.value })}
                                        placeholder="Enter country"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                    Add University
                                </Button>
                            </form>

                            <Table className="mt-6">
                                <TableCaption>A list of registered universities.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>City</TableHead>
                                        <TableHead>Country</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {universities.length > 0 ? (
                                        universities.map((university) => (
                                            <TableRow key={university.id}>
                                                <TableCell className="font-medium">{university.name}</TableCell>
                                                <TableCell>{university.city}</TableCell>
                                                <TableCell>{university.country}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-gray-600">
                                                No universities added yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="amenities" className="mt-4">
                    <Card className="bg-white shadow-md">
                        <CardContent className="pt-4">
                            <h2 className="text-lg font-semibold text-black mb-4">Add Amenity</h2>
                            <form onSubmit={handleAmenitySubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="amenity-name">Amenity Name</Label>
                                    <Input
                                        id="amenity-name"
                                        value={amenityForm.name}
                                        onChange={(e) => setAmenityForm({ ...amenityForm, name: e.target.value })}
                                        placeholder="Enter amenity name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="amenity-description">Description</Label>
                                    <Textarea
                                        id="amenity-description"
                                        value={amenityForm.description}
                                        onChange={(e) => setAmenityForm({ ...amenityForm, description: e.target.value })}
                                        placeholder="Enter amenity description"
                                    />
                                </div>
                                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                    Add Amenity
                                </Button>
                            </form>

                            <Table className="mt-6">
                                <TableCaption>A list of available amenities.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {amenities.length > 0 ? (
                                        amenities.map((amenity) => (
                                            <TableRow key={amenity.id}>
                                                <TableCell className="font-medium">{amenity.name}</TableCell>
                                                <TableCell>{amenity.description}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => handleDeleteAmenity(amenity.id)}
                                                        aria-label={`Delete amenity ${amenity.name}`}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-gray-600">
                                                No amenities added yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}