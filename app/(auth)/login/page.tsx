'use client';

import { Suspense, useState } from 'react'; // Import Suspense
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner"
import useAuth from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for fallback

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Extracted component that uses useSearchParams
function LoginFormComponent() {
  const { login, googleLogin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // useSearchParams is now safe here
  const [googleLoading, setGoogleLoading] = useState(false);

  // Get redirect URL from query params or default to dashboard
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data);
    
    if (success) {
      toast.success("Login successful", {     
        description: "Welcome back to CampusStay!",
      });
      router.push(redirectUrl);
    } else {
      toast.error("Login failed", {
        description: "Please check your credentials and try again.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const response = await googleLogin("GOOGLE_TOKEN_WOULD_GO_HERE");
      
      if (response.success) {
        if (response.data?.status === 'success') {
          toast.success("Login successful", {
            description: "Welcome to CampusStay!",
          });
          router.push(redirectUrl);
        } else if (response.data?.status === 'onboarding_required' || response.data?.status === 'profile_required') {
          router.push(`/onboarding?token=${response.data?.temp_token}`);
        }
      } else {
        toast.error("Login failed", {
          description: response.error || "An error occurred during login",
        });
      }
    } catch (error) {
      toast.error("Login error", {  
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Image
              src="/google.svg"
              alt="Google Logo"
              width={20}
              height={20}
              className="h-4 w-4"
            />
          )}
          Sign in with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : "Sign in"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link 
            href="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

// Loading Skeleton component for Suspense fallback
function LoginFormSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 items-center">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
             <Skeleton className="h-px w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              <Skeleton className="h-4 w-20" />
            </span>
          </div>
        </div>
        <div className="space-y-2">
           <Skeleton className="h-4 w-16" />
           <Skeleton className="h-10 w-full" />
        </div>
         <div className="space-y-2">
           <Skeleton className="h-4 w-16" />
           <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex items-center justify-end">
           <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter className="flex justify-center">
         <Skeleton className="h-4 w-48" />
      </CardFooter>
    </Card>
  );
}


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.png" 
              alt="CampusStay Logo"
              width={60}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your CampusStay account
          </p>
        </div>

        {/* Wrap the component using useSearchParams with Suspense */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginFormComponent />
        </Suspense>
      </div>
    </div>
  );
}