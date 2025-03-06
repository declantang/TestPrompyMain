import { useState } from "react";
import AdminLayout from "../admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CompetitionList from "../admin/CompetitionList";
import CompetitionForm from "../admin/CompetitionForm";
import SubmissionApproval from "../admin/SubmissionApproval";
import WinnerSelection from "../admin/WinnerSelection";
import { Competition } from "@/types/competition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("competitions");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<
    Competition | undefined
  >(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateCompetition = () => {
    setEditingCompetition(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditCompetition = (competition: Competition) => {
    setEditingCompetition(competition);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AdminLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="winners">Winner Selection</TabsTrigger>
          </TabsList>

          {activeTab === "competitions" && (
            <Button onClick={handleCreateCompetition}>
              <Plus className="mr-2 h-4 w-4" /> New Competition
            </Button>
          )}
        </div>

        <TabsContent value="competitions" className="space-y-4">
          <CompetitionList
            onEdit={handleEditCompetition}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <SubmissionApproval />
        </TabsContent>

        <TabsContent value="winners" className="space-y-4">
          <WinnerSelection />
        </TabsContent>
      </Tabs>

      {/* Competition Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingCompetition
                ? "Edit Competition"
                : "Create New Competition"}
            </DialogTitle>
            <DialogDescription>
              {editingCompetition
                ? "Update the details of this competition"
                : "Fill in the details to create a new competition"}
            </DialogDescription>
          </DialogHeader>
          <CompetitionForm
            competition={editingCompetition}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
