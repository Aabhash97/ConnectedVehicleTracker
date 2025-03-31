import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import VehicleEvents from "@/pages/VehicleEvents";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const [location, setLocation] = useLocation();
  
  // Redirect to dashboard if at root
  useEffect(() => {
    if (location === "/") {
      setLocation("/dashboard");
    }
  }, [location, setLocation]);
  
  return (
    <Switch>
      <Route path="/dashboard/:vehicleId?" component={Dashboard} />
      <Route path="/vehicle-events" component={VehicleEvents} />
      <Route path="/settings" component={() => <div>Settings Page</div>} />
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
