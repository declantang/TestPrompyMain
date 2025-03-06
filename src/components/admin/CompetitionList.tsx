import { useState, useEffect } from "react";
import { Competition } from "@/types/competition";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Edit,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Archive,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";

interface CompetitionListProps {
  onEdit: (competition: Competition) => void;
  onRefresh: () => void;
}

export default function CompetitionList({
  onEdit,
  onRefresh,
}: CompetitionListProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
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
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCompetitions(data || []);
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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("competitions")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Competition deleted",
        description: "The competition has been deleted successfully.",
      });

      // Refresh the list
      fetchCompetitions();
      onRefresh();
    } catch (error) {
      console.error("Error deleting competition:", error);
      toast({
        title: "Error",
        description: "Failed to delete competition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveId) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("competitions")
        .update({ status: "archived" })
        .eq("id", archiveId);

      if (error) throw error;

      toast({
        title: "Competition archived",
        description: "The competition has been archived successfully.",
      });

      // Refresh the list
      fetchCompetitions();
      onRefresh();
    } catch (error) {
      console.error("Error archiving competition:", error);
      toast({
        title: "Error",
        description: "Failed to archive competition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setArchiveId(null);
      setActionLoading(false);
    }
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Prize</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No competitions found. Create your first competition!
                </TableCell>
              </TableRow>
            ) : (
              competitions.map((competition) => (
                <TableRow key={competition.id}>
                  <TableCell className="font-medium">
                    {competition.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{competition.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        competition.type === "Skill" ? "default" : "secondary"
                      }
                    >
                      {competition.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(competition.deadline)}</TableCell>
                  <TableCell>{competition.prize}</TableCell>
                  <TableCell>
                    {competition.status ? (
                      <Badge
                        variant={
                          competition.status === "archived"
                            ? "outline"
                            : competition.status === "completed"
                              ? "success"
                              : "default"
                        }
                      >
                        {competition.status.charAt(0).toUpperCase() +
                          competition.status.slice(1)}
                      </Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(competition)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setArchiveId(competition.id)}
                          disabled={
                            competition.status === "archived" ||
                            competition.status === "completed"
                          }
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(competition.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/" target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              competition and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!archiveId} onOpenChange={() => setArchiveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this competition?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the competition from the main listing but keep it
              in the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                "Archive"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
