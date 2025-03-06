import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import CompetitionCard from "./CompetitionCard";
import CompetitionFilters, { FilterOptions } from "./CompetitionFilters";
import CompetitionDetailDrawer from "./CompetitionDetailDrawer";
import { Competition } from "@/types/competition";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function CompetitionDirectory() {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<
    Competition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [seedingData, setSeedingData] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    categories: [],
    types: [],
    requirements: [],
  });

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCompetitions(data);
        setFilteredCompetitions(data);
      } else {
        // If no data is available, try to seed the database
        await seedCompetitionsData();
      }
    } catch (error) {
      console.error("Error fetching competitions:", error);
      // If no data is available, use mock data
      const mockData = getMockCompetitions();
      setCompetitions(mockData);
      setFilteredCompetitions(mockData);
    } finally {
      setLoading(false);
    }
  };

  const seedCompetitionsData = async () => {
    try {
      setSeedingData(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed_competitions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Data seeded successfully",
          description: "Sample competitions have been added to the database.",
        });
        // Fetch the newly seeded data
        const { data } = await supabase
          .from("competitions")
          .select("*")
          .order("created_at", { ascending: false });

        if (data) {
          setCompetitions(data);
          setFilteredCompetitions(data);
        }
      } else {
        // If seeding failed or returned a message, use mock data
        const mockData = getMockCompetitions();
        setCompetitions(mockData);
        setFilteredCompetitions(mockData);
      }
    } catch (error) {
      console.error("Error seeding competitions:", error);
      const mockData = getMockCompetitions();
      setCompetitions(mockData);
      setFilteredCompetitions(mockData);
    } finally {
      setSeedingData(false);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);

    let filtered = [...competitions];

    // Apply search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          comp.title.toLowerCase().includes(searchLower) ||
          comp.description.toLowerCase().includes(searchLower) ||
          comp.short_description.toLowerCase().includes(searchLower),
      );
    }

    // Apply category filter
    if (newFilters.categories.length > 0) {
      filtered = filtered.filter((comp) =>
        newFilters.categories.includes(comp.category),
      );
    }

    // Apply type filter
    if (newFilters.types.length > 0) {
      filtered = filtered.filter((comp) =>
        newFilters.types.includes(comp.type),
      );
    }

    // Apply requirements filter
    if (newFilters.requirements.length > 0) {
      filtered = filtered.filter((comp) =>
        newFilters.requirements.some((req) =>
          comp.entry_requirements.includes(req),
        ),
      );
    }

    setFilteredCompetitions(filtered);
  };

  const handleCompetitionClick = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDrawerOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Competition Directory</h1>
        <div className="flex gap-2">
          <Button
            variant={layout === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CompetitionFilters onFilterChange={handleFilterChange} />

      {loading || seedingData ? (
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>
            {seedingData
              ? "Setting up sample competitions..."
              : "Loading competitions..."}
          </p>
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No competitions found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later for new competitions.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${layout === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredCompetitions.map((competition) => (
            <div
              key={competition.id}
              onClick={() => handleCompetitionClick(competition)}
              className="cursor-pointer"
            >
              <CompetitionCard competition={competition} layout={layout} />
            </div>
          ))}
        </div>
      )}

      <CompetitionDetailDrawer
        competition={selectedCompetition}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

// Mock data function for initial development or when database is empty
function getMockCompetitions(): Competition[] {
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
      deadline: "2024-09-05T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    },
    {
      id: "5",
      title: "Marketing Strategy Contest",
      description:
        "Develop an innovative marketing strategy for our new product launch. We're looking for fresh ideas that will help us reach new audiences and create buzz around our upcoming release.",
      short_description:
        "Create a marketing strategy for our new product launch.",
      category: "Marketing",
      type: "Skill",
      entry_requirements: "Free, Email",
      prize: "$750 Cash Prize",
      deadline: "2024-09-20T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80",
    },
    {
      id: "6",
      title: "Monthly Sweepstakes",
      description:
        "Enter our monthly sweepstakes for a chance to win a luxury weekend getaway for two. Prize includes flights, 5-star hotel accommodation, and spending money.",
      short_description: "Win a luxury weekend getaway for two.",
      category: "Travel",
      type: "Luck",
      entry_requirements: "Purchase, Email",
      prize: "Weekend Getaway ($2000 value)",
      deadline: "2024-08-31T23:59:59Z",
      image_url:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    },
  ];
}
