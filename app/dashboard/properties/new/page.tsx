"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const defaultFormData = {
  title: "",
  name: "",
  description: "",
  property_type: "",
  price: 0,
  bedrooms: 0,
  toilets: 0,
  address: "",
  size: 0,
  available_from: "",
  lease_duration: 1,
  is_furnished: false,
  is_fenced: false,
  windows_type: "",
  electricity_type: "",
  water_supply: false,
};

export default function PropertyForm() {
  const [formData, setFormData] = useState(defaultFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleCheckboxChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast.success("Property submitted!");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">List New Property</h1>
        <p className="text-muted-foreground">
          Fill in the details below to list your property
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Details</h2>
          <Separator />
          <div>
            <label>Property Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Modern Apartment in City Center"
            />
          </div>

          <div>
            <label>Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property in detail..."
            />
          </div>

          <div>
            <label>Property Type</label>
            <Select
              onValueChange={(value) => handleSelectChange("property_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "house", "apartment", "hostel", "shared_room",
                  "single_room", "master_bedroom", "self_contained", "condo"
                ].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Specifications</h2>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price (KES)" />
            <Input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} placeholder="Bedrooms" />
            <Input name="toilets" type="number" value={formData.toilets} onChange={handleChange} placeholder="Toilets" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="lease_duration" type="number" value={formData.lease_duration} onChange={handleChange} placeholder="Lease Duration (months)" />
            <Input name="size" type="number" value={formData.size} onChange={handleChange} placeholder="Size (sqm)" />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Electricity Type</label>
              <Select
                onValueChange={(value) => handleSelectChange("electricity_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select electricity type" />
                </SelectTrigger>
                <SelectContent>
                  {["Submetered", "Shared", "Individual", "None"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label>Windows Type</label>
              <Select
                onValueChange={(value) => handleSelectChange("windows_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select windows type" />
                </SelectTrigger>
                <SelectContent>
                  {["Aluminum", "Nyavu"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.is_furnished}
                onCheckedChange={(value) => handleCheckboxChange("is_furnished", !!value)}
              />
              <label>Furnished</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.is_fenced}
                onCheckedChange={(value) => handleCheckboxChange("is_fenced", !!value)}
              />
              <label>Fenced Compound</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.water_supply}
                onCheckedChange={(value) => handleCheckboxChange("water_supply", !!value)}
              />
              <label>Water Supply</label>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto">
          Submit Property
        </Button>
      </form>
    </div>
  );
}
