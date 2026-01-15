import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateReportRequest, UpdateReportRequest, ReportWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useReports(filters?: { 
  department?: string; 
  date?: string; 
  status?: string;
  mine?: string;
}) {
  // Construct query string manually since we're passing it to GET
  const queryParams = new URLSearchParams();
  if (filters?.department) queryParams.append("department", filters.department);
  if (filters?.date) queryParams.append("date", filters.date);
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.mine) queryParams.append("mine", filters.mine);

  const queryString = queryParams.toString();
  const path = `${api.reports.list.path}${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: [path],
    queryFn: async () => {
      const res = await fetch(path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return api.reports.list.responses[200].parse(await res.json());
    },
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: [api.reports.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.reports.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Report not found");
      if (!res.ok) throw new Error("Failed to fetch report");
      return api.reports.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateReportRequest) => {
      const validated = api.reports.create.input.parse(data);
      const res = await fetch(api.reports.create.path, {
        method: api.reports.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.reports.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create report");
      }
      return api.reports.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({
        title: "Report Submitted",
        description: "Your daily report has been successfully logged.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateReportRequest) => {
      const validated = api.reports.update.input.parse(updates);
      const url = buildUrl(api.reports.update.path, { id });
      
      const res = await fetch(url, {
        method: api.reports.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update report");
      }
      return api.reports.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.get.path, data.id] });
      toast({
        title: "Report Updated",
        description: "Changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.reports.delete.path, { id });
      const res = await fetch(url, { 
        method: api.reports.delete.method, 
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to delete report");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({
        title: "Report Deleted",
        description: "The report has been permanently removed.",
      });
    },
  });
}
