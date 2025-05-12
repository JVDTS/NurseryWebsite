import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { fetchCsrfToken } from '@/lib/csrf';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, LogOut, Users, Newspaper, Image, 
  Settings, ChevronDown, Menu, X, 
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
import NurserySelector from './NurserySelectorNew';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch CSRF token on component mount
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const token = await fetchCsrfToken();
        setCsrfToken(token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    getCsrfToken();
  }, []);

  const handleLogout = async () => {
    try {
      if (csrfToken) {
        await logout(csrfToken);
      } else {
        await logout();
        console.warn('Logging out without CSRF token');
      }
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
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
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shadow-md bg-primary fixed left-0 top-0 h-full z-30">
        <div className="p-4 border-b border-primary-foreground/20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <img 
                src="/images/cmc-logo.png" 
                alt="CMC Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">CMC Nursery</span>
              <span className="text-xs text-white/70">{user?.role === 'super_admin' ? 'System Admin' : getNurseryName()}</span>
            </div>
          </Link>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto py-6">
          <nav className="flex-1 px-4 space-y-2">
            {navigationItems.filter(item => item.show).map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-md group",
                    item.active
                      ? "bg-white text-primary"
                      : "text-white hover:bg-primary-foreground/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      item.active ? "text-primary" : "text-white/70"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            ))}
            
            <Link href="/">
              <a className="flex items-center px-3 py-2.5 mt-8 text-sm font-medium text-white rounded-md hover:bg-primary-foreground/10 group">
                <HomeIcon className="w-5 h-5 mr-3 text-white/70" />
                Back to Website
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-primary-foreground/20">
          <Button variant="outline" onClick={handleLogout} className="w-full justify-center text-white border-white/20 hover:bg-primary-foreground/10 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className="flex flex-col flex-1 md:pl-64">
          <div className="sticky top-0 z-10 flex items-center px-4 py-3 bg-white shadow-sm md:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <div className="flex items-center justify-center flex-1">
              <Link href="/" className="flex items-center">
                <img 
                  src="/images/cmc-logo.png" 
                  alt="CMC Logo" 
                  className="w-8 h-8 object-contain mr-2"
                />
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
                    <a className="cursor-pointer">My Profile</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#">
                    <a className="cursor-pointer">Settings</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#">
                    <a className="cursor-pointer">FAQ</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SheetContent side="left" className="p-0 w-64 bg-primary">
            <div className="flex items-center justify-between p-4 border-b border-primary-foreground/20">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
                  <img 
                    src="/images/cmc-logo.png" 
                    alt="CMC Logo" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-white">CMC Nursery</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-primary-foreground/10">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="px-4 py-6 space-y-2">
              {navigationItems.filter(item => item.show).map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-md group",
                      item.active
                        ? "bg-white text-primary"
                        : "text-white hover:bg-primary-foreground/10"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        item.active ? "text-primary" : "text-white/70"
                      )}
                    />
                    {item.name}
                  </a>
                </Link>
              ))}
              
              <Link href="/">
                <a 
                  className="flex items-center px-3 py-2.5 mt-8 text-sm font-medium text-white rounded-md hover:bg-primary-foreground/10 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon className="w-5 h-5 mr-3 text-white/70" />
                  Back to Website
                </a>
              </Link>
            </nav>
          </SheetContent>
        </div>
      </Sheet>

      {/* Top Navigation Bar */}
      <div className="hidden md:block fixed right-0 top-0 left-64 h-16 bg-white shadow-sm z-20 px-6">
        <div className="flex h-full justify-between items-center">
          <div className="flex items-center">
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="search" 
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-200 rounded-md bg-gray-50 focus:ring-primary focus:border-primary" 
                placeholder="Quick Search" 
              />
              <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {user?.role === 'super_admin' && (
              <div className="ml-6">
                <NurserySelector 
                  onChange={(id) => console.log("Selected nursery:", id)}
                  selectedNurseryId={null}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-gray-500">{user?.email?.split('@')[0]+'@email.com'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <a className="cursor-pointer">My Profile</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#">
                    <a className="cursor-pointer">Settings</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#">
                    <a className="cursor-pointer">FAQ</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64 overflow-y-auto">
        <main className="flex-1">
          <div className="md:pt-20 py-6">
            <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto flex flex-col items-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{title}</h1>
              <div className="w-full max-w-6xl">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}