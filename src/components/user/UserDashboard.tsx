import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../../../supabase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, Clock, Star, Award, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SavedCompetitions from "./SavedCompetitions";
import ParticipatedCompetitions from "./ParticipatedCompetitions";
import PastCompetitions from "./PastCompetitions";
import UserAchievements from "./UserAchievements";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Please Sign In</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              You need to be signed in to view your dashboard
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt={user.email || ""}
                  />
                  <AvatarFallback>
                    {user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {user.user_metadata?.full_name || "User"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {user.email}
                </p>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge
                    variant="secondary"
                    className="flex gap-1 items-center"
                  >
                    <Trophy className="h-3 w-3" /> Competitor
                  </Badge>
                  <Badge variant="outline" className="flex gap-1 items-center">
                    <Star className="h-3 w-3" /> 5 Competitions
                  </Badge>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Competitions Joined</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Competitions Won</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Saved Competitions</span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              defaultValue="profile"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
                <TabsTrigger
                  value="profile"
                  className="flex gap-2 items-center"
                >
                  <Award className="h-4 w-4" />
                  <span className="hidden md:inline">Achievements</span>
                  <span className="md:hidden">Achieve</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex gap-2 items-center">
                  <Heart className="h-4 w-4" />
                  <span className="hidden md:inline">Saved</span>
                  <span className="md:hidden">Saved</span>
                </TabsTrigger>
                <TabsTrigger
                  value="participated"
                  className="flex gap-2 items-center"
                >
                  <Trophy className="h-4 w-4" />
                  <span className="hidden md:inline">Participating</span>
                  <span className="md:hidden">Active</span>
                </TabsTrigger>
                <TabsTrigger value="past" className="flex gap-2 items-center">
                  <Clock className="h-4 w-4" />
                  <span className="hidden md:inline">Past Competitions</span>
                  <span className="md:hidden">Past</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <UserAchievements />
              </TabsContent>

              <TabsContent value="saved">
                <SavedCompetitions />
              </TabsContent>

              <TabsContent value="participated">
                <ParticipatedCompetitions />
              </TabsContent>

              <TabsContent value="past">
                <PastCompetitions />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
