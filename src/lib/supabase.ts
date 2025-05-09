import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Use the correct Supabase URL and anon key from your project
const supabaseUrl = 'https://sfdfdsodsqqttvvqeuua.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZGZkc29kc3FxdHR2dnFldXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1OTMzNDcsImV4cCI6MjA2MjE2OTM0N30.k1riP_FEcwZm5R8NbAdW2EojcMBE__iknyAfLAlu9ag';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

// Helper functions for common operations
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Session management
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Subscribe to auth changes
export const onAuthStateChange = (callback: (session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  
  return subscription;
};

// Staff management functions
export const getStaffBySection = async (year: string, dept: string, section: string) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('year', year)
    .eq('department', dept)
    .eq('section', section)

  if (error) {
    console.error('Error fetching staff:', error)
    return []
  }

  return data || []
}

export const addStaff = async (staffObj: any) => {
  const { data, error } = await supabase.from('staff').insert([staffObj])
  
  if (error) {
    console.error('Error adding staff:', error)
    throw error
  }
  
  return data
}

export const updateStaff = async (id: string, updatedFields: any) => {
  const { data, error } = await supabase
    .from('staff')
    .update(updatedFields)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating staff:', error)
    throw error
  }
  
  return data
}

export const deleteStaff = async (id: string) => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting staff:', error)
    throw error
  }
  
  return true
}

// Subject management functions
export const getSubjectsBySection = async (year: string, dept: string, section: string) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('year', year)
    .eq('dept', dept)
    .eq('section', section)

  if (error) {
    console.error('Error fetching subjects:', error)
    return []
  }

  return data || []
}

export const addSubject = async (subjectObj: any) => {
  const { data, error } = await supabase.from('subjects').insert([subjectObj])
  
  if (error) {
    console.error('Error adding subject:', error)
    throw error
  }
  
  return data
}

export const updateSubject = async (id: string, updatedFields: any) => {
  const { data, error } = await supabase
    .from('subjects')
    .update(updatedFields)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating subject:', error)
    throw error
  }
  
  return data
}

export const deleteSubject = async (id: string) => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting subject:', error)
    throw error
  }
  
  return true
}

// Timetable management functions
export const getTimetableBySection = async (year: string, dept: string, section: string, status: 'Draft' | 'Master' = 'Master') => {
  const { data, error } = await supabase
    .from('timetables')
    .select('*')
    .eq('year', year)
    .eq('dept', dept)
    .eq('section', section)
    .eq('status', status)
    .single()

  if (error && error.code !== 'PGSQL_ERROR_NO_ROWS') {
    console.error('Error fetching timetable:', error)
    return null
  }

  return data || null
}

export const saveTimetable = async (timetableObj: any) => {
  // Check if timetable already exists
  const { data: existingTimetable, error: fetchError } = await supabase
    .from('timetables')
    .select('id')
    .eq('year', timetableObj.year)
    .eq('dept', timetableObj.dept)
    .eq('section', timetableObj.section)
    .eq('status', timetableObj.status)
    .single()
  
  if (fetchError && fetchError.code !== 'PGSQL_ERROR_NO_ROWS') {
    console.error('Error checking for existing timetable:', fetchError)
    throw fetchError
  }
  
  if (existingTimetable) {
    // Update existing timetable
    const { data, error } = await supabase
      .from('timetables')
      .update({
        grid: timetableObj.grid,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingTimetable.id)
    
    if (error) {
      console.error('Error updating timetable:', error)
      throw error
    }
    
    return data
  } else {
    // Insert new timetable
    const { data, error } = await supabase.from('timetables').insert([{
      ...timetableObj,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    
    if (error) {
      console.error('Error saving timetable:', error)
      throw error
    }
    
    return data
  }
}

export const promoteToMaster = async (id: string) => {
  const { data, error } = await supabase
    .from('timetables')
    .update({ status: 'Master', updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    console.error('Error promoting timetable to master:', error)
    throw error
  }
  
  return data
}

// Substitution management functions
export const getSubstitutionsBySection = async (year: string, dept: string, section: string, date?: string) => {
  let query = supabase
    .from('substitutions')
    .select('*')
    .eq('year', year)
    .eq('dept', dept)
    .eq('section', section)
  
  if (date) {
    query = query.eq('date', date)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching substitutions:', error)
    return []
  }
  
  return data || []
}

export const addSubstitution = async (substitutionObj: any) => {
  const { data, error } = await supabase
    .from('substitutions')
    .insert([{
      ...substitutionObj,
      created_at: new Date().toISOString()
    }])
  
  if (error) {
    console.error('Error adding substitution:', error)
    throw error
  }
  
  return data
}

export const updateSubstitution = async (id: string, updatedFields: any) => {
  const { data, error } = await supabase
    .from('substitutions')
    .update(updatedFields)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating substitution:', error)
    throw error
  }
  
  return data
}

export const deleteSubstitution = async (id: string) => {
  const { error } = await supabase
    .from('substitutions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting substitution:', error)
    throw error
  }
  
  return true
}

// Notification management functions
export const getNotificationsBySection = async (year: string, dept: string, section: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('year', year)
    .eq('dept', dept)
    .eq('section', section)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  
  return data || []
}

export const addNotification = async (notificationObj: any) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      ...notificationObj,
      created_at: new Date().toISOString()
    }])
  
  if (error) {
    console.error('Error adding notification:', error)
    throw error
  }
  
  return data
}

export const markNotificationAsRead = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('notifications_read')
    .insert([{
      notification_id: id,
      user_id: userId,
      read_at: new Date().toISOString()
    }])
  
  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
  
  return true
}
