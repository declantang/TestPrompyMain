import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Info } from "lucide-react";
import { Competition } from "@/types/competition";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface CompetitionCardProps {
  competition: Competition;
  layout: "grid" | "list";
}

export default function CompetitionCard({
  competition,
  layout,
}: CompetitionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card
      className={`bg-white overflow-hidden transition-all duration-300 ${layout === "grid" ? "h-full" : "w-full"} hover:shadow-lg`}
    >
      <div className={`flex ${layout === "list" ? "flex-row" : "flex-col"}`}>
        <div className={`${layout === "list" ? "w-1/4" : "w-full"} relative`}>
          <img
            src={
              competition.image_url ||
              "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80"
            }
            alt={competition.title}
            className={`object-cover ${layout === "list" ? "h-full" : "h-48 w-full"}`}
          />
          <Badge className="absolute top-2 right-2 bg-primary/90">
            {competition.type}
          </Badge>
        </div>

        <div className={`${layout === "list" ? "w-3/4" : "w-full"}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
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
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground mb-2">
              {competition.short_description}
            </p>

            <div className="flex items-center text-sm mb-2">
              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="font-medium">{competition.prize}</span>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-slate-50 rounded-md mt-2">
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-sm">{competition.description}</p>

                    <h4 className="font-medium mt-3 mb-1">
                      Entry Requirements
                    </h4>
                    <p className="text-sm">{competition.entry_requirements}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              className="text-primary"
            >
              <Info className="h-4 w-4 mr-1" />
              {isExpanded ? "Less Info" : "More Info"}
            </Button>
            <Button size="sm">Enter Competition</Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
