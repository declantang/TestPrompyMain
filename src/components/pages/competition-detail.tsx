import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Trophy, Clock, ArrowLeft, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { supabase } from "../../../supabase/supabase";
import { Competition } from "@/types/competition";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCompetition(id);
    }
  }, [id]);

  const fetchCompetition = async (competitionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", competitionId)
        .single();

      if (error) throw error;
      setCompetition(data);
    } catch (error) {
      console.error("Error fetching competition:", error);
      toast({
        title: "Error",
        description: "Could not load competition details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!submission.trim()) {
      toast({
        title: "Error",
        description: "Please enter your submission",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // In a real app, you would save the submission to a submissions table
      // For now, we'll just show a success message

      toast({
        title: "Success",
        description: "Your submission has been received",
      });

      // Clear the submission form
      setSubmission("");
    } catch (error) {
      console.error("Error submitting entry:", error);
      toast({
        title: "Error",
        description: "Failed to submit your entry",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const isDeadlinePassed = () => {
    if (!competition) return false;
    return new Date(competition.deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/competitions")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Competitions
          </Button>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading competition details...</p>
            </div>
          ) : competition ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          {competition.title}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">
                            {competition.category}
                          </Badge>
                          <Badge>{competition.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="mb-6">
                      <img
                        src={
                          competition.image_url ||
                          "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80"
                        }
                        alt={competition.title}
                        className="w-full h-64 object-cover rounded-md"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        About this Competition
                      </h3>
                      <p className="text-muted-foreground">
                        {competition.description}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-muted rounded-md">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                        <div>
                          <p className="font-medium">Prize</p>
                          <p className="text-muted-foreground">
                            {competition.prize}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-muted rounded-md">
                        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                        <div>
                          <p className="font-medium">Deadline</p>
                          <p className="text-muted-foreground">
                            {formatDate(competition.deadline)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Entry Requirements
                      </h3>
                      <div className="p-3 bg-muted rounded-md">
                        <p>{competition.entry_requirements}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!isDeadlinePassed() && user && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Submit Your Entry</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Enter your submission here..."
                        className="min-h-32"
                        value={submission}
                        onChange={(e) => setSubmission(e.target.value)}
                        disabled={submitting}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Submit Entry
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {isDeadlinePassed() && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center text-center p-4">
                        <div>
                          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <h3 className="text-xl font-medium mb-2">
                            Competition Closed
                          </h3>
                          <p className="text-muted-foreground">
                            This competition has ended and is no longer
                            accepting submissions.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!user && !isDeadlinePassed() && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center text-center p-4">
                        <div>
                          <h3 className="text-xl font-medium mb-2">
                            Sign In to Participate
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            You need to be signed in to submit an entry to this
                            competition.
                          </p>
                          <Button onClick={() => navigate("/login")}>
                            Sign In
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>How to Participate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">Sign In</h4>
                        <p className="text-sm text-muted-foreground">
                          Create an account or sign in to your existing account.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Prepare Your Entry</h4>
                        <p className="text-sm text-muted-foreground">
                          Create your submission according to the competition
                          requirements.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Submit</h4>
                        <p className="text-sm text-muted-foreground">
                          Submit your entry before the deadline.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="mr-3">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Submission Deadline</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(competition.deadline)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="mr-3">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">Winners Announced</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(
                              new Date(
                                new Date(competition.deadline).getTime() +
                                  7 * 24 * 60 * 60 * 1000,
                              ).toISOString(),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">
                Competition Not Found
              </h3>
              <p className="text-muted-foreground mb-4">
                The competition you're looking for doesn't exist or has been
                removed.
              </p>
              <Button onClick={() => navigate("/competitions")}>
                View All Competitions
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
