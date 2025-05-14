import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  CalendarRange,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function NewDashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedNursery, setSelectedNursery] = useState<string | null>(null);

  // Initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Navigation items
  const navigationItems = [
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
      name: 'Gallery',
      href: '/admin/gallery',
      icon: Image,
      active: location.includes('/admin/gallery'),
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: CalendarRange,
      active: location.includes('/admin/events'),
    },
    {
      name: 'Staff',
      href: '/admin/staff',
      icon: Users,
      active: location.includes('/admin/staff'),
      show: user?.role === 'super_admin' || user?.role === 'admin',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      active: location === '/admin/settings',
    },
  ];

  // Filter out items that shouldn't be shown based on user role
  const filteredNavItems = navigationItems.filter(
    (item) => !('show' in item) || item.show !== false
  );

  const handleLogout = async () => {
    await logout();
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Nursery locations for dropdown
  const nurseryLocations = ['All Nurseries', 'Hayes', 'Uxbridge', 'Hounslow'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <div className="rounded-md bg-primary/10 p-1">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-primary">Nursery CMS</span>
            </Link>
          </div>
          <div className="mt-6 flex flex-col flex-1">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    item.active
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-primary/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      item.active ? "text-white" : "text-gray-500 group-hover:text-primary"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2 text-sm">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                      <span className="text-xs text-gray-500">{user?.role}</span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-left flex items-center">
              <Home className="h-5 w-5 mr-2 text-primary" />
              Nursery CMS
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    item.active
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-primary/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      item.active ? "text-white" : "text-gray-500 group-hover:text-primary"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t p-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-gray-500">{user?.role}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 w-full justify-center" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
              </div>

              {/* Nursery Selector */}
              <div className="flex-1 flex justify-center md:justify-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <span>{selectedNursery || 'All Nurseries'}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {nurseryLocations.map((location) => (
                      <DropdownMenuItem 
                        key={location}
                        onClick={() => setSelectedNursery(location === 'All Nurseries' ? null : location)}
                      >
                        {location}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Right section - notifications, profile */}
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}