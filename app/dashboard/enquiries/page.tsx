'use client';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Mail, Phone, Clock, CheckCircle, Archive } from 'lucide-react';

// Dummy Enquiries Data
const dummyEnquiries = [
  {
    id: 1,
    property: "Canvas Oyster Bay, Dar es Salaam",
    client: "John Mwakipesile",
    message: "I'm interested in booking a room. Can I visit next week?",
    date: "2025-03-10",
    status: "new",
    phone: "+255 714 000 000",
    email: "john@example.com"
  },
  {
    id: 2,
    property: "Modern Villa in Arusha",
    client: "Amina Kassim",
    message: "Is the gym open 24/7? What about the internet speed?",
    date: "2025-03-08",
    status: "contacted",
    phone: "+255 714 000 001",
    email: "amina@example.com"
  },
  {
    id: 3,
    property: "Affordable Hostel in Mwanza",
    client: "David Nyamizi",
    message: "Do you offer monthly payment plans?",
    date: "2025-03-06",
    status: "closed",
    phone: "+255 714 000 002",
    email: "david@example.com"
  },
  {
    id: 4,
    property: "Family House in Morogoro",
    client: "Fatuma Saidi",
    message: "Can I bring my pet? Is the compound secure?",
    date: "2025-03-05",
    status: "new",
    phone: "+255 714 000 003",
    email: "fatuma@example.com"
  },
  {
    id: 5,
    property: "Commercial Office Space",
    client: "Charles Mwakila",
    message: "I need more info on the lease terms and deposit.",
    date: "2025-03-04",
    status: "contacted",
    phone: "+255 714 000 004",
    email: "charles@example.com"
  },
];

export default function EnquiryManagementPage() {
  const [enquiries, setEnquiries] = useState(dummyEnquiries);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter by status
  const filteredEnquiries = enquiries.filter((enquiry) => {
    return (
      (statusFilter === "all" || enquiry.status === statusFilter) &&
      (enquiry.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
       enquiry.property.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Update status
  const updateStatus = (id: number, newStatus: string) => {
    setEnquiries(
      enquiries.map((enq) =>
        enq.id === id ? { ...enq, status: newStatus } : enq
      )
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Property Enquiries</h1>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by property or client"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Enquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enquiry List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnquiries.length > 0 ? (
                  filteredEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">{enquiry.property}</TableCell>
                      <TableCell>{enquiry.client}</TableCell>
                      <TableCell className="max-w-xs truncate">{enquiry.message}</TableCell>
                      <TableCell>{enquiry.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enquiry.status === "new"
                              ? "default"
                              : enquiry.status === "contacted"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {enquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={enquiry.status}
                            onValueChange={(value) => updateStatus(enquiry.id, value)}
                          >
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="closed">Close</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" title="View Message">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" title="Call Client">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center text-gray-500">
                        <Archive className="h-12 w-12 mb-2 text-gray-300" />
                        <p>No enquiries found</p>
                        <p className="text-sm">Try adjusting your filters or search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary (Optional) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enquiries</p>
              <p className="text-2xl font-bold">{enquiries.length}</p>
            </div>
            <Clock className="h-8 w-8 text-indigo-600" />
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold text-green-600">
                {enquiries.filter((e) => e.status === 'new').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contacted</p>
              <p className="text-2xl font-bold text-yellow-600">
                {enquiries.filter((e) => e.status === 'contacted').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}