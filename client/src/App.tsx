import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import CreateReport from "@/pages/CreateReport";
import ReportList from "@/pages/ReportList";
import ReportDetail from "@/pages/ReportDetail";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "@/pages/not-found";

// Wrapper for protected routes
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  if (isLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/landing" />;
  }

  // Force profile setup if missing department or name
  if (!profile?.department && !profile?.name && window.location.pathname !== "/setup") {
    return <Redirect to="/setup" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/setup" component={ProfileSetup} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/submit">
        <ProtectedRoute component={CreateReport} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportList} />
      </Route>
      <Route path="/reports/:id">
        <ProtectedRoute component={ReportDetail} />
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
