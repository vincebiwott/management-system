import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfile } from "@/hooks/use-profiles";
import { useCreateReport } from "@/hooks/use-reports";
import { useLocation } from "wouter";
import { DEPARTMENTS, insertReportSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ObjectUploader } from "@/components/ObjectUploader";

// Extend the base schema for the form
const formSchema = insertReportSchema.extend({
  // Override or add fields if needed
  incidentFlag: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateReport() {
  const [, setLocation] = useLocation();
  const { data: profile } = useProfile();
  const createReport = useCreateReport();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: profile?.department || "",
      shift: "",
      keyActivities: "",
      guestFeedback: "",
      issues: "",
      pendingFollowups: "",
      incidentFlag: false,
      status: "submitted", // Default to submitted for MVP simplicity
    },
  });

  const incidentFlag = form.watch("incidentFlag");

  // Get current hour to guess shift
  const hour = new Date().getHours();
  let defaultShift = "Morning";
  if (hour >= 15 && hour < 23) defaultShift = "Evening";
  if (hour >= 23 || hour < 7) defaultShift = "Night";

  async function onSubmit(data: FormValues) {
    try {
      await createReport.mutateAsync(data);
      setLocation("/");
    } catch (error) {
      // Error handled by hook toast
    }
  }

  // Handle file upload parameter generation
  const getUploadParameters = async (file: { name: string, size: number, type: string }) => {
    const res = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        contentType: file.type,
      }),
    });
    const { uploadURL } = await res.json();
    return {
      method: "PUT" as const,
      url: uploadURL,
      headers: { "Content-Type": file.type },
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-slate-900">New Daily Report</h1>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{format(new Date(), "MMMM do, yyyy")}</p>
          <p className="text-xs text-slate-500">{profile?.name}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className={`border-l-4 shadow-md ${incidentFlag ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
            <CardHeader>
              <CardTitle>Shift Details</CardTitle>
              <CardDescription>Basic information about your shift.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || profile?.department || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(DEPARTMENTS).map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={defaultShift}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Morning">Morning (07:00 - 15:00)</SelectItem>
                        <SelectItem value="Evening">Evening (15:00 - 23:00)</SelectItem>
                        <SelectItem value="Night">Night (23:00 - 07:00)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Report Content</CardTitle>
              <CardDescription>Document key activities and feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="keyActivities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Activities / Highlights</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List major events, VIP arrivals, or special requests..." 
                        className="min-h-[120px] resize-y"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="guestFeedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Feedback</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Compliments or complaints..." 
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pendingFollowups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pending Follow-ups</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Items for the next shift..." 
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={`p-4 rounded-lg border transition-colors ${incidentFlag ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
                <FormField
                  control={form.control}
                  name="incidentFlag"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <AlertTriangle className={`h-5 w-5 ${incidentFlag ? 'text-orange-500' : 'text-slate-400'}`} />
                          Incident Report
                        </FormLabel>
                        <FormDescription>
                          Flag this report if a significant incident occurred.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {incidentFlag && (
                  <div className="mt-4 animate-fade-in">
                    <FormField
                      control={form.control}
                      name="issues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-orange-900">Incident Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the incident, parties involved, and action taken..." 
                              className="min-h-[100px] border-orange-200 focus-visible:ring-orange-500"
                              {...field}
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* File Attachments */}
              <div className="space-y-4">
                 <FormLabel>Attachments</FormLabel>
                 <ObjectUploader
                    onGetUploadParameters={getUploadParameters}
                    onComplete={(result) => {
                      console.log("Uploaded", result);
                      // In a real app, you'd add these URLs to a hidden field in the form
                      // For this demo, we'll just log it as the schema handles attachments separately in a fuller implementation
                    }}
                    buttonClassName="w-full border-dashed border-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                  >
                    <div className="flex flex-col items-center py-4">
                      <Paperclip className="h-8 w-8 mb-2 opacity-50" />
                      <span>Attach photos or documents</span>
                    </div>
                  </ObjectUploader>
              </div>

            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end pb-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`min-w-[150px] ${incidentFlag ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              disabled={createReport.isPending}
            >
              {createReport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
