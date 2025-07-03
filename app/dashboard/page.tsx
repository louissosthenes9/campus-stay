"use client";
import { Button } from "@/components/ui/button";
import { Building, Home, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell,
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useEffect } from "react";
import { toast } from "sonner";
import useProperty from "@/hooks/use-property";
import useEnquiry from "@/hooks/use-enquiry";
import useUsers from "@/hooks/use-users";

export default function DashboardPage() {
  const {properties,fetchProperties} = useProperty();
  const {enquiries,EnquiryStatus,fetchEnquiries}= useEnquiry()
  const {users,fetchUsers} = useUsers()

  useEffect(() => {
    fetchProperties();
    fetchEnquiries();
    fetchUsers();
  }, []);

 
  const totalProperties = properties?.length;
  const newProperties = properties?.filter(property => new Date(property.properties.created_at).getMonth() === new Date().getMonth()).length;
  const availableProperties =  properties?.filter(properties => properties.properties.is_available===true).length;
  const availablePercentage = totalProperties ? ((availableProperties / totalProperties) * 100).toFixed(2) : 0;
  const newEnquiries = enquiries?.filter(enquiry => new Date(enquiry.created_at).getMonth() === new Date().getMonth()).length;
  const enquiryIncreasePercentage = enquiries?.length ? ((newEnquiries / enquiries.length) * 100).toFixed(2) : 0;
  const totalStudents = users?.length;
  const recentProperties = properties?.slice(0, 5).map(property => ({
    id: property.properties.id,
    name: property.properties.name,
    type: property.properties.property_type,
  
    location: property.properties.address,
    status: property.properties.is_available,
    price: property.properties.price.toLocaleString('en-GB', { style: 'currency', currency: 'TZS' })
  }));
  const activeStudentPercentage = users.length ? ((users.filter(user => user.is_active).length / users.length) * 100).toFixed(2) : 0;
  console.log('enquiries', enquiries);
  const recentEnquiries = enquiries?.map(enquiry => ({
    id: enquiry.id,
    student: enquiry.student_details?.user.first_name || "N/A",
    property: enquiry.property_details?.properties.title || "N/A",
    mobile:enquiry.student_details?.user.mobile || "N/A",
    date: new Date(enquiry.created_at).toLocaleDateString(),
    status: enquiry.status
  }));
  console.log('Recent Properties:', recentProperties);
  console.log('Recent Enquiries:', recentEnquiries);
  console.log('Total Properties:', totalProperties);
  console.log('New Properties:', newProperties);
  console.log('Available Properties:', availableProperties);
  console.log('Available Percentage:', availablePercentage);
  console.log('New Enquiries:', newEnquiries);
  console.log('Enquiry Increase Percentage:', enquiryIncreasePercentage);
  console.log('Total Students:', totalStudents);
  console.log('Active Student Percentage:', activeStudentPercentage);
  console.log('properties',properties)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              +{newProperties ?? 0} new this month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Properties</CardTitle>
            <Home className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableProperties ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {availablePercentage ?? 0}% of total properties
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newEnquiries ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {enquiryIncreasePercentage ?? 0}% increase from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeStudentPercentage ?? 0}% currently active
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent-properties">
        <TabsList className="bg-white">
          <TabsTrigger value="recent-properties">Recent Properties</TabsTrigger>
          <TabsTrigger value="recent-enquiries">Recent Enquiries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent-properties" className="mt-4">
          <Card className="bg-white">
            <CardContent className="pt-4">
              <Table>
                <TableCaption>A list of your recent properties.</TableCaption>
                <TableHeader className="hidden md:table-header-group">
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(recentProperties ?? []).map((property, index) => (
                    <TableRow key={`property-${index}`}>
                      <TableCell className="font-medium">
                        <div className="md:hidden mb-2 font-semibold">{property.name ?? "N/A"}</div>
                        <div className="hidden md:block">{property.name ?? "N/A"}</div>
                        <div className="md:hidden text-sm text-muted-foreground">
                          {property.type ?? "N/A"} • {property.location ?? "N/A"}
                        </div>
                        <div className="md:hidden mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            property.status === true 
                              ? "bg-green-100 text-green-800" 
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            {property.status ? "Available" : "Not Available"}
                          </span>
                          <span className="ml-2 font-medium">{property.price ?? "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{property.type ?? "N/A"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{property.location ?? "N/A"}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          property.status === true 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {property.status ? "Available" : "Not Available"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">{property.price ?? "N/A"}</TableCell>
                    </TableRow>
                  ))}
                  {(!recentProperties || recentProperties.length === 0) && (
                    <TableRow key="no-properties">
                      <TableCell colSpan={5} className="text-center">No recent properties available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent-enquiries" className="mt-4">
          <Card className="bg-white">
            <CardContent className="pt-4">
              <Table>
                <TableCaption>A list of your recent enquiries.</TableCaption>
                <TableHeader className="hidden md:table-header-group">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden lg:table-cell">Mobile</TableHead>
                    <TableHead className="hidden lg:table-cell">Property</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(recentEnquiries ?? []).map((enquiry, index) => (
                    <TableRow key={`enquiry-${index}`}>
                      <TableCell className="font-medium">
                        <div className="md:hidden mb-1 font-semibold">{enquiry.student ?? "N/A"}</div>
                        <div className="hidden md:block">{enquiry.student ?? "N/A"}</div>
                        <div className="md:hidden text-sm text-muted-foreground">
                          <div>{enquiry.mobile ?? "N/A"}</div>
                          <div>{enquiry.property ?? "N/A"}</div>
                        </div>
                        <div className="md:hidden mt-1 text-sm">
                          {enquiry.date ?? "N/A"}
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            enquiry.status === EnquiryStatus.PENDING 
                              ? "bg-yellow-100 text-yellow-800" 
                              : enquiry.status === EnquiryStatus.RESOLVED
                                ? "bg-green-100 text-green-800"
                                : enquiry.status === EnquiryStatus.CANCELLED
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}>
                            {enquiry.status ?? "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <a href={`tel:${enquiry.mobile}`} className="hover:underline text-blue-600">
                          {enquiry.mobile ?? "N/A"}
                        </a>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{enquiry.property ?? "N/A"}</TableCell>
                      <TableCell className="hidden md:table-cell">{enquiry.date ?? "N/A"}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          enquiry.status === EnquiryStatus.PENDING 
                            ? "bg-yellow-100 text-yellow-800" 
                            : enquiry.status ===EnquiryStatus.RESOLVED
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}>
                          {enquiry.status ?? "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentEnquiries || recentEnquiries.length === 0) && (
                    <TableRow key="no-enquiries">
                      <TableCell colSpan={5} className="text-center">No recent enquiries available.</TableCell>
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