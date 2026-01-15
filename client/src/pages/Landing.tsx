import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight } from "lucide-react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Hero */}
      <div className="lg:w-1/2 relative flex items-center justify-center bg-slate-900 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        
        <div className="relative z-10 px-12 py-16 text-center lg:text-left w-full max-w-2xl">
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <Building2 className="h-10 w-10 text-emerald-400 mr-3" />
            <span className="text-2xl font-display font-bold text-white tracking-widest">GRAND HOTEL</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6">
            Daily Operations <br />
            <span className="text-emerald-400">Reporting System</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-md">
            Streamline communication between departments. Log shift activities, incidents, and guest feedback efficiently.
          </p>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-slate-900">Welcome Back</h2>
            <p className="mt-2 text-slate-600">Please sign in to access your dashboard</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="space-y-6">
              <Button 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-lg font-medium shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                onClick={() => window.location.href = "/api/login"}
              >
                Sign in with Staff ID
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">Authorized personnel only</span>
                </div>
              </div>
              
              <p className="text-xs text-center text-slate-400">
                By accessing this system, you agree to the internal data handling policies of Grand Hotel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
