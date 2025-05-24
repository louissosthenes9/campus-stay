"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { set, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import * as z from "zod"
import { 
  Check, ChevronRight, ChevronsRight, User, 
  Loader2, HomeIcon, Mail, Lock, UserCircle, GraduationCap, Phone
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import useAuth from "@/hooks/use-auth"

// Universities data
const universities = [
  { id: "1", name: "University of Dar es Salaam" },
  { id: "2", name: "Dar es Salaam Institute of Technology" },
  { id: "3", name: "Mzumbe University" },
  { id: "4", name: "Institute of Finance Management" },
  { id: "5", name: "Muhimbili University of Health and Allied Sciences" },
  { id:"6", name: "Sokoine University of Agriculture" },
  { id: "7", name: "University of California, Berkeley" }
];

// Form schema for validation
const formSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  roles: z.enum(["student", "admin"]),
  // Student specific fields
  university: z.string().optional(),
  course: z.string().optional(),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof formSchema>;

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  mobile: string;
  roles: "student" | "admin";
  student_profile?: {
    university: number | undefined;
    course: string | undefined;
  };
}

export default function Page() {
  const [step, setStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(3);
  const [isGoogleBtnVisible, setIsGoogleBtnVisible] = useState(true);
  const { register: registerUser, loading, error, googleLogin } = useAuth();
  const router = useRouter();
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [googleOnboardingData, setGoogleOnboardingData] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      mobile: "",
      confirm_password: "",
      roles: "student",
      university: "",
      course: "", 
    },
    mode: "onChange"
  });

  const userType = form.watch("roles");
  const selectedUniversity = form.watch("university");
  
  const [campusOptions, setCampusOptions] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    if (selectedUniversity) {
      const getCampusOptions = () => {
        const campusMap: Record<string, {id: string, name: string}[]> = {
          "harvard": [
            { id: "harvard-main", name: "Cambridge Main Campus" },
            { id: "harvard-medical", name: "Longwood Medical Area" }
          ]
        };
        return campusMap[selectedUniversity] || [];
      };
      setCampusOptions(getCampusOptions());
    } else {
      setCampusOptions([]);
    }
  }, [selectedUniversity]);

  const nextStep = () => {
    const currentFields = getFieldsForStep(step);
    form.trigger(currentFields as any).then(isValid => {
      if (isValid) {
        setStep(prev => Math.min(prev + 1, totalSteps));
        window.scrollTo(0, 0);
      }
    });
  };
  
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };
  
  const getFieldsForStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return ["roles"];
      case 2: return ["first_name", "last_name", "mobile", "username", "email", "password", "confirm_password"];
      case 3: return ["university", "course"];
      default: return [];
    }
  };
  
  const handleGoogleSignupSuccess = async (credentialResponse: CredentialResponse) => {
    setShowLoadingAnimation(true);
    try {
      const response = await googleLogin(credentialResponse.credential || "");
      
      if (response.success) {
        if (response.data?.status === 'success') {
          toast.success("Google login successful", {
            description: "Welcome to CampusStay!",
          });
          router.push("/dashboard");
        } else if (response.data?.status === 'onboarding_required') {
          setGoogleOnboardingData({
            temp_token: response.data?.temp_token,
            email: response.data?.email,
            first_name: response.data?.first_name,
            last_name: response.data?.last_name,
            google_id: response.data?.google_id
          });
          
          if (response.data?.email) form.setValue("email", response.data.email);
          if (response.data?.first_name) form.setValue("first_name", response.data.first_name);
          if (response.data?.last_name) form.setValue("last_name", response.data.last_name);
          
          setIsGoogleBtnVisible(false);
          setStep(1);
          toast.info("Complete your registration", {
            description: "Please select your role and complete the remaining information.",
          });
        }
      } else {
        toast.error("Google signup failed", {
          description: response.error || "An error occurred during signup",
        });
      }
    } catch (error) {
      toast.error("Signup error", {  
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setShowLoadingAnimation(false);
    }
  };

  const handleGoogleSignupError = () => {
    toast.error("Google Sign-up failed", {
      description: "We couldn't sign you up with Google. Please try again or use regular signup.",
    });
  };

  const onSubmit = async (data: FormData) => {
    if (step < totalSteps) return;
    
    setShowLoadingAnimation(true);
    const userTypeForApi = data.roles;
    
    const registerData: RegisterData = {
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      mobile: data.mobile,
      roles: userTypeForApi as "student" | "admin",
    };
    
    if (data.roles === "student") {
      registerData.student_profile = {
        university: parseInt(data.university || "0", 10) || 1,
        course: data.course || "Undeclared"
      };
    }

    const success = await registerUser(registerData);
    setShowLoadingAnimation(false);
    
    if (success) {
      router.push("/");
    }
  };

  const getStepIcon = (stepNum: number) => {
    switch (stepNum) {
      case 1: return <GraduationCap className="w-6 h-6" />;
      case 2: return <UserCircle className="w-6 h-6" />;
      case 3: return <GraduationCap className="w-6 h-6" />;
      default: return <Check className="w-6 h-6" />;
    }
  };

  const getStepTitle = (stepNum: number) => {
    switch (stepNum) {
      case 1: return "Select Your Role";
      case 2: return "Personal Information";
      case 3: return "Academic Details";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-10 px-4">
      {showLoadingAnimation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-3 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin animation-delay-150"></div>
              <div className="absolute inset-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin animation-delay-300"></div>
            </div>
            <div className="text-white text-xl font-medium">Creating your account...</div>
            <p className="text-blue-200 mt-2">Please wait while we set up your profile</p>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl">
        <Card className="w-full shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center space-x-3">
              <HomeIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Campus Stay</h1>
            </div>
            <p className="mt-2 text-blue-100">Find your perfect accommodation near your university</p>
          </div>
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700">
                  {getStepIcon(step)}
                </div>
                <CardTitle className="text-xl">{getStepTitle(step)}</CardTitle>
              </div>
              <div className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                Step {step} of {totalSteps}
              </div>
            </div>
          </CardHeader>
          
          <div className="px-6">
            <div className="relative h-2 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between mt-2">
              {Array.from({length: totalSteps}).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-300",
                    step > i + 1 ? "bg-blue-600 text-white" : 
                    step === i + 1 ? "bg-blue-600 text-white ring-4 ring-blue-100" : 
                    "bg-blue-100 text-blue-600"
                  )}
                >
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
              ))}
            </div>
          </div>
          
          <CardContent className="mt-6 px-8">
            {/* Show Google signup button only on step 1 and if visible */}
            {step === 1 && isGoogleBtnVisible && (
              <div className="mb-8 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-4 text-gray-700">Sign up faster with Google</h3>
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={handleGoogleSignupError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  logo_alignment="center"
                />
                <div className="w-full mt-6 flex items-center gap-4 before:content-[''] before:flex-1 before:border-t before:border-gray-200 after:content-[''] after:flex-1 after:border-t after:border-gray-200">
                  <span className="text-sm text-gray-500">or continue with email</span>
                </div>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Select Role */}
                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="roles"
                      render={({ field }) => (
                        <FormItem className="space-y-5">
                          <FormLabel className="text-blue-700 text-lg">I am joining Campus Stay as...</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                              <Label
                                htmlFor="student"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-xl border-2 p-6 cursor-pointer transition-all duration-200",
                                  field.value === "student" 
                                    ? "border-blue-600 bg-blue-50 shadow-md" 
                                    : "border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                                )}
                              >
                                <RadioGroupItem value="student" id="student" className="sr-only" />
                                <div className="mb-4 p-3 bg-blue-100 rounded-full">
                                  <GraduationCap className="h-10 w-10 text-blue-600" />
                                </div>
                                <div className="text-center">
                                  <p className="font-bold text-lg text-blue-800">Student</p>
                                  <p className="text-blue-600 mt-2">
                                    I'm looking for accommodation near my university or college
                                  </p>
                                </div>
                                <div className={cn(
                                  "mt-4 w-full py-2 text-center rounded-lg transition-colors",
                                  field.value === "student" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-blue-100 text-blue-600"
                                )}>
                                  {field.value === "student" ? "Selected" : "Select"}
                                </div>
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Step 2: Personal Information */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="John" 
                                  className="pl-10 border-blue-200 focus:border-blue-400" 
                                  {...field} 
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">Last Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Doe" 
                                  className="pl-10 border-blue-200 focus:border-blue-400" 
                                  {...field} 
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="johndoe" 
                                className="pl-10 border-blue-200 focus:border-blue-400" 
                                {...field} 
                              />
                              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="email" 
                                placeholder="john.doe@example.com" 
                                className="pl-10 border-blue-200 focus:border-blue-400" 
                                {...field} 
                              />
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField 
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">Mobile Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="+255 123 456 789" 
                                className="pl-10 border-blue-200 focus:border-blue-400" 
                                {...field} 
                              />
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="password" 
                                  className="pl-10 border-blue-200 focus:border-blue-400" 
                                  {...field} 
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirm_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="password" 
                                  className="pl-10 border-blue-200 focus:border-blue-400" 
                                  {...field} 
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Step 3: Student Details */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-3 mb-6">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                      <p className="text-blue-700">Complete your academic profile to find the perfect accommodation near your campus</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">University/College</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-blue-200">
                                <SelectValue placeholder="Select your university" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {universities.map(uni => (
                                <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-700">Course/Program</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Computer Science, Business Administration" 
                              className="border-blue-200 focus:border-blue-400" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-blue-600">
                            Enter your field of study or program
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center space-x-2">
                    <div className="flex-shrink-0 w-5 h-5 text-red-500">⚠️</div>
                    <div>{error}</div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-between p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || loading}
              className="border-blue-300 hover:bg-blue-100 text-blue-700"
            >
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button 
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 h-auto"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 h-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ChevronsRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}