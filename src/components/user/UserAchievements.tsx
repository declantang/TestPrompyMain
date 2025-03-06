import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Trophy, Star, Target, Award, Zap, Users, Flame } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: "participation" | "skill" | "social" | "special";
}

export default function UserAchievements() {
  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Competition",
      description: "Participated in your first competition",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      category: "participation",
    },
    {
      id: "2",
      title: "Competition Enthusiast",
      description: "Participated in 5 competitions",
      icon: <Flame className="h-8 w-8 text-orange-500" />,
      progress: 5,
      maxProgress: 5,
      unlocked: true,
      category: "participation",
    },
    {
      id: "3",
      title: "Competition Master",
      description: "Participated in 10 competitions",
      icon: <Star className="h-8 w-8 text-purple-500" />,
      progress: 8,
      maxProgress: 10,
      unlocked: false,
      category: "participation",
    },
    {
      id: "4",
      title: "First Win",
      description: "Won your first competition",
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      category: "skill",
    },
    {
      id: "5",
      title: "Winning Streak",
      description: "Won 3 competitions in a row",
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      progress: 2,
      maxProgress: 3,
      unlocked: false,
      category: "skill",
    },
    {
      id: "6",
      title: "Social Butterfly",
      description: "Referred 5 friends to the platform",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      category: "social",
    },
    {
      id: "7",
      title: "Perfect Submission",
      description: "Received a perfect score on a submission",
      icon: <Target className="h-8 w-8 text-green-500" />,
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      category: "skill",
    },
  ];

  const achievementsByCategory = {
    participation: achievements.filter((a) => a.category === "participation"),
    skill: achievements.filter((a) => a.category === "skill"),
    social: achievements.filter((a) => a.category === "social"),
    special: achievements.filter((a) => a.category === "special"),
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-primary/10 p-3 rounded-full">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {unlockedCount} of {totalCount} Achievements Unlocked
                </h3>
                <p className="text-sm text-muted-foreground">
                  Keep participating to unlock more achievements!
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-8">
            {/* Participation Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" /> Participation
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsByCategory.participation.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>

            {/* Skill Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" /> Skill Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsByCategory.skill.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>

            {/* Social Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Social Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsByCategory.social.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>

            {/* Special Achievements */}
            {achievementsByCategory.special.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" /> Special
                  Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievementsByCategory.special.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progressPercentage =
    (achievement.progress / achievement.maxProgress) * 100;

  return (
    <Card
      className={`border ${achievement.unlocked ? "border-primary/50 bg-primary/5" : "border-muted bg-card"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-2 rounded-full ${achievement.unlocked ? "bg-primary/20" : "bg-muted"}`}
          >
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">{achievement.title}</h4>
              {achievement.unlocked && (
                <Badge className="bg-primary/90">Unlocked</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {achievement.description}
            </p>

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>
                  Progress: {achievement.progress}/{achievement.maxProgress}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
