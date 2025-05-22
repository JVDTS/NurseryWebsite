import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Image, 
  FileText, 
  Menu, 
  X, 
  Users, 
  Building2, 
  Settings, 
  FileImage, 
  LogOut, 
  Activity,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function AdminLayout({ children, title, description, icon }: AdminLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, isSuperAdmin, isAdmin } = useAdmin();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      current: location === "/admin",
    },
    {
      name: "Events",
      href: "/admin/events",
      icon: <CalendarDays className="h-5 w-5" />,
      current: location === "/admin/events",
    },
    {
      name: "Gallery",
      href: "/admin/gallery",
      icon: <Image className="h-5 w-5" />,
      current: location === "/admin/gallery",
    },
    {
      name: "Newsletters",
      href: "/admin/newsletters",
      icon: <FileText className="h-5 w-5" />,
      current: location === "/admin/newsletters",
    },
    {
      name: "Media",
      href: "/admin/media",
      icon: <FileImage className="h-5 w-5" />,
      current: location === "/admin/media",
    }
  ];

  // Admin-only navigation items
  const adminNavigation = [
    {
      name: "Nurseries",
      href: "/admin/nurseries",
      icon: <Building2 className="h-5 w-5" />,
      current: location === "/admin/nurseries",
      requireAdmin: true,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      current: location === "/admin/users",
      requireAdmin: true,
    },
    {
      name: "Activity Logs",
      href: "/admin/activity",
      icon: <Activity className="h-5 w-5" />,
      current: location === "/admin/activity",
      requireAdmin: true,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      current: location === "/admin/settings",
      requireAdmin: false,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Mobile menu toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
        <h1 className="text-xl font-bold text-center">Admin Dashboard</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="flex h-[calc(100vh-57px)] lg:h-screen">
        {/* Sidebar for desktop */}
        <aside
          className={cn(
            "fixed inset-y-0 z-50 flex w-72 flex-col bg-white border-r transition-all duration-300 ease-in-out",
            isMenuOpen ? "left-0" : "-left-72",
            "lg:left-0 lg:relative"
          )}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-1.5 rounded-md bg-primary/10">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-8 w-8"
                  onError={(e) => (e.currentTarget.src = '/favicon.png')}
                />
              </div>
              <h1 className="font-bold text-xl">Nursery CMS</h1>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <a
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        item.current
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </a>
                  </Link>
                ))}

                <Separator className="my-4" />

                {adminNavigation
                  .filter(item => !item.requireAdmin || isAdmin)
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <a
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          item.current
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {item.icon}
                        {item.name}
                      </a>
                    </Link>
                  ))}
              </nav>
            </ScrollArea>

            {isAuthenticated && currentUser && (
              <div className="mt-auto pt-4 border-t">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.profileImageUrl} />
                        <AvatarFallback>
                          {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div className="font-medium">{currentUser.firstName} {currentUser.lastName}</div>
                        <div className="text-xs text-muted-foreground">{currentUser.role.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2 pl-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container px-4 py-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    {icon}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{title}</h1>
                  {description && (
                    <p className="text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}