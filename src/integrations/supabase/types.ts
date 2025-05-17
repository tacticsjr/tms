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
      notifications: {
        Row: {
          created_at: string | null
          department: string
          id: string
          message: string
          recipients: string[]
          schedule_time: string
          section: string
          section_id: string
          sent_by: string
          type: string
          year: string
        }
        Insert: {
          created_at?: string | null
          department: string
          id?: string
          message: string
          recipients: string[]
          schedule_time: string
          section: string
          section_id: string
          sent_by: string
          type: string
          year: string
        }
        Update: {
          created_at?: string | null
          department?: string
          id?: string
          message?: string
          recipients?: string[]
          schedule_time?: string
          section?: string
          section_id?: string
          sent_by?: string
          type?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_read: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_read_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string | null
          department: string
          email: string
          id: string
          max_periods: number | null
          name: string
          section: string
          subject: string
          year: string
        }
        Insert: {
          created_at?: string | null
          department: string
          email: string
          id?: string
          max_periods?: number | null
          name: string
          section: string
          subject: string
          year: string
        }
        Update: {
          created_at?: string | null
          department?: string
          email?: string
          id?: string
          max_periods?: number | null
          name?: string
          section?: string
          subject?: string
          year?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          assigned_staff_id: string | null
          code: string
          created_at: string | null
          department: string
          id: string
          is_continuous: boolean | null
          periods_per_week: number
          section: string
          title: string
          type: string
          year: string
        }
        Insert: {
          assigned_staff_id?: string | null
          code: string
          created_at?: string | null
          department: string
          id?: string
          is_continuous?: boolean | null
          periods_per_week: number
          section: string
          title: string
          type: string
          year: string
        }
        Update: {
          assigned_staff_id?: string | null
          code?: string
          created_at?: string | null
          department?: string
          id?: string
          is_continuous?: boolean | null
          periods_per_week?: number
          section?: string
          title?: string
          type?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      substitutions: {
        Row: {
          absent_staff_id: string
          created_at: string | null
          date: string
          department: string
          id: string
          period: number
          reason: string | null
          section: string
          substitute_staff_id: string
          year: string
        }
        Insert: {
          absent_staff_id: string
          created_at?: string | null
          date: string
          department: string
          id?: string
          period: number
          reason?: string | null
          section: string
          substitute_staff_id: string
          year: string
        }
        Update: {
          absent_staff_id?: string
          created_at?: string | null
          date?: string
          department?: string
          id?: string
          period?: number
          reason?: string | null
          section?: string
          substitute_staff_id?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "substitutions_absent_staff_id_fkey"
            columns: ["absent_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_substitute_staff_id_fkey"
            columns: ["substitute_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          archived_at: string | null
          created_at: string
          department: string
          draft_id: string | null
          grid: Json
          id: string
          section: string
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          department: string
          draft_id?: string | null
          grid: Json
          id?: string
          section: string
          status: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          department?: string
          draft_id?: string | null
          grid?: Json
          id?: string
          section?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          id: string
          name: string
          role: string
          section: string | null
          year: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          name: string
          role: string
          section?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          section?: string | null
          year?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
