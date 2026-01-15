import { useReports } from "@/hooks/use-reports";
import { Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { DEPARTMENTS, REPORT_STATUS } from "@shared/schema";
import { useState } from "react";

export default function ReportList() {
  const [department, setDepartment] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: reports, isLoading } = useReports({
    department: department === "all" ? undefined : department,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Report Archive</h1>
          <p className="text-slate-500">View and manage daily operational reports.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search reports..." className="pl-9" />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Object.values(DEPARTMENTS).map((d) => (
                <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={status} onValueChange={setStatus}>
             <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(REPORT_STATUS).map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : reports?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500">No reports found matching your filters.</p>
          </div>
        ) : (
          reports?.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group border-l-4 border-l-transparent hover:border-l-emerald-500">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {format(new Date(report.date), "MMMM do, yyyy")}
                      </h3>
                      {report.incidentFlag && (
                         <span className="flex items-center text-orange-600 text-xs font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                           <AlertTriangle className="h-3 w-3 mr-1" />
                           Incident
                         </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{report.department.toUpperCase()}</span>
                      <span className="mx-2">•</span>
                      {report.shift} Shift
                      <span className="mx-2">•</span>
                      By {report.author?.firstName} {report.author?.lastName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <StatusBadge status={report.status} />
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
