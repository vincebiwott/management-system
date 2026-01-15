import { useReport } from "@/hooks/use-reports";
import { useCreateComment } from "@/hooks/use-comments";
import { useProfile } from "@/hooks/use-profiles";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, MessageSquare, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { REPORT_STATUS } from "@shared/schema";

export default function ReportDetail() {
  const [, params] = useRoute("/reports/:id");
  const reportId = Number(params?.id);
  
  const { data: report, isLoading } = useReport(reportId);
  const { data: profile } = useProfile();
  const createComment = useCreateComment();
  
  const [comment, setComment] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-10">Report not found</div>;
  }

  const handleComment = async () => {
    if (!comment.trim()) return;
    await createComment.mutateAsync({ reportId, content: comment });
    setComment("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <Button 
        variant="ghost" 
        className="pl-0 text-slate-500 hover:text-slate-900" 
        onClick={() => history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Reports
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-3xl font-display font-bold text-slate-900">
               {format(new Date(report.date), "MMMM do, yyyy")}
             </h1>
             <StatusBadge status={report.status} />
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-medium text-slate-900">{report.department.toUpperCase()}</span>
            <span>•</span>
            <span>{report.shift} Shift</span>
            <span>•</span>
            <span>Submitted by {report.author?.firstName} {report.author?.lastName}</span>
          </div>
        </div>
        
        {report.incidentFlag && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-lg flex items-center font-medium animate-pulse">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Incident Reported
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Key Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {report.keyActivities}
              </p>
            </CardContent>
          </Card>

          {report.issues && (
            <Card className="shadow-sm border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="text-lg text-orange-900 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {report.issues}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Guest Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-slate-600 text-sm">
                  {report.guestFeedback || "None reported."}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Pending Follow-ups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-slate-600 text-sm">
                  {report.pendingFollowups || "None pending."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar: Comments & Meta */}
        <div className="space-y-6">
          <Card className="shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="mr-2 h-5 w-5 text-emerald-500" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {report.comments?.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No comments yet.</p>
                ) : (
                  report.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {comment.author?.firstName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-slate-50 p-3 rounded-lg flex-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-semibold text-xs text-slate-900">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {format(new Date(comment.createdAt!), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto">
                <div className="flex gap-2">
                  <Textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a remark..." 
                    className="min-h-[80px] text-sm resize-none"
                  />
                </div>
                <Button 
                  onClick={handleComment}
                  disabled={createComment.isPending || !comment.trim()}
                  className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800" 
                  size="sm"
                >
                  <Send className="mr-2 h-3 w-3" />
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
