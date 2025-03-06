import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Clock } from "lucide-react";
import CompetitionDirectory from "../competitions/CompetitionDirectory";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { supabase } from "../../../supabase/supabase";
import { Competition } from "@/types/competition";
import { useAuth } from "../../../supabase/auth";

export default function CompetitionsPage() {
  const [activeCompetitions, setActiveCompetitions] = useState<Competition[]>(
    [],
  );
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<
    Competition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("deadline", { ascending: true });

      if (error) throw error;

      if (data) {
        const now = new Date();
        const active: Competition[] = [];
        const past: Competition[] = [];
        const upcoming: Competition[] = [];

        data.forEach((comp) => {
          const deadline = new Date(comp.deadline);
          // Active competitions: deadline is in the future but within 30 days
          if (
            deadline > now &&
            deadline <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          ) {
            active.push(comp);
          }
          // Past competitions: deadline has passed
          else if (deadline < now) {
            past.push(comp);
          }
          // Upcoming competitions: deadline is more than 30 days in the future
          else {
            upcoming.push(comp);
          }
        });

        setActiveCompetitions(active);
        setPastCompetitions(past);
        setUpcomingCompetitions(upcoming);
      }
    } catch (error) {
      console.error("Error fetching competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = (competitionId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Navigate to competition detail/participation page
    navigate(`/competition/${competitionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl font-bold mb-4">Competitions</h1>
            <p className="text-lg text-muted-foreground">
              Discover and participate in exciting competitions across various
              categories.
            </p>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid grid-cols-3 w-[400px]">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Active
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" /> Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Past
                </TabsTrigger>
              </TabsList>

              {user && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  My Submissions
                </Button>
              )}
            </div>

            <TabsContent value="active" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading active competitions...</p>
                </div>
              ) : activeCompetitions.length > 0 ? (
                <CompetitionDirectory
                  initialCompetitions={activeCompetitions}
                  onParticipate={handleParticipate}
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    No active competitions
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    There are no active competitions at the moment. Check back
                    soon or explore upcoming competitions.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.querySelector('[data-value="upcoming"]')?.click()
                    }
                  >
                    View Upcoming
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading upcoming competitions...</p>
                </div>
              ) : upcomingCompetitions.length > 0 ? (
                <CompetitionDirectory
                  initialCompetitions={upcomingCompetitions}
                  onParticipate={handleParticipate}
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    No upcoming competitions
                  </h3>
                  <p className="text-muted-foreground">
                    There are no upcoming competitions scheduled at the moment.
                    Check back soon.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading past competitions...</p>
                </div>
              ) : pastCompetitions.length > 0 ? (
                <CompetitionDirectory
                  initialCompetitions={pastCompetitions}
                  onParticipate={handleParticipate}
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    No past competitions
                  </h3>
                  <p className="text-muted-foreground">
                    There are no past competitions to display at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
