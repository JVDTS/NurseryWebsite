import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchCsrfToken } from '@/lib/csrf';
import { useToast } from '@/hooks/use-toast';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, LogIn } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, { message: "Email address is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function NewLogin() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const { toast } = useToast();

  // Create form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: true,
    },
  });

  // Fetch CSRF token on component mount
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        setTokenLoading(true);
        const token = await fetchCsrfToken();
        setCsrfToken(token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        toast({
          title: 'Authentication Error',
          description: 'Could not initialize secure login. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setTokenLoading(false);
      }
    };

    getCsrfToken();
  }, [toast]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/admin/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsSubmitting(true);
      
      // Get a fresh CSRF token right before login attempt
      const freshToken = await fetchCsrfToken();
      
      if (!freshToken) {
        toast({
          title: 'Authentication Error',
          description: 'Security token missing. Please refresh the page.',
          variant: 'destructive',
        });
        return;
      }
      
      // Update the token state
      setCsrfToken(freshToken);
      
      // Use the fresh token for login
      const success = await login(data.username, data.password, freshToken);
      
      if (success) {
        setLocation('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'There was a problem logging in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/10 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Nursery Network CMS</h1>
            <p className="mt-3 text-gray-600">
              Manage content for all nursery locations from one central dashboard
            </p>
          </div>
          <div className="mt-8">
            <img 
              src="/nursery-illustration.svg" 
              alt="Nursery Illustration" 
              className="max-w-full h-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="mt-8 space-y-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="rounded-full bg-primary/20 p-1">
                <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">Manage multiple nursery locations</div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-primary/20 p-1">
                <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">Upload newsletters and gallery images</div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-primary/20 p-1">
                <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">Schedule events and manage staff</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>

          <div className="mt-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@nurseries.com" 
                          type="email"
                          autoComplete="email"
                          disabled={isSubmitting}
                          {...field} 
                        />
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-primary hover:text-primary/90">
                            Forgot password?
                          </a>
                        </div>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          autoComplete="current-password"
                          disabled={isSubmitting}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Remember me for 30 days</FormLabel>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-10" 
                  disabled={isSubmitting || tokenLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo credentials</span>
              </div>
            </div>

            <div className="mt-6 grid gap-2">
              <div className="text-xs border rounded-md p-3 bg-gray-50">
                <p><strong>Super Admin:</strong> admin@nurseries.com / admin123</p>
                <p><strong>Hayes Manager:</strong> hayes@nurseries.com / hayes123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}