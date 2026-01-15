import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useLocation } from "wouter";
import { DEPARTMENTS } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  department: z.enum(Object.values(DEPARTMENTS) as [string, ...string[]], {
    required_error: "Please select a department",
  }),
});

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // If profile exists and is complete, redirect to dashboard
  useEffect(() => {
    if (profile?.department && profile?.name) {
      setLocation("/");
    }
  }, [profile, setLocation]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      department: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof profileSchema>) {
    await updateProfile.mutateAsync(data);
    setLocation("/");
  }

  if (isProfileLoading || (profile?.department && profile?.name)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-display text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Please verify your information to access the reporting system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DEPARTMENTS.GRO}>Guest Relations (GRO)</SelectItem>
                        <SelectItem value={DEPARTMENTS.CONCIERGE}>Concierge</SelectItem>
                        <SelectItem value={DEPARTMENTS.RESERVATIONS}>Reservations</SelectItem>
                        <SelectItem value={DEPARTMENTS.SWITCHBOARD}>Switchboard</SelectItem>
                        <SelectItem value={DEPARTMENTS.MANAGEMENT}>Management</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This will determine your report routing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
