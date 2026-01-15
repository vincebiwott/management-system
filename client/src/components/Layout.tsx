import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu,
  PlusCircle,
  Building2,
  Bell
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();

  const isSupervisor = profile?.role === "supervisor" || profile?.role === "admin";

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Reports", href: "/reports", icon: FileText },
    ...(isSupervisor ? [
      { name: "Department Overview", href: "/department", icon: Building2 }
    ] : []),
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Building2 className="h-6 w-6 text-emerald-500 mr-3" />
        <span className="text-lg font-display font-bold tracking-wide">
          GRAND HOTEL
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="mb-8 px-4">
          <Link href="/submit">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? "bg-slate-800 text-emerald-400 shadow-inner" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    }
                  `}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white"}`} 
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center">
          <Avatar className="h-9 w-9 border border-slate-700">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback className="bg-emerald-900 text-emerald-200">
              {profile?.name?.charAt(0) || user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-white group-hover:text-white">
              {profile?.name || "Staff Member"}
            </p>
            <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
              {profile?.department ? profile.department.toUpperCase() : "Set Department"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-r-slate-800 bg-slate-900">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-display font-semibold text-slate-800">
                {navigation.find(n => n.href === location)?.name || "Daily Operations"}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="h-6 w-px bg-slate-200" aria-hidden="true" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-4 text-sm font-semibold leading-6 text-slate-900" aria-hidden="true">
                        {profile?.name || user?.firstName}
                      </span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
