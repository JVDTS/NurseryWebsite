import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Users, Home, FileText, Image, Calendar, Settings, LogOut, 
  Menu, X, ChevronDown, Bell, User, BarChart 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: nurseries = [] } = useQuery({
    queryKey: ["/api/nurseries"],
    enabled: !!user,
  });

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home, current: location === "/admin" },
    { name: "Content Management", href: "/admin/content", icon: FileText, current: location === "/admin/content" },
    { name: "Gallery", href: "/admin/gallery", icon: Image, current: location === "/admin/gallery" },
    { name: "Events", href: "/admin/events", icon: Calendar, current: location === "/admin/events" },
    { name: "User Management", href: "/admin/users", icon: Users, current: location === "/admin/users" },
    { name: "Activity Logs", href: "/admin/activity", icon: BarChart, current: location === "/admin/activity" },
    { name: "Settings", href: "/admin/settings", icon: Settings, current: location === "/admin/settings" },
  ];

  // Filter out User Management and Activity Logs for non-super-admin users
  const filteredNavigation = user?.role === "super_admin" 
    ? navigation 
    : navigation.filter(item => item.name !== "User Management" && item.name !== "Activity Logs");

  const logout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center">
              <img className="h-8 w-auto" src="/logo.png" alt="Nursery CMS" />
              <span className="ml-2 text-xl font-semibold">Nursery CMS</span>
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="flex flex-col space-y-2">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    item.current
                      ? "bg-cyan-50 text-cyan-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <img className="h-8 w-auto" src="/logo.png" alt="Nursery CMS" />
            <span className="ml-2 text-xl font-semibold">Nursery CMS</span>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    item.current
                      ? "bg-cyan-50 text-cyan-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-600" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
          <button
            type="button"
            className="px-4 text-gray-500 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex items-center">
              {/* Breadcrumb could be added here */}
            </div>
            <div className="flex items-center space-x-4">
              {/* User profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.profileImageUrl ? (
                        <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.firstName} {user?.lastName}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.role === 'super_admin' ? 'Administrator' : 
                         user?.role === 'admin' ? 'Nursery Manager' : 
                         user?.role === 'editor' ? 'Content Editor' : 'User'}
                      </span>
                    </div>
                  </DropdownMenuLabel>
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
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}