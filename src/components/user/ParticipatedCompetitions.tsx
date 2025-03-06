import { useState, useEffect } from "react";
import { Competition } from "@/types/competition";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Loader2, FileEdit } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface ParticipatedCompetition extends Competition {
  status: "pending" | "submitted" | "reviewing" | "completed";
  progress: number;
}

export default function ParticipatedCompetitions() {
  const [participatedCompetitions, setParticipatedCompetitions] = useState<
    ParticipatedCompetition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchParticipatedCompetitions();
    }
  }, [user]);

  const fetchParticipatedCompetitions = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual participated competitions from the database
      // For now, we'll use mock data
      const { data: competitions } = await supabase
        .from("competitions")
        .select("*")
        .limit(3);

      if (competitions) {
        // Add participation status to each competition
        const participatedComps = competitions.map((comp) => ({
          ...comp,
          status: getRandomStatus(),
          progress: Math.floor(Math.random() * 100),
        }));
        setParticipatedCompetitions(participatedComps);
      } else {
        setParticipatedCompetitions(getMockParticipatedCompetitions());
      }
    } catch (error) {
      console.error("Error fetching participated competitions:", error);
      // Fallback to mock data
      setParticipatedCompetitions(getMockParticipatedCompetitions());
    } finally {
      setLoading(false);
    }
  };

  const getRandomStatus = () => {
    const statuses = ["pending", "submitted", "reviewing", "completed"];
    return statuses[
      Math.floor(Math.random() * statuses.length)
    ] as ParticipatedCompetition["status"];
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: ParticipatedCompetition["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Not Submitted
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Submitted
          </Badge>
        );
      case "reviewing":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Under Review
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (participatedCompetitions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No active competitions</h3>
          <p className="text-muted-foreground text-center mb-4">
            You're not currently participating in any competitions. Browse
            competitions and enter one that interests you.
          </p>
          <Button asChild>
            <a href="/">Browse Competitions</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {participatedCompetitions.map((competition) => (
        <Card key={competition.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 relative">
              <img
                src={
                  competition.image_url ||
                  "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80"
                }
                alt={competition.title}
                className="h-48 md:h-full w-full object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-primary/90">
                {competition.type}
              </Badge>
            </div>

            <div className="p-4 md:w-3/4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{competition.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{competition.category}</Badge>
                      {getStatusBadge(competition.status)}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due: {formatDate(competition.deadline)}</span>
                  </div>
                </div>

                <div className="my-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Submission Progress</span>
                    <span>{competition.progress}%</span>
                  </div>
                  <Progress value={competition.progress} className="h-2" />
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm font-medium">
                  Prize: {competition.prize}
                </div>
                <div className="flex gap-2">
                  {competition.status === "pending" && (
                    <Button size="sm">
                      <FileEdit className="h-4 w-4 mr-1" /> Submit Entry
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Mock data function
function getMockParticipatedCompetitions(): ParticipatedCompetition[] {
  return [
    {
      id: "1",
      title: "Logo Design Challenge",
      description:
        "Create a stunning logo for our new tech startup. The winning design will be used as our official brand identity and the designer will receive recognition on our website and social media channels.",
      short_description:
        "Design a logo for a tech startup and win cash prizes.",
      category: "Design",
      type: "Skill",
      entry_requirements: "Free, Email",
      prize: "$500 Cash Prize",
      deadline: "2024-09-15T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      status: "pending",
      progress: 25,
    },
    {
      id: "2",
      title: "Photography Contest",
      description:
        "Submit your best nature photography for a chance to be featured in our annual calendar. We're looking for stunning landscapes, wildlife, and macro nature shots that capture the beauty of our natural world.",
      short_description:
        "Submit nature photos for a chance to be featured in our calendar.",
      category: "Photography",
      type: "Skill",
      entry_requirements: "Free, Social Media",
      prize: "Featured in Calendar + $300",
      deadline: "2024-08-30T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      status: "submitted",
      progress: 100,
    },
    {
      id: "3",
      title: "Weekly Giveaway",
      description:
        "Enter our weekly giveaway for a chance to win the latest tech gadgets. This week we're giving away the newest smartphone model that hasn't even hit the stores yet!",
      short_description: "Enter for a chance to win the latest tech gadgets.",
      category: "Technology",
      type: "Luck",
      entry_requirements: "Email, Social Media",
      prize: "Latest Smartphone",
      deadline: "2024-08-10T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      status: "reviewing",
      progress: 100,
    },
  ];
}
