import { Competition } from "@/types/competition";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, X } from "lucide-react";
import { format } from "date-fns";

interface CompetitionDetailDrawerProps {
  competition: Competition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompetitionDetailDrawer({
  competition,
  open,
  onOpenChange,
}: CompetitionDetailDrawerProps) {
  if (!competition) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] overflow-auto">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <div className="flex justify-between items-start">
              <div>
                <DrawerTitle className="text-2xl font-bold">
                  {competition.title}
                </DrawerTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{competition.category}</Badge>
                  <Badge>{competition.type}</Badge>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription className="mt-2">
              {competition.short_description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
            <div className="mb-6">
              <img
                src={
                  competition.image_url ||
                  "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&q=80"
                }
                alt={competition.title}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  About this Competition
                </h3>
                <p className="text-muted-foreground">
                  {competition.description}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  <span className="font-medium">Prize</span>
                </div>
                <span>{competition.prize}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-medium">Deadline</span>
                </div>
                <span>{formatDate(competition.deadline)}</span>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Entry Requirements
                </h3>
                <div className="p-3 bg-muted rounded-md">
                  <p>{competition.entry_requirements}</p>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button className="w-full">Enter Competition</Button>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
