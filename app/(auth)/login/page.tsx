'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner"
import useAuth from '@/hooks/use-auth';

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(8, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, googleLogin, loading, initialized, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user) {
      const redirectUrl = (() => {
        switch (user?.roles) {
          case 'admin':
            return '/staff/dashboard';
          case 'broker':
            return '/dashboard';
          default:
            return '/';
        }
      })();
      
      router.push(redirectUrl);
    }
  }, [initialized, user, router]);

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
    setIsSubmitting(true);
    
    try {
      const success = await login(data);
      
      if (success) {
        toast.success("Login successful", {     
          description: "Welcome back to CampusStay!",
        });
        // No need to redirect here - the useEffect will handle it
      } else {
        toast.error("Login failed", {
          description: "Please check your credentials and try again.",
        });
      }
    } catch (error) {
      toast.error("Login error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsSubmitting(true);
    
    try {
      // Pass the ID token to your backend
      const response = await googleLogin(credentialResponse.credential || "");
      
      if (response.success) {
        if (response.data?.status === 'success') {
          toast.success("Login successful", {
            description: "Welcome to CampusStay!",
          });
          // No need to redirect here - the useEffect will handle it
        } else if (response.data?.status === 'onboarding_required' || response.data?.status === 'profile_required') {
          // Redirect to onboarding with temp token
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
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-in failed", {
      description: "We couldn't sign you in with Google. Please try again.",
    });
  };

  // Show loading state until auth is initialized
  if (!initialized) {
    return <LoginSkeleton />;
  }


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

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full flex justify-center">
              {(loading || isSubmitting) ? (
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="center"
                />
              )}
            </div>
            
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
                        <Input type="password" placeholder="Enter your password here" {...field} />
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
                  disabled={loading || isSubmitting}
                >
                  {(loading || isSubmitting) ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Signing in...
                    </div>
                  ) : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/signup" 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
          </div>
          <div className="mt-6 h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
          <div className="mt-2 h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="space-y-1 items-center">
              <div className="h-6 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-px w-full bg-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center justify-end">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="p-4 flex justify-center">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}