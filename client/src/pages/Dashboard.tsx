import { useReports } from "@/hooks/use-reports";
import { useProfile } from "@/hooks/use-profiles";
import { Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { DEPARTMENTS, REPORT_STATUS } from "@shared/schema";

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: reports, isLoading } = useReports({ 
    mine: "true" 
  });
  
  // Also fetch department stats if supervisor
  const isSupervisor = profile?.role === "supervisor" || profile?.role === "admin";
  const { data: deptReports } = useReports({ 
    department: isSupervisor ? profile?.department ?? undefined : undefined,
    status: REPORT_STATUS.SUBMITTED
  });

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {profile?.name}
          </h2>
          <p className="text-slate-500 mt-1">{today} • {profile?.department?.toUpperCase()} Department</p>
        </div>
        <Link href="/submit">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10">
            <Plus className="mr-2 h-4 w-4" />
            Submit Daily Report
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
            <FileText className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total this month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.filter(r => r.status === REPORT_STATUS.SUBMITTED).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting supervisor</p>
          </CardContent>
        </Card>

        {isSupervisor && (
          <Card className="shadow-sm border-slate-200 bg-orange-50/50 border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Department Action Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                {deptReports?.filter(r => r.incidentFlag).length || 0}
              </div>
              <p className="text-xs text-orange-600/80">Incidents needing attention</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-7 md:col-span-4 shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="font-display">Your Recent Reports</CardTitle>
            <CardDescription>
              Status of your last 5 submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : reports?.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No reports submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reports?.slice(0, 5).map((report) => (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {format(new Date(report.date), "MMM d, yyyy")}
                          </p>
                          {report.incidentFlag && (
                            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{report.shift} Shift</p>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Supervisor View */}
        <Card className="col-span-7 md:col-span-3 shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="font-display">
              {isSupervisor ? "Department Overview" : "Quick Actions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSupervisor ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <h4 className="font-semibold text-emerald-900 mb-2">Needs Review</h4>
                  <div className="text-3xl font-bold text-emerald-700">
                    {deptReports?.length || 0}
                  </div>
                  <Link href="/department">
                    <Button variant="link" className="px-0 text-emerald-600 h-auto mt-2">
                      View all pending reports &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <h4 className="font-medium text-slate-900 mb-2">Shift Handovers</h4>
                  <p className="text-sm text-slate-500 mb-4">
                    Ensure all pending follow-ups are documented before ending your shift.
                  </p>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
