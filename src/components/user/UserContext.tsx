import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Competition } from "@/types/competition";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";

interface UserStats {
  competitionsJoined: number;
  competitionsWon: number;
  savedCompetitions: number;
}

interface UserContextType {
  savedCompetitions: Competition[];
  activeParticipations: (Competition & { status: string; progress: number })[];
  pastParticipations: (Competition & { result: string; position?: number })[];
  userStats: UserStats;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  saveCompetition: (competitionId: string) => Promise<void>;
  unsaveCompetition: (competitionId: string) => Promise<void>;
  enterCompetition: (competitionId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [savedCompetitions, setSavedCompetitions] = useState<Competition[]>([]);
  const [activeParticipations, setActiveParticipations] = useState<
    (Competition & { status: string; progress: number })[]
  >([]);
  const [pastParticipations, setPastParticipations] = useState<
    (Competition & { result: string; position?: number })[]
  >([]);
  const [userStats, setUserStats] = useState<UserStats>({
    competitionsJoined: 0,
    competitionsWon: 0,
    savedCompetitions: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      refreshUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const refreshUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get_user_dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setSavedCompetitions(data.savedCompetitions || []);
      setActiveParticipations(data.activeParticipations || []);
      setPastParticipations(data.pastParticipations || []);
      setUserStats(
        data.stats || {
          competitionsJoined: 0,
          competitionsWon: 0,
          savedCompetitions: 0,
        },
      );
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Use mock data as fallback
      setSavedCompetitions([]);
      setActiveParticipations([]);
      setPastParticipations([]);
      setUserStats({
        competitionsJoined: 0,
        competitionsWon: 0,
        savedCompetitions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCompetition = async (competitionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("saved_competitions").insert({
        user_id: user.id,
        competition_id: competitionId,
      });

      if (error) throw error;

      toast({
        title: "Competition saved",
        description: "The competition has been added to your saved list",
      });

      await refreshUserData();
    } catch (error) {
      console.error("Error saving competition:", error);
      toast({
        title: "Error",
        description: "Failed to save the competition",
        variant: "destructive",
      });
    }
  };

  const unsaveCompetition = async (competitionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("saved_competitions")
        .delete()
        .eq("user_id", user.id)
        .eq("competition_id", competitionId);

      if (error) throw error;

      toast({
        title: "Competition removed",
        description: "The competition has been removed from your saved list",
      });

      await refreshUserData();
    } catch (error) {
      console.error("Error removing saved competition:", error);
      toast({
        title: "Error",
        description: "Failed to remove the competition",
        variant: "destructive",
      });
    }
  };

  const enterCompetition = async (competitionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("competition_participants").insert({
        user_id: user.id,
        competition_id: competitionId,
        status: "pending",
        progress: 0,
      });

      if (error) throw error;

      toast({
        title: "Competition entered",
        description: "You have successfully entered the competition",
      });

      await refreshUserData();
    } catch (error) {
      console.error("Error entering competition:", error);
      toast({
        title: "Error",
        description: "Failed to enter the competition",
        variant: "destructive",
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        savedCompetitions,
        activeParticipations,
        pastParticipations,
        userStats,
        loading,
        refreshUserData,
        saveCompetition,
        unsaveCompetition,
        enterCompetition,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
}
