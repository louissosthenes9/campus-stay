"use client";
import { useState, useCallback, useEffect } from "react";
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
import { Loader2, Upload, X, MapPin, ArrowLeft, Save, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useProperty from "@/hooks/use-property";
import useAuth from "@/hooks/use-auth";
import { useRouter, useParams } from "next/navigation";
import { Property } from "@/types/properties";

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
    video: z.instanceof(File)
        .optional()
        .refine(
            (file) => !file || file.size <= 10 * 1024 * 1024,
            "Video must be less than 10MB"
        ),
    amenity_ids: z.array(z.number()).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function PropertyEditPage() {
    const {
        updateProperty,
        fetchPropertyById,
        deleteProperty,
        removeMedia,
        property,
        loading,
        error
    } = useProperty();
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [existingVideos, setExistingVideos] = useState<any[]>([]);
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [replaceMedia, setReplaceMedia] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
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

    // Load property data on mount
    useEffect(() => {
        const loadProperty = async () => {
            if (!propertyId) {
                router.push("/dashboard/properties");
                return;
            }
            setIsLoading(true);
            const propertyData = await fetchPropertyById(propertyId);
            if (propertyData) {
                const formData = {
                    title: propertyData.properties.title,
                    name: propertyData.properties.name,
                    description: propertyData.properties.description,
                    property_type: propertyData.properties.property_type as any,
                    price: propertyData.properties.price,
                    bedrooms: propertyData.properties.bedrooms,
                    toilets: propertyData.properties.toilets,
                    address: propertyData.properties.address,
                    geometry: propertyData.geometry || undefined,
                    size: propertyData.properties.size,
                    available_from: propertyData.properties.available_from,
                    lease_duration: propertyData.properties.lease_duration,
                    is_furnished: propertyData.properties.is_furnished,
                    is_fenced: propertyData.properties.is_fenced,
                    windows_type: propertyData.properties.windows_type as any,
                    electricity_type: propertyData.properties.electricity_type as any,
                    water_supply: propertyData.properties.water_supply,
                    amenity_ids: propertyData.properties.amenities || [],
                    images: [],
                    video: undefined,
                };
                setExistingImages(propertyData.images || []);
                setExistingVideos(propertyData.videos || []);
                reset(formData);
            } else {
                toast.error("Property not found");
                router.push("/dashboard/properties");
            }
            setIsLoading(false);
        };

        loadProperty();
    }, [propertyId, reset, router]);

    // Image handling
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

    const removeNewImage = (index: number, field: File[]) => {
        const newFiles = [...field];
        newFiles.splice(index, 1);
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => {
            prev.forEach((url) => URL.revokeObjectURL(url));
            return newPreviews;
        });
        return newFiles;
    };

    const removeExistingImage = async (imageId: number) => {
        const success = await removeMedia(propertyId, imageId);
        if (success) {
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
            toast.success("Image removed successfully");
        } else {
            toast.error("Failed to remove image");
        }
    };

    // Video handling
    const handleVideoChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | undefined) => void) => {
            const file = e.target.files?.[0];
            if (file) {
                const fileSizeInMB = file.size / (1024 * 1024);
                if (fileSizeInMB > 10) {
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

    const removeNewVideo = () => {
        setVideoPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        return undefined;
    };

    const removeExistingVideo = async (videoId: number) => {
        const success = await removeMedia(propertyId, videoId);
        if (success) {
            setExistingVideos(prev => prev.filter(vid => vid.id !== videoId));
            toast.success("Video removed successfully");
        } else {
            toast.error("Failed to remove video");
        }
    };

    // Geolocation
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

    // Submit handler
    const onSubmit = async (data: PropertyFormData) => {
        setIsSubmitting(true);
        try {
            const submitData = {
                ...data,
                amenity_ids: data.amenity_ids || []
            };
            const result = await updateProperty(propertyId, submitData, replaceMedia);
            if (result) {
                toast.success("Property updated successfully!");
                router.push("/dashboard/properties");
            } else {
                toast.error("Failed to update property. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred while updating your property.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete handler
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const success = await deleteProperty(propertyId);
            if (success) {
                toast.success("Property deleted successfully!");
                router.push("/dashboard/properties");
            } else {
                toast.error("Failed to delete property.");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the property.");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
            if (videoPreview) URL.revokeObjectURL(videoPreview);
        };
    }, [imagePreviews, videoPreview]);

    const watchedData = watch();

    if (isLoading) {
        return (
            <div className="container mx-auto py-12">
                <Card className="max-w-4xl mx-auto">
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        <span>Loading property...</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-12">
                <Card className="max-w-4xl mx-auto">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={() => router.push("/dashboard/properties")}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Properties
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold">Edit Property</CardTitle>
                            <p className="text-muted-foreground">
                                Update your property details. Required fields are marked with an asterisk (*).
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        property and remove all associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Delete Property"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
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
                                                Update Current Location
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {amenities.map((amenity) => (
                                    <div key={amenity.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`amenity-${amenity.id}`}
                                            checked={watch('amenity_ids')?.includes(amenity.id) || false}
                                            onCheckedChange={() => toggleAmenity(amenity.id)}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor={`amenity-${amenity.id}`} className="font-normal">
                                            {amenity.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Media */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Media</h2>
                            <Separator />
                            {/* Images */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Property Images (Max 5)</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {watch('images')?.length || 0} / 5 images
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {/* Existing Images */}
                                    {existingImages.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <img
                                                src={image.image}
                                                alt={`Property ${image.id}`}
                                                className="h-32 w-full object-cover rounded-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeExistingImage(image.id)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {/* New Images */}
                                    {watch('images')?.map((file, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={imagePreviews[index]}
                                                alt={`Preview ${index + 1}`}
                                                className="h-32 w-full object-cover rounded-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                                onClick={() => setValue('images', removeNewImage(index, watch('images') as File[]))}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {/* Add Image Button */}
                                    {(!watch('images') || (watch('images')?.length || 0) < 5) && (
                                        <div className="border-2 border-dashed rounded-md flex items-center justify-center h-32">
                                            <Label
                                                htmlFor="images"
                                                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                            >
                                                <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground text-center">
                                                    Upload Image
                                                </span>
                                                <Input
                                                    id="images"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(e) => handleImageChange(e, (files) => setValue('images', files))}
                                                    disabled={isSubmitting || (watch('images')?.length || 0) >= 5}
                                                />
                                            </Label>
                                        </div>
                                    )}
                                </div>
                                {errors.images && (
                                    <p className="text-sm text-destructive">{errors.images.message}</p>
                                )}
                            </div>
                            {/* Video */}
                            <div className="space-y-4">
                                <Label>Property Video (Optional)</Label>
                                {existingVideos.length > 0 ? (
                                    <div className="relative">
                                        <video
                                            src={existingVideos[0].video}
                                            controls
                                            className="w-full h-auto max-h-64 rounded-md"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeExistingVideo(existingVideos[0].id)}
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : watch('video') ? (
                                    <div className="relative">
                                        <video
                                            src={videoPreview || ""}
                                            controls
                                            className="w-full h-auto max-h-64 rounded-md"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => setValue('video', undefined)}
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                                        <Label
                                            htmlFor="video"
                                            className="flex flex-col items-center justify-center w-full cursor-pointer"
                                        >
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground text-center mb-2">
                                                Upload Video (Max 10MB)
                                            </span>
                                            <Input
                                                id="video"
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => handleVideoChange(e, (file) => setValue('video', file))}
                                                disabled={isSubmitting}
                                            />
                                        </Label>
                                    </div>
                                )}
                                {errors.video && (
                                    <p className="text-sm text-destructive">{errors.video.message}</p>
                                )}
                            </div>
                            {/* Replace Media Toggle */}
                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox
                                    id="replace-media"
                                    checked={replaceMedia}
                                    onCheckedChange={(checked) => setReplaceMedia(!!checked)}
                                    disabled={isSubmitting}
                                />
                                <Label htmlFor="replace-media" className="font-normal">
                                    Replace existing media (this will remove all existing images and video)
                                </Label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end pt-6 border-t">
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}