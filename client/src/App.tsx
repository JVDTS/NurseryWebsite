import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import PageTransition from "@/components/PageTransition";
import NotFound from "@/pages/not-found";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";

// Main pages
import AboutPage from "@/pages/About";
import MissionPage from "@/pages/Mission";
import NewslettersPage from "@/pages/Newsletters";
import GalleryPage from "@/pages/Gallery";
import ViewContactSubmissions from "@/pages/ViewContactSubmissions";

// Nursery pages
import HayesNursery from "@/pages/nurseries/Hayes";
import UxbridgeNursery from "@/pages/nurseries/Uxbridge";
import HounslowNursery from "@/pages/nurseries/Hounslow";

// Parent info pages
import FeesPage from "@/pages/parent-info/Fees";
import SampleMenuPage from "@/pages/parent-info/SampleMenu";
import DailyRoutinePage from "@/pages/parent-info/DailyRoutine";
import TermDatesPage from "@/pages/parent-info/TermDates";
import PoliciesPage from "@/pages/parent-info/Policies";

// Admin pages
import AdminDashboard from "@/pages/admin/DashboardSimple";
import AdminLogin from "@/pages/admin/Login";
import AdminStaff from "@/pages/admin/Staff";
import AdminSettings from "@/pages/admin/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Main routes */}
      <Route path="/about" component={AboutPage} />
      <Route path="/mission" component={MissionPage} />
      <Route path="/newsletters" component={NewslettersPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/view-contact-submissions" component={ViewContactSubmissions} />
      
      {/* Nursery routes */}
      <Route path="/nurseries/hayes" component={HayesNursery} />
      <Route path="/nurseries/uxbridge" component={UxbridgeNursery} />
      <Route path="/nurseries/hounslow" component={HounslowNursery} />
      
      {/* Parent info routes */}
      <Route path="/parent-info/fees" component={FeesPage} />
      <Route path="/parent-info/sample-menu" component={SampleMenuPage} />
      <Route path="/parent-info/daily-routine" component={DailyRoutinePage} />
      <Route path="/parent-info/term-dates" component={TermDatesPage} />
      <Route path="/parent-info/policies" component={PoliciesPage} />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/staff" component={AdminStaff} />
      <Route path="/admin/settings" component={AdminSettings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

import { NurserySelectorProvider } from '@/hooks/use-nursery-selector';
import { AuthProvider } from '@/hooks/use-auth';

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
