// Database types for Supabase
// These match the database schema exactly (snake_case)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin';

export type IdeaStatus =
  | 'submitted'
  | 'approved'
  | 'prd_development'
  | 'prototype_complete'
  | 'rejected';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ideas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          problem: string;
          solution: string;
          impact: string;
          enhanced_problem: string | null;
          enhanced_solution: string | null;
          enhanced_impact: string | null;
          status: IdeaStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          problem: string;
          solution: string;
          impact: string;
          enhanced_problem?: string | null;
          enhanced_solution?: string | null;
          enhanced_impact?: string | null;
          status?: IdeaStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          problem?: string;
          solution?: string;
          impact?: string;
          enhanced_problem?: string | null;
          enhanced_solution?: string | null;
          enhanced_impact?: string | null;
          status?: IdeaStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ideas_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      idea_status: IdeaStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// TypeScript types for application use (camelCase where needed)
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// Idea types
export type Idea = Database['public']['Tables']['ideas']['Row'];
export type IdeaInsert = Database['public']['Tables']['ideas']['Insert'];
export type IdeaUpdate = Database['public']['Tables']['ideas']['Update'];

// Input types for service layer (user-facing, doesn't include user_id)
export interface CreateIdeaInput {
  title: string;
  problem: string;
  solution: string;
  impact: string;
  enhanced_problem?: string;
  enhanced_solution?: string;
  enhanced_impact?: string;
}

export interface UpdateIdeaInput {
  title?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  enhanced_problem?: string;
  enhanced_solution?: string;
  enhanced_impact?: string;
  status?: IdeaStatus;
}

// PRD types
export type PrdStatus = 'draft' | 'complete';

export type MessageRole = 'user' | 'assistant';

export type PrdSectionStatus = 'empty' | 'in_progress' | 'complete';

export interface PrdSection {
  content: string;
  status: PrdSectionStatus;
}

export interface PrdContent {
  problemStatement?: PrdSection;
  goalsAndMetrics?: PrdSection;
  userStories?: PrdSection;
  requirements?: PrdSection;
  technicalConsiderations?: PrdSection;
  risks?: PrdSection;
  timeline?: PrdSection;
}

export interface PrdDocument {
  id: string;
  idea_id: string;
  user_id: string;
  content: PrdContent;
  status: PrdStatus;
  created_at: string;
  updated_at: string;
}

export interface PrdMessage {
  id: string;
  prd_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface CreatePrdInput {
  idea_id: string;
  content?: PrdContent;
}

export interface UpdatePrdInput {
  content?: PrdContent;
  status?: PrdStatus;
}

export interface CreateMessageInput {
  prd_id: string;
  role: MessageRole;
  content: string;
}
