export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'admin' | 'manager' | 'operator'
          joined_at: string
          invited_by: string | null
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: 'admin' | 'manager' | 'operator'
          joined_at?: string
          invited_by?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'operator'
          joined_at?: string
          invited_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      telegram_sessions: {
        Row: {
          id: string
          user_id: string
          team_id: string
          phone_number: string
          session_name: string
          encrypted_session: string
          is_active: boolean
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          phone_number: string
          session_name: string
          encrypted_session: string
          is_active?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          phone_number?: string
          session_name?: string
          encrypted_session?: string
          is_active?: boolean
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          team_id: string
          created_by: string
          status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
          message_template: string
          target_groups: Json
          schedule_config: Json | null
          progress: Json | null
          created_at: string
          updated_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          team_id: string
          created_by: string
          status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
          message_template: string
          target_groups: Json
          schedule_config?: Json | null
          progress?: Json | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          team_id?: string
          created_by?: string
          status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
          message_template?: string
          target_groups?: Json
          schedule_config?: Json | null
          progress?: Json | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: {
          id: string
          name: string
          username: string | null
          telegram_id: string
          type: 'channel' | 'group' | 'supergroup'
          member_count: number | null
          team_id: string
          added_by: string
          is_active: boolean
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          username?: string | null
          telegram_id: string
          type: 'channel' | 'group' | 'supergroup'
          member_count?: number | null
          team_id: string
          added_by: string
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string | null
          telegram_id?: string
          type?: 'channel' | 'group' | 'supergroup'
          member_count?: number | null
          team_id?: string
          added_by?: string
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'operator'
      campaign_status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'
      group_type: 'channel' | 'group' | 'supergroup'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
