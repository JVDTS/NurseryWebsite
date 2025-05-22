import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Form validation schema
const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  remember: z.boolean().optional(),
});

export default function NewLogin() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, login, isLoading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Define form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        setError('Failed to establish a secure connection. Please try again.');
      }
    };

    fetchCsrfToken();
  }, []);

  // Redirect if already authenticated (only once)
  useEffect(() => {
    let isMounted = true;
    
    if (isAuthenticated && isMounted) {
      // Add a small delay to prevent race conditions
      const timer = setTimeout(() => {
        setLocation('/admin/dashboard');
      }, 100);
      
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setLocation]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    
    try {
      const success = await login(values.username, values.password, csrfToken);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to the Nursery CMS",
        });
        setLocation('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Login form */}
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">
              Nursery Management
            </CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Enter your username" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
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
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remember me</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 text-center text-sm">
              <a href="#" className="text-primary hover:underline">
                Forgot password?
              </a>
            </div>
          </CardContent>
        </Card>
        
        {/* Right side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center p-6 text-center bg-white rounded-lg">
          <img 
            src="/nursery-illustration.svg"
            alt="Nursery illustration" 
            className="w-full max-w-md mb-6" 
          />
          <h2 className="text-xl font-semibold text-primary mb-2">
            Welcome to Nursery CMS
          </h2>
          <p className="text-gray-600 mb-4">
            Manage your nursery content, events, newsletters, and gallery images from one central dashboard.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <div className="p-3 bg-primary/5 rounded-lg flex flex-col items-center">
              <span className="font-medium text-primary">Hayes</span>
              <span className="text-xs text-gray-500">Nursery</span>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg flex flex-col items-center">
              <span className="font-medium text-primary">Uxbridge</span>
              <span className="text-xs text-gray-500">Nursery</span>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg flex flex-col items-center">
              <span className="font-medium text-primary">Hounslow</span>
              <span className="text-xs text-gray-500">Nursery</span>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg flex flex-col items-center">
              <span className="font-medium text-primary">Management</span>
              <span className="text-xs text-gray-500">Portal</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Nursery Management System. All rights reserved.
      </div>
    </div>
  );
}