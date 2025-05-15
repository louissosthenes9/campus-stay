"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X, MapPin, Router } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useProperty from "@/hooks/use-property";
import useAuth from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

// Amenities configuration
const amenities = [
  { id: 11, name: "Wi-Fi", description: "High-speed internet access" },
  { id: 12, name: "Parking", description: "Dedicated parking space" },
  { id: 13, name: "Swimming Pool", description: "Private or shared pool" },
  { id: 14, name: "Gym", description: "Fitness center" },
  { id: 15, name: "AC", description: "Air conditioning" },
  { id: 16, name: "Security", description: "24/7 security" },
  { id: 17, name: "Laundry", description: "Laundry facilities" },
  { id: 18, name: "Furnished", description: "Fully furnished rooms" },
  { id: 19, name: "Balcony", description: "Private balcony" },
  { id: 20, name: "Pet Friendly", description: "Pet-friendly accommodation" },
];

// Form validation schema
const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  property_type: z.enum([
    "house", "apartment", "hostel", "shared_room",
    "single_room", "master_bedroom", "self_contained", "condo"
  ]),
  price: z.number().min(1000, "Price must be at least 1000 TZS").positive(),
  bedrooms: z.number().min(0).max(20).int(),
  toilets: z.number().min(0).max(20).int(),
  address: z.string().min(5, "Address must be at least 5 characters").max(200),
  geometry: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([
        z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
        z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
      ]),
    })
    .optional(),
  size: z.number().min(10, "Size must be at least 10 sqm").positive(),
  available_from: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  lease_duration: z.number().min(1, "Lease duration must be at least 1 month").int(),
  is_furnished: z.boolean(),
  is_fenced: z.boolean(),
  windows_type: z.enum(["Aluminum", "Nyavu", "Wooden", "Glass"]),
  electricity_type: z.enum(["Submetered", "Shared", "Individual", "None"]),
  water_supply: z.boolean(),
  images: z.array(z.instanceof(File)).max(5, "Maximum 5 images allowed").optional(),
  video: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 10 * 1024 * 1024,
    "Video must be less than 10MB"
  ),
  amenity_ids: z.array(z.number()).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function PropertyPage() {
  const { createProperty } = useProperty();
  const { user } = useAuth();
  const  router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      name: "",
      description: "",
      property_type: undefined,
      price: 0,
      bedrooms: 0,
      toilets: 0,
      address: "",
      geometry: undefined,
      size: 0,
      available_from: "",
      lease_duration: 1,
      is_furnished: false,
      is_fenced: false,
      windows_type: undefined,
      electricity_type: undefined,
      water_supply: false,
      images: [],
      video: undefined,
      amenity_ids: [],
    },
  });

  // Image handling functions
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (files: File[]) => void) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return newPreviews;
      });
      onChange(files);
    },
    []
  );

  const removeImage = (index: number, field: File[]) => {
    const newFiles = [...field];
    newFiles.splice(index, 1);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return newPreviews;
    });
    return newFiles;
  };

  // Video handling functions
  const handleVideoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | undefined) => void) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error("Video must be less than 10MB");
          return;
        }
        const newPreview = URL.createObjectURL(file);
        setVideoPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return newPreview;
        });
        onChange(file);
      }
    },
    []
  );

  const removeVideo = () => {
    setVideoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    return undefined;
  };

  // Geolocation handling
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setValue("geometry", {
          type: "Point",
          coordinates: [longitude, latitude],
        });
        toast.success("Location captured successfully!");
        setIsGeolocating(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Permission denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("The request to get location timed out.");
            break;
          default:
            toast.error("An error occurred while getting location.");
        }
        setIsGeolocating(false);
      },
      { timeout: 10000 }
    );
  }, [setValue]);

  // Amenity selection
  const toggleAmenity = (amenityId: number) => {
    const currentAmenities = watch("amenity_ids") || [];
    if (currentAmenities.includes(amenityId)) {
      setValue(
        "amenity_ids",
        currentAmenities.filter((id) => id !== amenityId)
      );
    } else {
      setValue("amenity_ids", [...currentAmenities, amenityId]);
    }
  };

  // Form submission
  const onSubmit = async (data: PropertyFormData) => {
    console.log("Form data before submission:", data)
    setIsSubmitting(true);
    
    try {
      // Ensure amenity_ids is always an array
      const submitData = {
        ...data,
        amenity_ids: data.amenity_ids || []
      };

      console.log("Submitting data:", submitData);
     // const result = await createProperty(submitData);
     await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    
      let result =true
      if (result) {
        toast.success("Property submitted successfully!");
        setPreviewOpen(true);

        router.push("/dashboard/properties");

        
      } else {
        toast.error("Failed to submit property. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your property.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedData = watch();

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">List Your Property</CardTitle>
          <p className="text-muted-foreground">
            Fill in the details below to list your property for rent or sale. Required fields are marked with an asterisk (*).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Basic Details</h2>
              <Separator />
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Property Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Modern Apartment in City Center"
                    aria-invalid={!!errors.title}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Property Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Mabibo apartments"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe your property in detail..."
                    rows={5}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type">
                    Property Type <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="property_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        aria-invalid={!!errors.property_type}
                      >
                        <SelectTrigger id="property_type">
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
                    )}
                  />
                  {errors.property_type && (
                    <p className="text-sm text-destructive mt-1">{errors.property_type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="123 Main St, City"
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Location (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeolocation}
                    disabled={isGeolocating}
                    className="w-full sm:w-auto"
                  >
                    {isGeolocating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Capture Current Location
                      </>
                    )}
                  </Button>
                  {watchedData.geometry && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Coordinates: {watchedData.geometry.coordinates[1].toFixed(4)},{" "}
                      {watchedData.geometry.coordinates[0].toFixed(4)}
                    </p>
                  )}
                  {errors.geometry?.coordinates && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.geometry.coordinates.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Specifications */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Specifications</h2>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (TZS) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="Price in TZS"
                    aria-invalid={!!errors.price}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">
                    Bedrooms <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    {...register("bedrooms", { valueAsNumber: true })}
                    placeholder="Number of bedrooms"
                    aria-invalid={!!errors.bedrooms}
                  />
                  {errors.bedrooms && (
                    <p className="text-sm text-destructive mt-1">{errors.bedrooms.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toilets">
                    Toilets <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="toilets"
                    type="number"
                    {...register("toilets", { valueAsNumber: true })}
                    placeholder="Number of toilets"
                    aria-invalid={!!errors.toilets}
                  />
                  {errors.toilets && (
                    <p className="text-sm text-destructive mt-1">{errors.toilets.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">
                    Size (sqm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="size"
                    type="number"
                    {...register("size", { valueAsNumber: true })}
                    placeholder="Size in square meters"
                    aria-invalid={!!errors.size}
                  />
                  {errors.size && (
                    <p className="text-sm text-destructive mt-1">{errors.size.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease_duration">
                    Lease Duration (months) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lease_duration"
                    type="number"
                    {...register("lease_duration", { valueAsNumber: true })}
                    placeholder="Lease duration"
                    aria-invalid={!!errors.lease_duration}
                  />
                  {errors.lease_duration && (
                    <p className="text-sm text-destructive mt-1">{errors.lease_duration.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available_from">
                    Available From <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="available_from"
                    type="date"
                    {...register("available_from")}
                    aria-invalid={!!errors.available_from}
                  />
                  {errors.available_from && (
                    <p className="text-sm text-destructive mt-1">{errors.available_from.message}</p>
                  )}
                </div>
              </div>
            </div>
            {/* Features */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Features</h2>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="electricity_type">
                    Electricity Type <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="electricity_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        aria-invalid={!!errors.electricity_type}
                      >
                        <SelectTrigger id="electricity_type">
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
                    )}
                  />
                  {errors.electricity_type && (
                    <p className="text-sm text-destructive mt-1">{errors.electricity_type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="windows_type">
                    Windows Type <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="windows_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        aria-invalid={!!errors.windows_type}
                      >
                        <SelectTrigger id="windows_type">
                          <SelectValue placeholder="Select windows type" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Aluminum", "Nyavu", "Wooden", "Glass"].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.windows_type && (
                    <p className="text-sm text-destructive mt-1">{errors.windows_type.message}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="is_furnished"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="is_furnished"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="is_furnished">Furnished</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="is_fenced"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="is_fenced"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="is_fenced">Fenced Compound</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="water_supply"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="water_supply"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="water_supply">Water Supply</Label>
                </div>
              </div>
            </div>
            {/* Amenities */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Amenities</h2>
              <Separator />
              <div className="space-y-4">
                <Label>Select Available Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Button
                      key={amenity.id}
                      type="button"
                      variant={watchedData.amenity_ids?.includes(amenity.id) ? "default" : "outline"}
                      className="relative"
                      onClick={() => toggleAmenity(amenity.id)}
                    >
                      {amenity.name}
                      {watchedData.amenity_ids?.includes(amenity.id) && (
                        <X className="w-4 h-4 ml-2" />
                      )}
                    </Button>
                  ))}
                </div>
                {watchedData.amenity_ids && watchedData.amenity_ids.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {watchedData.amenity_ids
                      .map((id) => amenities.find((a) => a.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>
            {/* Media Upload */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Property Media</h2>
              <Separator />
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="images">Upload Images (max 5)</Label>
                  <Controller
                    name="images"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageChange(e, field.onChange)}
                        />
                        <Label
                          htmlFor="images"
                          className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted"
                        >
                          <Upload className="w-6 h-6 mr-2" />
                          Upload Images
                        </Label>
                      </div>
                    )}
                  />
                  {errors.images && (
                    <p className="text-sm text-destructive mt-1">{errors.images.message}</p>
                  )}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Image Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1"
                            onClick={() => {
                              const newFiles = removeImage(index, watch("images") || []);
                              control._formValues.images = newFiles;
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Video Upload */}
                <div className="space-y-2">
                  <Label htmlFor="video">Upload Video (max 10MB, optional)</Label>
                  <Controller
                    name="video"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="video"
                          type="file"
                          accept="video/mp4,video/avi,video/mov"
                          className="hidden"
                          onChange={(e) => handleVideoChange(e, field.onChange)}
                        />
                        <Label
                          htmlFor="video"
                          className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted"
                        >
                          <Upload className="w-6 h-6 mr-2" />
                          Upload Video
                        </Label>
                      </div>
                    )}
                  />
                  {errors.video && (
                    <p className="text-sm text-destructive mt-1">{errors.video.message}</p>
                  )}
                  {videoPreview && (
                    <div className="relative mt-4">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-48 rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1"
                        onClick={() => {
                          control._formValues.video = removeVideo();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setImagePreviews([]);
                  setVideoPreview(null);
                }}
              >
                Reset
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Property"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Property Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Basic Details</h3>
              <p><strong>Title:</strong> {watchedData.title}</p>
              <p><strong>Name:</strong> {watchedData.name}</p>
              <p><strong>Description:</strong> {watchedData.description}</p>
              <p><strong>Property Type:</strong> {watchedData.property_type?.replace(/_/g, " ").toUpperCase()}</p>
              <p><strong>Address:</strong> {watchedData.address}</p>
              {watchedData.geometry && (
                <p>
                  <strong>Location:</strong>{" "}
                  {watchedData.geometry.coordinates[1].toFixed(4)},{" "}
                  {watchedData.geometry.coordinates[0].toFixed(4)}
                </p>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Specifications</h3>
              <p><strong>Price:</strong> {watchedData.price.toLocaleString()} TZS</p>
              <p><strong>Bedrooms:</strong> {watchedData.bedrooms}</p>
              <p><strong>Toilets:</strong> {watchedData.toilets}</p>
              <p><strong>Size:</strong> {watchedData.size} sqm</p>
              <p><strong>Lease Duration:</strong> {watchedData.lease_duration} months</p>
              <p><strong>Available From:</strong> {watchedData.available_from}</p>
            </div>
            <div>
              <h3 className="font-semibold">Features</h3>
              <p><strong>Electricity Type:</strong> {watchedData.electricity_type}</p>
              <p><strong>Windows Type:</strong> {watchedData.windows_type}</p>
              <p><strong>Furnished:</strong> {watchedData.is_furnished ? "Yes" : "No"}</p>
              <p><strong>Fenced:</strong> {watchedData.is_fenced ? "Yes" : "No"}</p>
              <p><strong>Water Supply:</strong> {watchedData.water_supply ? "Yes" : "No"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Amenities</h3>
              {watchedData.amenity_ids && watchedData.amenity_ids.length > 0 ? (
                <ul className="list-disc list-inside">
                  {watchedData.amenity_ids.map(id => {
                    const amenity = amenities.find(a => a.id === id);
                    return amenity ? <li key={id}>{amenity.name}</li> : null;
                  })}
                </ul>
              ) : (
                <p>No amenities selected</p>
              )}
            </div>
            {imagePreviews.length > 0 && (
              <div>
                <h3 className="font-semibold">Images</h3>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Image Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            )}
            {videoPreview && (
              <div>
                <h3 className="font-semibold">Video</h3>
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-48 rounded-md"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                setPreviewOpen(false);
                reset();
                setImagePreviews([]);
                setVideoPreview(null);
              }}
            >
              Start New Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}