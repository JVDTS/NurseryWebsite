import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Settings, Lock, UserCog, Bell, Eye } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(160).optional(),
});

const accountFormSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationFormSchema = z.object({
  nurseryUpdates: z.boolean().default(true),
  security: z.boolean().default(true),
  events: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
});

export default function AdminSettings() {
  const { user } = useAuth();
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: `${user?.firstName} ${user?.lastName}` || "",
      email: user?.email || "",
      bio: "",
    },
  });

  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      nurseryUpdates: true,
      security: true,
      events: true,
      emailNotifications: true,
    },
  });

  function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated.",
    });
  }

  function onAccountSubmit(data: z.infer<typeof accountFormSchema>) {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  }

  function onNotificationSubmit(data: z.infer<typeof notificationFormSchema>) {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Settings">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-8 text-center">Account Settings</h1>
          
          <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <UserCog className="mr-2 h-5 w-5" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                  <CardDescription>
                    Update your personal information and how it is displayed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your full name as it will appear on the platform.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <Input 
                                  type={isEmailVisible ? "text" : "password"} 
                                  placeholder="Your email address" 
                                  {...field} 
                                  className="flex-1"
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={() => setIsEmailVisible(!isEmailVisible)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormDescription>
                              Your email address for communications and login.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Input placeholder="A brief bio about yourself" {...field} />
                            </FormControl>
                            <FormDescription>
                              A brief description about yourself (optional).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Save Profile</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Lock className="mr-2 h-5 w-5" />
                    <CardTitle>Account Security</CardTitle>
                  </div>
                  <CardDescription>
                    Update your password and account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                      <FormField
                        control={accountForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter your current password to verify it's you.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Choose a strong password with at least 8 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Confirm your new password to ensure it's correct.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Update Password</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    <CardTitle>Notification Preferences</CardTitle>
                  </div>
                  <CardDescription>
                    Configure how you receive updates and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="nurseryUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Nursery Updates</FormLabel>
                              <FormDescription>
                                Receive notifications about nursery changes and updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="security"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Security Alerts</FormLabel>
                              <FormDescription>
                                Receive notifications about security events and login attempts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="events"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Events and Activities</FormLabel>
                              <FormDescription>
                                Receive notifications about upcoming events and activities
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email in addition to in-app
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Save Preferences</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}