"use client";

import { useEffect, useState } from "react";
import { usePropertyStore } from "@/stores/property-store";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell,
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropertyForm } from "@/components/dashboard/property-form";

export default function PropertiesPage() {
  const { properties, fetchProperties } = usePropertyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);
  
  const filteredProperties = properties.filter(
    property => 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Property Management</h1>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
              <DialogDescription>
                Fill in the details below to list a new property.
              </DialogDescription>
            </DialogHeader>
            <PropertyForm onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Search properties..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
        
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.name}</TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>
                  <Button variant="outline">Edit</Button>
                  <Button variant="destructive">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            {filteredProperties.length} properties found
          </TableCaption>
        </Table>
      </div>
    </div>
  );
}
