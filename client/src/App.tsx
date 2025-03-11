import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import HayesNursery from "@/pages/nurseries/Hayes";
import UxbridgeNursery from "@/pages/nurseries/Uxbridge";
import HounslowNursery from "@/pages/nurseries/Hounslow";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/nurseries/hayes" component={HayesNursery} />
      <Route path="/nurseries/uxbridge" component={UxbridgeNursery} />
      <Route path="/nurseries/hounslow" component={HounslowNursery} />
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
