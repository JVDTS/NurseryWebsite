import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
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
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
