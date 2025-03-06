export interface Competition {
  id: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  type: "Luck" | "Skill";
  entry_requirements: string;
  prize: string;
  deadline: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}
