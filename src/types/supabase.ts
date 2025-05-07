
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
          subject: string
          max_periods: number
          department: string
          section: string
          year: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          max_periods?: number
          department: string
          section: string
          year: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string
          max_periods?: number
          department?: string
          section?: string
          year?: string
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          code: string
          title: string
          type: 'Theory' | 'Lab' | 'Activity'
          periods_per_week: number
          assigned_staff_id: string | null
          is_continuous: boolean
          department: string
          section: string
          year: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          type: 'Theory' | 'Lab' | 'Activity'
          periods_per_week: number
          assigned_staff_id?: string | null
          is_continuous?: boolean
          department: string
          section: string
          year: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          type?: 'Theory' | 'Lab' | 'Activity'
          periods_per_week?: number
          assigned_staff_id?: string | null
          is_continuous?: boolean
          department?: string
          section?: string
          year?: string
          created_at?: string
        }
      }
      substitutions: {
        Row: {
          id: string
          date: string
          period: number
          absent_staff_id: string
          substitute_staff_id: string
          reason: string | null
          department: string
          section: string
          year: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          period: number
          absent_staff_id: string
          substitute_staff_id: string
          reason?: string | null
          department: string
          section: string
          year: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          period?: number
          absent_staff_id?: string
          substitute_staff_id?: string
          reason?: string | null
          department?: string
          section?: string
          year?: string
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
          department: string
          section: string
          year: string
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
          department: string
          section: string
          year: string
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
          department?: string
          section?: string
          year?: string
        }
      }
      notifications_read: {
        Row: {
          id: string
          notification_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          notification_id: string
          user_id: string
          read_at: string
        }
        Update: {
          id?: string
          notification_id?: string
          user_id?: string
          read_at?: string
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
