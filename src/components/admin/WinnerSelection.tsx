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
import { Trophy, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Competition {
  id: string;
  title: string;
  deadline: string;
  status?: string;
  winner_id?: string;
}

interface Submission {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_email?: string;
}

export default function WinnerSelection() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("deadline", { ascending: false });

      if (error) throw error;

      // Filter competitions that have ended but don't have a winner yet
      const now = new Date();
      const endedCompetitions = (data || []).filter((comp) => {
        const deadline = new Date(comp.deadline);
        return deadline < now && !comp.winner_id;
      });

      setCompetitions(endedCompetitions);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      toast({
        title: "Error",
        description: "Failed to load competitions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (competitionId: string) => {
    try {
      setSubmissionsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get_submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            competition_id: competitionId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch submissions");
      }

      const fetchedSubmissions = result.submissions || [];

      // If no real submissions, use mock data for demonstration
      if (fetchedSubmissions.length === 0) {
        const mockSubmissions: Submission[] = [
          {
            id: "1",
            user_id: "user1",
            content:
              "This is my submission for the competition. I've put a lot of effort into this work.",
            created_at: new Date().toISOString(),
            user_email: "user1@example.com",
          },
          {
            id: "2",
            user_id: "user2",
            content:
              "Here's my entry for the competition. I hope you like my creative approach.",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            user_email: "user2@example.com",
          },
          {
            id: "3",
            user_id: "user3",
            content:
              "I'm excited to submit my work for this competition. It represents my best effort.",
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            user_email: "user3@example.com",
          },
        ];
        setSubmissions(mockSubmissions);
        return mockSubmissions;
      }

      setSubmissions(fetchedSubmissions);
      return fetchedSubmissions;
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });

      // Fallback to mock data
      const mockSubmissions: Submission[] = [
        {
          id: "1",
          user_id: "user1",
          content:
            "This is my submission for the competition. I've put a lot of effort into this work.",
          created_at: new Date().toISOString(),
          user_email: "user1@example.com",
        },
        {
          id: "2",
          user_id: "user2",
          content:
            "Here's my entry for the competition. I hope you like my creative approach.",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          user_email: "user2@example.com",
        },
        {
          id: "3",
          user_id: "user3",
          content:
            "I'm excited to submit my work for this competition. It represents my best effort.",
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          user_email: "user3@example.com",
        },
      ];
      setSubmissions(mockSubmissions);
      return mockSubmissions;
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleSelectWinner = async (submissionId: string) => {
    if (!selectedCompetition) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/select_winner`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            competition_id: selectedCompetition.id,
            submission_id: submissionId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to select winner");
      }

      toast({
        title: "Winner selected",
        description: "The winner has been selected successfully.",
      });

      // Update local state
      setCompetitions(
        competitions.filter((comp) => comp.id !== selectedCompetition.id),
      );
      setViewDialogOpen(false);
      setSubmissionDialogOpen(false);
    } catch (error) {
      console.error("Error selecting winner:", error);
      toast({
        title: "Error",
        description: "Failed to select winner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCompetition = async (competition: Competition) => {
    setSelectedCompetition(competition);
    const subs = await fetchSubmissions(competition.id);
    if (subs.length > 0) {
      setViewDialogOpen(true);
    } else {
      toast({
        title: "No submissions",
        description: "This competition has no approved submissions.",
      });
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSubmissionDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading competitions...</p>
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
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No competitions available for winner selection.
                </TableCell>
              </TableRow>
            ) : (
              competitions.map((competition) => (
                <TableRow key={competition.id}>
                  <TableCell className="font-medium">
                    {competition.title}
                  </TableCell>
                  <TableCell>{formatDate(competition.deadline)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCompetition(competition)}
                    >
                      Select Winner
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Competition Submissions Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Winner</DialogTitle>
            <DialogDescription>
              Choose a winner for {selectedCompetition?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {submissionsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                <p>Loading submissions...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.user_email}</TableCell>
                      <TableCell>{formatDate(submission.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-yellow-600"
                            onClick={() => handleSelectWinner(submission.id)}
                            disabled={actionLoading}
                          >
                            <Trophy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Viewing submission from {selectedSubmission?.user_email}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
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
                onClick={() => setSubmissionDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (selectedSubmission) {
                    handleSelectWinner(selectedSubmission.id);
                    setSubmissionDialogOpen(false);
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Select as Winner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
