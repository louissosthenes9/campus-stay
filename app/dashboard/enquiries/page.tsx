'use client';

import useEnquiry, { EnquiryStatus } from '@/hooks/use-enquiry';
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
import { useEffect } from 'react';

export default function EnquiryManagementPage() {
  const {
    enquiries,
    loading,
    error,
    fetchEnquiries,
    setSearchQuery,
    updateFilters,
    updateEnquiry,
    currentPage,
    totalPages,
    canFetchNextPage,
    canFetchPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    EnquiryStatus,
  } = useEnquiry();

  // Initial fetch on mount
  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchQuery(term);
  };

  // Handle status filter change
  const handleStatusChange = (value: EnquiryStatus) => {
    updateFilters({ status: value });
  };

  // Update status of an enquiry
  const handleUpdateStatus = async (id: number, newStatus: EnquiryStatus) => {
    await updateEnquiry(id, { status: newStatus });
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
              placeholder="Search by property or student"
              className="pl-10"
              onChange={handleSearch}
            />
          </div>
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={EnquiryStatus.PENDING}>New</SelectItem>
              <SelectItem value={EnquiryStatus.IN_PROGRESS}>Contacted</SelectItem>
              <SelectItem value={EnquiryStatus.RESOLVED}>Closed</SelectItem>
              <SelectItem value={EnquiryStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Error Handling */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

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
                  <TableHead>Student</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Failed to load data.
                    </TableCell>
                  </TableRow>
                ) : enquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center text-gray-500">
                        <Archive className="h-12 w-12 mb-2 text-gray-300" />
                        <p>No enquiries found</p>
                        <p className="text-sm">Try adjusting your filters or search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">{enquiry.property_details?.properties.title || 'N/A'}</TableCell>
                      <TableCell>{enquiry.student_details?.user.first_name || 'N/A'} {enquiry.student_details?.user.last_name || ''}</TableCell>
                      <TableCell className="max-w-xs truncate">{enquiry.messages?.[0]?.content || 'No message'}</TableCell>
                      <TableCell>{new Date(enquiry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enquiry.status === EnquiryStatus.PENDING
                              ? 'default'
                              : enquiry.status === EnquiryStatus.IN_PROGRESS
                                ? 'secondary'
                                : 'outline'
                          }
                          className="capitalize"
                        >
                          {enquiry.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={enquiry.status}
                            onValueChange={(value) => handleUpdateStatus(enquiry.id, value as EnquiryStatus)}
                          >
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={EnquiryStatus.PENDING}>New</SelectItem>
                              <SelectItem value={EnquiryStatus.IN_PROGRESS}>Contacted</SelectItem>
                              <SelectItem value={EnquiryStatus.RESOLVED}>Close</SelectItem>
                              <SelectItem value={EnquiryStatus.CANCELLED}>Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" title="View Message">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" title="Call Student">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <Button
              onClick={() => fetchPreviousPage()}
              disabled={!canFetchPreviousPage}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => fetchNextPage()}
              disabled={!canFetchNextPage}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
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
                {enquiries.filter((e) => e.status === EnquiryStatus.PENDING).length}
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
                {enquiries.filter((e) => e.status === EnquiryStatus.IN_PROGRESS).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}