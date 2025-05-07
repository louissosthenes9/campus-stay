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
import { useStatsStore } from "@/stores/stats-store";

export default function DashboardPage() {
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
    fetchStats 
  } = useStatsStore();
  
  useEffect(() => {
    fetchStats();
    toast.success("Welcome to your dashboard!");
  }, [fetchStats]);

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
                  {(recentProperties ?? []).map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.name ?? "N/A"}</TableCell>
                      <TableCell>{property.type ?? "N/A"}</TableCell>
                      <TableCell>{property.location ?? "N/A"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          property.status === "Available" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {property.status ?? "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{property.price ?? "N/A"}</TableCell>
                    </TableRow>
                  ))}
                  {(!recentProperties || recentProperties.length === 0) && (
                    <TableRow>
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
                  {(recentEnquiries ?? []).map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">{enquiry.student ?? "N/A"}</TableCell>
                      <TableCell>{enquiry.property ?? "N/A"}</TableCell>
                      <TableCell>{enquiry.date ?? "N/A"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          enquiry.status === "Pending" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : enquiry.status === "Responded"
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
                    <TableRow>
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