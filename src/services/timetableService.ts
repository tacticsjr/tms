
import { supabase } from '@/lib/supabase';
import { TimetableData, TimetableEntry } from '@/types/timetable';

export const getTimetableForSection = async (department: string, section: string) => {
  try {
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('department', department)
      .eq('section', section)
      .eq('status', 'confirmed')
      .single();
    
    if (error) throw error;
    
    // Check if data exists and has a grid property before accessing it
    return data && 'grid' in data ? data.grid as TimetableData : null;
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return null;
  }
};

export const getNotificationsForSection = async (department: string, section: string) => {
  try {
    const sectionId = `${department}-${section}`;
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`section_id.eq.${sectionId},recipients.cs.{"ALL"}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(notification => ({
      id: notification.id,
      title: notification.message.split('\n')[0] || 'Notification',
      content: notification.message,
      date: notification.schedule_time,
      to: notification.section_id,
      type: notification.type,
      read: false // Default to unread, will need to track read status separately
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const subscribeTimetableUpdates = (
  department: string, 
  section: string, 
  callback: (timetable: TimetableData) => void
) => {
  const sectionId = `${department}-${section}`;
  
  const subscription = supabase
    .channel(`timetable-${sectionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'timetables',
        filter: `department=eq.${department}&section=eq.${section}`
      },
      (payload) => {
        // When timetable changes, verify payload.new exists and has a grid property
        if (payload.new && typeof payload.new === 'object' && 'grid' in payload.new) {
          callback(payload.new.grid as TimetableData);
        }
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeNotificationUpdates = (
  department: string,
  section: string,
  callback: (notifications: any[]) => void
) => {
  const sectionId = `${department}-${section}`;
  
  const subscription = supabase
    .channel(`notifications-${sectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `section_id=eq.${sectionId}`
      },
      async (payload) => {
        // When new notification is added, fetch all notifications again
        const notifications = await getNotificationsForSection(department, section);
        callback(notifications);
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
};

export const markNotificationAsRead = async (notificationId: string) => {
  // For this implementation, we'll need a separate notifications_read table to track read status per user
  // This is a simplified version that would need to be expanded with user info
  try {
    const { error } = await supabase
      .from('notifications_read')
      .insert({
        notification_id: notificationId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        read_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const saveDraftTimetable = async (
  department: string, 
  section: string, 
  grid: TimetableData
) => {
  try {
    // Check if draft already exists
    const { data: existingDraft } = await supabase
      .from('timetables')
      .select('id')
      .eq('department', department)
      .eq('section', section)
      .eq('status', 'draft')
      .single();
    
    if (existingDraft) {
      // Update existing draft
      const { error } = await supabase
        .from('timetables')
        .update({ 
          grid,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDraft.id);
      
      if (error) throw error;
    } else {
      // Create new draft
      const { error } = await supabase
        .from('timetables')
        .insert({
          department,
          section,
          status: 'draft',
          grid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving draft timetable:', error);
    return false;
  }
};

export const promoteTimetableToMaster = async (
  department: string,
  section: string
) => {
  try {
    // Get the draft
    const { data: draft, error: draftError } = await supabase
      .from('timetables')
      .select('*')
      .eq('department', department)
      .eq('section', section)
      .eq('status', 'draft')
      .single();
    
    if (draftError || !draft) {
      throw new Error('Draft not found');
    }
    
    // Check if master already exists
    const { data: existingMaster } = await supabase
      .from('timetables')
      .select('id')
      .eq('department', department)
      .eq('section', section)
      .eq('status', 'confirmed')
      .single();
    
    if (existingMaster) {
      // Update existing master
      const { error } = await supabase
        .from('timetables')
        .update({
          grid: draft.grid,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMaster.id);
      
      if (error) throw error;
    } else {
      // Create new master
      const { error } = await supabase
        .from('timetables')
        .insert({
          department,
          section,
          status: 'confirmed',
          grid: draft.grid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error promoting timetable to master:', error);
    return false;
  }
};
