import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reportId, content }: { reportId: number; content: string }) => {
      const url = buildUrl(api.comments.create.path, { reportId });
      const validated = api.comments.create.input.parse({ content });
      
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to post comment");
      }
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.reports.get.path, variables.reportId] });
      toast({
        title: "Comment Added",
        description: "Your remark has been posted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
