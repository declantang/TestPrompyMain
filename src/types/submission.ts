export interface Submission {
  id: string;
  user_id: string;
  competition_id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}
