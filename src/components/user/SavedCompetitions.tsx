import { useState, useEffect } from "react";
import { Competition } from "@/types/competition";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function SavedCompetitions() {
  const [savedCompetitions, setSavedCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSavedCompetitions();
    }
  }, [user]);

  const fetchSavedCompetitions = async () => {
    setLoading(true);
    try {
      // This would be replaced with actual saved competitions from the database
      // For now, we'll use mock data
      const { data: competitions } = await supabase
        .from("competitions")
        .select("*")
        .limit(5);

      setSavedCompetitions(competitions || []);
    } catch (error) {
      console.error("Error fetching saved competitions:", error);
      // Fallback to mock data
      setSavedCompetitions(getMockSavedCompetitions());
    } finally {
      setLoading(false);
    }
  };

  const removeSavedCompetition = (id: string) => {
    // This would remove the competition from saved list in the database
    setSavedCompetitions(savedCompetitions.filter((comp) => comp.id !== id));
    toast({
      title: "Competition removed",
      description: "The competition has been removed from your saved list",
    });
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (savedCompetitions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No saved competitions</h3>
          <p className="text-muted-foreground text-center mb-4">
            You haven't saved any competitions yet. Browse competitions and save
            the ones you're interested in.
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
      {savedCompetitions.map((competition) => (
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
                    <Badge variant="outline" className="mt-1">
                      {competition.category}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(competition.deadline)}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSavedCompetition(competition.id)}
                  >
                    <Heart className="h-4 w-4 mr-1 fill-current" /> Unsave
                  </Button>
                  <Button size="sm">View Details</Button>
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
function getMockSavedCompetitions(): Competition[] {
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
    },
  ];
}
