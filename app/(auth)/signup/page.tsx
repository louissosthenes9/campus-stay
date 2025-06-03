"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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
  const totalSteps = 2;
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
      university: "",
      course: "", 
    },
    mode: "onChange"
  });

  const selectedUniversity = form.watch("university");
  
  const [campusOptions, setCampusOptions] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    if (selectedUniversity) {
      const getCampusOptions = () => {
        const campusMap: Record<string, {id: string, name: string}[]> = {
          "7": [
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };
  
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getFieldsForStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return ["first_name", "last_name", "mobile", "username", "email", "password", "confirm_password"];
      case 2: return ["university", "course"];
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
            description: "Please provide your academic information to continue.",
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
    
    const registerData: RegisterData = {
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      mobile: data.mobile,
      roles: "student",
      student_profile: {
        university: parseInt(data.university || "0", 10) || 1,
        course: data.course || "Undeclared"
      }
    };

    const success = await registerUser(registerData);
    setShowLoadingAnimation(false);
    
    if (success) {
      router.push("/");
    }
  };

  const getStepIcon = (stepNum: number) => {
    switch (stepNum) {
      case 1: return <UserCircle className="w-6 h-6" />;
      case 2: return <GraduationCap className="w-6 h-6" />;
      default: return <Check className="w-6 h-6" />;
    }
  };

  const getStepTitle = (stepNum: number) => {
    switch (stepNum) {
      case 1: return "Personal Information";
      case 2: return "Academic Details";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      {showLoadingAnimation && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-3 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <div className="text-white text-xl font-semibold">Creating your account...</div>
            <p className="text-blue-200 mt-2 text-sm">Please wait while we set up your profile</p>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-lg">
        <Card className="w-full shadow-2xl border-0 rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-8">
            <div className="flex items-center space-x-4">
              <HomeIcon className="h-10 w-10" />
              <h1 className="text-3xl font-extrabold tracking-tight">Campus Stay</h1>
            </div>
            <p className="mt-3 text-blue-100 text-sm font-medium">
              Discover your ideal student accommodation near your university
            </p>
          </div>
          
          <CardHeader className="pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600">
                  {getStepIcon(step)}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">{getStepTitle(step)}</CardTitle>
              </div>
              <div className="text-sm font-semibold bg-blue-50 text-blue-600 px-4 py-2 rounded-full">
                Step {step} of {totalSteps}
              </div>
            </div>
          </CardHeader>
          
          <div className="px-8">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              {Array.from({length: totalSteps}).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300",
                    step > i + 1 ? "bg-blue-600 text-white" : 
                    step === i + 1 ? "bg-blue-600 text-white ring-4 ring-blue-50" : 
                    "bg-gray-200 text-gray-600"
                  )}
                >
                  {step > i + 1 ? <Check className="w-5 h-5" /> : i + 1}
                </div>
              ))}
            </div>
          </div>
          
          <CardContent className="mt-8 px-8">
            {/* Show Google signup button only on step 1 and if visible */}
            {step === 1 && isGoogleBtnVisible && (
              <div className="mb-10 flex flex-col items-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Sign up with Google</h3>
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={handleGoogleSignupError}
                  useOneTap
                  theme="filled_blue"
                  size="large"
                  text="signup_with"
                  shape="pill"
                  logo_alignment="center"
                  width="300px"
                />
                <div className="w-full mt-6 flex items-center gap-4 before:content-[''] before:flex-1 before:border-t before:border-gray-200 after:content-[''] after:flex-1 after:border-t after:border-gray-200">
                  <span className="text-sm text-gray-500 font-medium">or continue with email</span>
                </div>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="John" 
                                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                                  {...field} 
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Last Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Doe" 
                                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                                  {...field} 
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="johndoe" 
                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                                {...field} 
                              />
                              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="email" 
                                placeholder="john.doe@example.com" 
                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                                {...field} 
                              />
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField 
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Mobile Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="+255 123 456 789" 
                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                                {...field} 
                              />
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="password" 
                                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                                  {...field} 
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirm_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="password" 
                                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                                  {...field} 
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Step 2: Academic Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-3">
                      <GraduationCap className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      <p className="text-gray-700 text-sm font-medium">
                        Provide your academic details to help us find the best accommodation near your campus
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">University/College</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">
                                <SelectValue placeholder="Select your university" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-gray-200">
                              {universities.map(uni => (
                                <SelectItem key={uni.id} value={uni.id} className="text-gray-700 hover:bg-blue-50">
                                  {uni.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Course/Program</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Computer Science, Business Administration" 
                              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Enter your field of study or program
                          </FormDescription>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 text-red-500">⚠️</div>
                    <div>{error}</div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-between p-8 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || loading}
              className="border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg px-6 py-2"
            >
              Back
            </Button>
            
            {step < totalSteps ? (
              <Button 
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg px-6 py-2"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg px-6 py-2"
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