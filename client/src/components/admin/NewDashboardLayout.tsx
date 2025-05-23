import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth, type AdminUser } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronDown,
  Image as ImageIcon,
  BookOpen,
  Mail,
  Newspaper,
  Bell,
  User,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: location === '/admin/dashboard',
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: FileText,
      active: location.includes('/admin/content'),
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: Calendar,
      active: location.includes('/admin/events'),
    },
    {
      name: 'Media',
      href: '/admin/media',
      icon: ImageIcon,
      active: location.includes('/admin/media'),
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      active: location.includes('/admin/users'),
      show: user?.role === 'super_admin', // Only show for super admins
    },
    {
      name: 'Activity Logs',
      href: '/admin/activity',
      icon: BarChart,
      active: location.includes('/admin/activity'),
      show: user?.role === 'super_admin', // Only show for super admins
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      active: location.includes('/admin/settings'),
    },
  ];

  // Filter out nav items based on user role
  const filteredNavItems = navItems.filter(item => !item.hasOwnProperty('show') || item.show);

  return (
    <div className={cn("flex flex-col h-full border-r bg-white", className)}>
      {/* Logo area */}
      <div className="flex items-center h-16 px-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <span className="font-semibold text-xl">Nursery CMS</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {filteredNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:text-foreground my-1 mx-2",
                "transition-colors",
                "hover:bg-gray-100",
                item.active && "bg-primary/10 text-primary hover:bg-primary/10 font-medium"
              )}
            >
              <item.icon className={cn("h-4 w-4", item.active && "text-primary")} />
              <span>{item.name}</span>
              {item.active && (
                <div className="ml-auto w-1 h-5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User area */}
      <div className="mt-auto p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-start gap-2 px-2">
              <Avatar className="h-8 w-8">
                {user?.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={user?.firstName || 'User'} />
                ) : (
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || 'U'}
                    {user?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'super_admin' ? 'Administrator' : 
                   user?.role === 'admin' ? 'Nursery Manager' : 
                   user?.role === 'editor' ? 'Content Editor' : 'User'}
                </p>
              </div>
              <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout && logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface DashboardHeaderProps {
  user: AdminUser | null;
}

function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuth();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 sm:max-w-xs">
          <SheetHeader className="px-1">
            <SheetTitle>Nursery CMS</SheetTitle>
            <SheetDescription>
              Content Management System
            </SheetDescription>
          </SheetHeader>
          <Sidebar className="border-0" />
        </SheetContent>
      </Sheet>
      
      {/* Nursery selector */}
      <div className="flex-1 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hidden sm:flex">
              <span>All Nurseries</span>
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>All Nurseries</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Hayes</DropdownMenuItem>
            <DropdownMenuItem>Uxbridge</DropdownMenuItem>
            <DropdownMenuItem>Hounslow</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Header actions */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <div className="flex items-start gap-4 p-3 hover:bg-gray-50">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">New contact form submission</p>
                  <p className="text-xs text-muted-foreground">
                    From: parent@example.com
                  </p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 hover:bg-gray-50">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Event reminder: Parent-Teacher Conference</p>
                  <p className="text-xs text-muted-foreground">
                    Tomorrow at 10:00 AM
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>

            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center text-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                {user?.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={user?.firstName || 'User'} />
                ) : (
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || 'U'}
                    {user?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout && logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface NewDashboardLayoutProps {
  children: React.ReactNode;
}

export default function NewDashboardLayout({ children }: NewDashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}