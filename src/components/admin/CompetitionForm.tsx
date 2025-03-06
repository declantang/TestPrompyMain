import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { Competition } from "@/types/competition";

const formSchema = z.object({
  title: z.string().min(1, { message: "Please enter a title" }),
  short_description: z.string().min(1, {
    message: "Please enter a short description",
  }),
  description: z.string().min(1, { message: "Please enter a description" }),
  category: z.string().min(1, { message: "Please select a category" }),
  type: z.string().min(1, { message: "Please select a type" }),
  entry_requirements: z.string().min(1, {
    message: "Please specify entry requirements",
  }),
  prize: z.string().min(1, { message: "Please specify the prize" }),
  deadline: z.string().min(1, { message: "Please specify a deadline" }),
  image_url: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
});

interface CompetitionFormProps {
  competition?: Competition;
  onSuccess?: () => void;
}

export default function CompetitionForm({
  competition,
  onSuccess,
}: CompetitionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!competition;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: competition?.title || "",
      short_description: competition?.short_description || "",
      description: competition?.description || "",
      category: competition?.category || "",
      type: competition?.type || "",
      entry_requirements: competition?.entry_requirements || "",
      prize: competition?.prize || "",
      deadline: competition?.deadline
        ? new Date(competition.deadline).toISOString().split("T")[0]
        : "",
      image_url: competition?.image_url || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Format the deadline to include time
      const deadline = new Date(values.deadline);
      deadline.setHours(23, 59, 59);

      const competitionData = {
        ...values,
        deadline: deadline.toISOString(),
        image_url: values.image_url || null,
      };

      let result;

      if (isEditing) {
        // Update existing competition
        result = await supabase
          .from("competitions")
          .update(competitionData)
          .eq("id", competition.id);
      } else {
        // Create new competition
        result = await supabase.from("competitions").insert([competitionData]);
      }

      if (result.error) throw result.error;

      toast({
        title: isEditing ? "Competition updated" : "Competition created",
        description: isEditing
          ? "The competition has been updated successfully."
          : "The competition has been created successfully.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving competition:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} competition. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Competition title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description (displayed in cards)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the competition"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to an image representing this competition
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Writing">Writing</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Skill">Skill</SelectItem>
                      <SelectItem value="Luck">Luck</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="entry_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Requirements</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Free, Email, Social Media, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of requirements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize</FormLabel>
                  <FormControl>
                    <Input placeholder="$500 Cash Prize" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Competition"
                : "Create Competition"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
