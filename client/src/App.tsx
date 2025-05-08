import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import PageTransition from "@/components/PageTransition";
import NotFound from "@/pages/not-found";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { NurserySelectorProvider } from '@/hooks/use-nursery-selector';

// Main pages (lazy loaded)
const AboutPage = lazy(() => import("@/pages/About"));
const MissionPage = lazy(() => import("@/pages/Mission"));
const NewslettersPage = lazy(() => import("@/pages/Newsletters"));
const GalleryPage = lazy(() => import("@/pages/Gallery"));
const ViewContactSubmissions = lazy(() => import("@/pages/ViewContactSubmissions"));

// Nursery pages (lazy loaded)
const HayesNursery = lazy(() => import("@/pages/nurseries/Hayes"));
const UxbridgeNursery = lazy(() => import("@/pages/nurseries/Uxbridge"));
const HounslowNursery = lazy(() => import("@/pages/nurseries/Hounslow"));

// Parent info pages (lazy loaded)
const FeesPage = lazy(() => import("@/pages/parent-info/Fees"));
const SampleMenuPage = lazy(() => import("@/pages/parent-info/SampleMenu"));
const DailyRoutinePage = lazy(() => import("@/pages/parent-info/DailyRoutine"));
const TermDatesPage = lazy(() => import("@/pages/parent-info/TermDates"));
const PoliciesPage = lazy(() => import("@/pages/parent-info/Policies"));

// Admin pages (lazy loaded)
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminEvents = lazy(() => import("@/pages/admin/Events"));
const AdminGallery = lazy(() => import("@/pages/admin/Gallery"));
const AdminNewsletters = lazy(() => import("@/pages/admin/Newsletters"));

// Wrapper for lazy-loaded components
const LazyRoute = ({ 
  path, 
  component: Component 
}: { 
  path: string; 
  component: React.ComponentType;
}) => (
  <Route path={path}>
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <Component />
    </Suspense>
  </Route>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Main routes */}
      <LazyRoute path="/about" component={AboutPage} />
      <LazyRoute path="/mission" component={MissionPage} />
      <LazyRoute path="/newsletters" component={NewslettersPage} />
      <LazyRoute path="/gallery" component={GalleryPage} />
      <LazyRoute path="/view-contact-submissions" component={ViewContactSubmissions} />
      
      {/* Nursery routes */}
      <LazyRoute path="/nurseries/hayes" component={HayesNursery} />
      <LazyRoute path="/nurseries/uxbridge" component={UxbridgeNursery} />
      <LazyRoute path="/nurseries/hounslow" component={HounslowNursery} />
      
      {/* Parent info routes */}
      <LazyRoute path="/parent-info/fees" component={FeesPage} />
      <LazyRoute path="/parent-info/sample-menu" component={SampleMenuPage} />
      <LazyRoute path="/parent-info/daily-routine" component={DailyRoutinePage} />
      <LazyRoute path="/parent-info/term-dates" component={TermDatesPage} />
      <LazyRoute path="/parent-info/policies" component={PoliciesPage} />
      
      {/* Admin routes - public login page */}
      <LazyRoute path="/admin/login" component={AdminLogin} />
      
      {/* Protected admin routes */}
      <ProtectedRoute 
        path="/admin/dashboard" 
        component={AdminDashboard} 
        allowedRoles={['super_admin', 'nursery_admin']} 
      />
      <ProtectedRoute 
        path="/admin/events" 
        component={AdminEvents} 
        allowedRoles={['super_admin', 'nursery_admin']} 
      />
      <ProtectedRoute 
        path="/admin/gallery" 
        component={AdminGallery} 
        allowedRoles={['super_admin', 'nursery_admin']} 
      />
      <ProtectedRoute 
        path="/admin/newsletters" 
        component={AdminNewsletters} 
        allowedRoles={['super_admin', 'nursery_admin']} 
      />
      
      {/* Admin nursery-specific routes */}
      <ProtectedRoute 
        path="/admin/nurseries/:nurseryId/events" 
        component={AdminEvents} 
        allowedRoles={['super_admin', 'nursery_admin']} 
      />
      <ProtectedRoute 
        path="/admin/nurseries/:nurseryId/gallery" 
        component={AdminGallery} 
        allowedRoles={['super_admin', 'nursery_admin']} 
      />
      <ProtectedRoute 
        path="/admin/nurseries/:nurseryId/newsletters" 
        component={AdminNewsletters} 
        allowedRoles={['super_admin', 'nursery_admin']} 
      />
      
      {/* 404 catch-all route */}
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NurserySelectorProvider>
          <div className="min-h-screen overflow-x-hidden relative w-full">
            <ScrollToTop />
            <PageTransition>
              <Router />
            </PageTransition>
            <Toaster />
          </div>
        </NurserySelectorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
