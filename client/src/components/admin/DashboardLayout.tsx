import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, LogOut, Users, Newspaper, Image, 
  Calendar, Settings, ChevronDown, Menu, X, 
  Home as HomeIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import NurserySelector from './NurserySelector';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  // Get user's initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Get user's nursery name
  const getNurseryName = () => {
    if (!user?.nurseryId) return 'Super Admin';
    
    switch(user.nurseryId) {
      case 1: return 'Hayes Nursery';
      case 2: return 'Uxbridge Nursery';
      case 3: return 'Hounslow Nursery';
      default: return 'Unknown Nursery';
    }
  };

  // Determine which navigation items to show based on user role
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: location === '/admin/dashboard',
      show: true,
    },
    {
      name: 'Events',
      href: user?.role === 'super_admin' 
        ? '/admin/events' 
        : `/admin/nurseries/${user?.nurseryId}/events`,
      icon: Calendar,
      active: location.includes('/events'),
      show: true,
    },
    {
      name: 'Gallery',
      href: user?.role === 'super_admin' 
        ? '/admin/gallery' 
        : `/admin/nurseries/${user?.nurseryId}/gallery`,
      icon: Image,
      active: location.includes('/gallery'),
      show: true,
    },
    {
      name: 'Newsletters',
      href: user?.role === 'super_admin' 
        ? '/admin/newsletters' 
        : `/admin/nurseries/${user?.nurseryId}/newsletters`,
      icon: Newspaper,
      active: location.includes('/newsletters'),
      show: true,
    },
    {
      name: 'Staff',
      href: '/admin/staff',
      icon: Users,
      active: location === '/admin/staff',
      show: user?.role === 'super_admin' || user?.role === 'nursery_admin',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      active: location === '/admin/settings',
      show: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shadow-md bg-white">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">CMC Nursery</span>
          </Link>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.filter(item => item.show).map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      item.active ? "text-primary" : "text-gray-400"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            ))}
            
            <Link href="/">
              <a className="flex items-center px-2 py-2 mt-6 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 group">
                <HomeIcon className="w-5 h-5 mr-3 text-gray-400" />
                Back to Website
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-gray-500">{getNurseryName()}</span>
                </div>
                <ChevronDown className="w-4 h-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">
                  <a className="cursor-pointer">Profile Settings</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header & Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className="flex flex-col flex-1 md:pl-64">
          <div className="sticky top-0 z-10 flex px-4 py-2 bg-white shadow-sm md:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <div className="flex items-center justify-center flex-1">
              <Link href="/" className="flex items-center">
                <span className="text-lg font-semibold text-primary">CMC Nursery</span>
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.firstName} {user?.lastName}
                  <p className="text-xs font-normal text-gray-500">{getNurseryName()}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <a className="cursor-pointer">Profile Settings</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SheetContent side="left" className="p-0 w-64">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-semibold text-primary">CMC Nursery</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="px-2 py-4 space-y-1">
              {navigationItems.filter(item => item.show).map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        item.active ? "text-primary" : "text-gray-400"
                      )}
                    />
                    {item.name}
                  </a>
                </Link>
              ))}
              
              <Link href="/">
                <a 
                  className="flex items-center px-2 py-2 mt-6 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Back to Website
                </a>
              </Link>
            </nav>
          </SheetContent>
        </div>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-y-auto md:pl-0">
        <main className="flex-1">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="px-4 mx-auto mt-4 max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}