
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'staff' | 'student'
          department: string | null
          section: string | null
          year: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'admin' | 'staff' | 'student'
          department?: string | null
          section?: string | null
          year?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'staff' | 'student'
          department?: string | null
          section?: string | null
          year?: string | null
          created_at?: string
        }
      }
      timetables: {
        Row: {
          id: string
          year: string
          department: string
          section: string
          status: 'draft' | 'confirmed'
          grid: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: string
          department: string
          section: string
          status: 'draft' | 'confirmed'
          grid: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: string
          department?: string
          section?: string
          status?: 'draft' | 'confirmed'
          grid?: Json
          created_at?: string
          updated_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          name: string
          email: string
          load: number
          assigned_sections: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          load?: number
          assigned_sections?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          load?: number
          assigned_sections?: string[]
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          type: 'Theory' | 'Lab'
          weekly_periods: number
          assigned_staff: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          type: 'Theory' | 'Lab'
          weekly_periods: number
          assigned_staff?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          type?: 'Theory' | 'Lab'
          weekly_periods?: number
          assigned_staff?: string | null
          created_at?: string
        }
      }
      substitutions: {
        Row: {
          id: string
          section_id: string
          date: string
          period: number
          absent_staff: string
          substitute_staff: string
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          date: string
          period: number
          absent_staff: string
          substitute_staff: string
          created_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          date?: string
          period?: number
          absent_staff?: string
          substitute_staff?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          section_id: string
          message: string
          sent_by: string
          schedule_time: string
          recipients: string[]
          created_at: string
          type: 'general' | 'alert' | 'timetable'
        }
        Insert: {
          id?: string
          section_id: string
          message: string
          sent_by: string
          schedule_time: string
          recipients: string[]
          created_at?: string
          type: 'general' | 'alert' | 'timetable'
        }
        Update: {
          id?: string
          section_id?: string
          message?: string
          sent_by?: string
          schedule_time?: string
          recipients?: string[]
          created_at?: string
          type?: 'general' | 'alert' | 'timetable'
        }
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
  }
}
