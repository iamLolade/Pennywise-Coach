/**
 * Supabase database types
 * 
 * These types match the database schema in Supabase.
 */

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string; // Auth user ID
          income_range: string;
          goals: string[];
          concerns: string[];
          currency: string;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          income_range: string;
          goals: string[];
          concerns: string[];
          currency?: string;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          income_range?: string;
          goals?: string[];
          concerns?: string[];
          currency?: string;
          onboarding_complete?: boolean;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          date: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: string;
          date: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: string;
          date?: string;
          description?: string;
        };
      };
    };
  };
}
