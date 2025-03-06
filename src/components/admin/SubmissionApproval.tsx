import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  competition_id: string;
  user_id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  competition_title?: string;
  user_email?: string;
}

export default function SubmissionApproval() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select(`*, competitions(title), profiles:auth.users(email)`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format the submissions data
      const formattedSubmissions = data.map((submission) => ({
        id: submission.id,
        competition_id: submission.competition_id,
        user_id: submission.user_id,
        content: submission.content,
        status: submission.status,
        created_at: submission.created_at,
        competition_title: submission.competitions?.title,
        user_email: submission.profiles?.email,
      }));

      setSubmissions(formattedSubmissions);

      // If no real submissions, use mock data for demonstration
      if (formattedSubmissions.length === 0) {
        const mockSubmissions: Submission[] = [
          {
            id: "1",
            competition_id: "1",
            user_id: "user1",
            content:
              "This is my submission for the logo design challenge. I've created a modern, minimalist logo that represents innovation and technology.",
            status: "pending",
            created_at: new Date().toISOString(),
            competition_title: "Logo Design Challenge",
            user_email: "user1@example.com",
          },
          {
            id: "2",
            competition_id: "2",
            user_id: "user2",
            content:
              "Here's my nature photography submission. I captured this image during sunrise at the Grand Canyon.",
            status: "pending",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            competition_title: "Photography Contest",
            user_email: "user2@example.com",
          },
        ];
        setSubmissions(mockSubmissions);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
      // Use mock data as fallback
      const mockSubmissions: Submission[] = [
        {
          id: "1",
          competition_id: "1",
          user_id: "user1",
          content:
            "This is my submission for the logo design challenge. I've created a modern, minimalist logo that represents innovation and technology.",
          status: "pending",
          created_at: new Date().toISOString(),
          competition_title: "Logo Design Challenge",
          user_email: "user1@example.com",
        },
        {
          id: "2",
          competition_id: "2",
          user_id: "user2",
          content:
            "Here's my nature photography submission. I captured this image during sunrise at the Grand Canyon.",
          status: "pending",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          competition_title: "Photography Contest",
          user_email: "user2@example.com",
        },
      ];
      setSubmissions(mockSubmissions);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve_submission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            submission_id: id,
            status: "approved",
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to approve submission");
      }

      // Update local state
      setSubmissions(
        submissions.map((sub) =>
          sub.id === id ? { ...sub, status: "approved" } : sub,
        ),
      );

      toast({
        title: "Submission approved",
        description: "The submission has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error",
        description: "Failed to approve submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve_submission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            submission_id: id,
            status: "rejected",
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reject submission");
      }

      // Update local state
      setSubmissions(
        submissions.map((sub) =>
          sub.id === id ? { ...sub, status: "rejected" } : sub,
        ),
      );

      toast({
        title: "Submission rejected",
        description: "The submission has been rejected.",
      });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: "Failed to reject submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competition</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No submissions found.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.competition_title}
                  </TableCell>
                  <TableCell>{submission.user_email}</TableCell>
                  <TableCell>{formatDate(submission.created_at)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        submission.status === "approved"
                          ? "success"
                          : submission.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {submission.status.charAt(0).toUpperCase() +
                        submission.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(submission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-green-600"
                        onClick={() => handleApprove(submission.id)}
                        disabled={
                          submission.status !== "pending" || actionLoading
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleReject(submission.id)}
                        disabled={
                          submission.status !== "pending" || actionLoading
                        }
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Submission Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Viewing submission for {selectedSubmission?.competition_title}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium">Submitted by</h3>
              <p>{selectedSubmission?.user_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Submission Date</h3>
              <p>
                {selectedSubmission &&
                  formatDate(selectedSubmission.created_at)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Content</h3>
              <div className="mt-2 p-4 bg-muted rounded-md">
                <p>{selectedSubmission?.content}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </Button>
              {selectedSubmission?.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedSubmission.id);
                      setViewDialogOpen(false);
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedSubmission.id);
                      setViewDialogOpen(false);
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Approve"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
