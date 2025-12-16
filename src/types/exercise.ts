export interface Exercise {
  id: string
  name: string
  category?: string | null
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
  equipment?: string[] | null
  muscle_groups?: string[] | null
  description?: string | null
  video_url?: string | null
  created_at?: string
}
