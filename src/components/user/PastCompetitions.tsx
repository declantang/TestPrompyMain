import { useState, useEffect } from "react";
import { Competition } from "@/types/competition";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2, Medal } from "lucide-react";
import { format } from "date-fns";

interface PastCompetition extends Competition {
  result: "winner" | "runner-up" | "participant" | "disqualified";
  position?: number;
}

export default function PastCompetitions() {
  const [pastCompetitions, setPastCompetitions] = useState<PastCompetition[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPastCompetitions();
    }
  }, [user]);

  const fetchPastCompetitions = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual past competitions from the database
      // For now, we'll use mock data
      const { data: competitions } = await supabase
        .from("competitions")
        .select("*")
        .limit(4);

      if (competitions) {
        // Add result status to each competition
        const pastComps = competitions.map((comp) => ({
          ...comp,
          result: getRandomResult(),
          position: Math.floor(Math.random() * 10) + 1,
        }));
        setPastCompetitions(pastComps);
      } else {
        setPastCompetitions(getMockPastCompetitions());
      }
    } catch (error) {
      console.error("Error fetching past competitions:", error);
      // Fallback to mock data
      setPastCompetitions(getMockPastCompetitions());
    } finally {
      setLoading(false);
    }
  };

  const getRandomResult = () => {
    const results = ["winner", "runner-up", "participant", "disqualified"];
    return results[
      Math.floor(Math.random() * results.length)
    ] as PastCompetition["result"];
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getResultBadge = (
    result: PastCompetition["result"],
    position?: number,
  ) => {
    switch (result) {
      case "winner":
        return (
          <Badge className="bg-yellow-400 text-yellow-900">🏆 Winner</Badge>
        );
      case "runner-up":
        return (
          <Badge className="bg-slate-300 text-slate-900">🥈 Runner-up</Badge>
        );
      case "participant":
        return (
          <Badge variant="outline">
            Participant{" "}
            {position ? `(${position}${getOrdinalSuffix(position)})` : ""}
          </Badge>
        );
      case "disqualified":
        return <Badge variant="destructive">Disqualified</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pastCompetitions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Clock className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No past competitions</h3>
          <p className="text-muted-foreground text-center mb-4">
            You haven't participated in any competitions yet. Browse
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
      {pastCompetitions.map((competition) => (
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
                      {getResultBadge(competition.result, competition.position)}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Ended: {formatDate(competition.deadline)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground my-2">
                  {competition.short_description}
                </p>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm font-medium">
                  Prize: {competition.prize}
                </div>
                <div className="flex gap-2">
                  {competition.result === "winner" && (
                    <Button size="sm">
                      <Medal className="h-4 w-4 mr-1" /> Claim Prize
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Results
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
function getMockPastCompetitions(): PastCompetition[] {
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
      deadline: "2023-09-15T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      result: "winner",
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
      deadline: "2023-08-30T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      result: "runner-up",
      position: 2,
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
      deadline: "2023-08-10T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      result: "participant",
      position: 5,
    },
    {
      id: "4",
      title: "Content Writing Challenge",
      description:
        "Write a compelling blog post on the future of artificial intelligence. The winning entry will be published on our blog with full attribution and the writer will receive a cash prize.",
      short_description:
        "Write about AI and get published on our popular blog.",
      category: "Writing",
      type: "Skill",
      entry_requirements: "Free, Email",
      prize: "$400 + Publication",
      deadline: "2023-07-05T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      result: "disqualified",
    },
  ];
}
