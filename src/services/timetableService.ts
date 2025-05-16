
import { supabase } from '@/lib/supabase';
import { TimetableData, TimetableEntry } from '@/types/timetable';

export const getTimetableForSection = async (department: string, section: string, status = 'confirmed') => {
  try {
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('department', department)
      .eq('section', section)
      .eq('status', status)
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
    console.log("Saving draft timetable for", department, section);
    console.log("Grid data:", JSON.stringify(grid));
    
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
      
      if (error) {
        console.error("Error updating draft:", error);
        throw error;
      }
      
      console.log("Updated existing draft timetable");
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
      
      if (error) {
        console.error("Error creating draft:", error);
        throw error;
      }
      
      console.log("Created new draft timetable");
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
    console.log("Promoting timetable to master for", department, section);
    
    // Get the draft timetable first
    const { data: draft, error: draftError } = await supabase
      .from('timetables')
      .select('*')
      .eq('department', department)
      .eq('section', section)
      .eq('status', 'draft')
      .single();
    
    if (draftError) {
      console.error("Error fetching draft:", draftError);
      throw new Error('Draft timetable not found');
    }
    
    if (!draft) {
      console.error("No draft timetable found");
      throw new Error('No draft timetable found');
    }
    
    console.log("Found draft to promote:", draft.id);
    
    // Archive any existing master timetable for this section
    const { data: existingMaster } = await supabase
      .from('timetables')
      .select('id')
      .eq('department', department)
      .eq('section', section)
      .eq('status', 'confirmed')
      .single();
    
    if (existingMaster) {
      console.log("Found existing master timetable to archive:", existingMaster.id);
      
      // Update existing master to archive it
      const { error: archiveError } = await supabase
        .from('timetables')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString()
        })
        .eq('id', existingMaster.id);
      
      if (archiveError) {
        console.error("Error archiving existing master:", archiveError);
        // Continue anyway, not a critical error
      } else {
        console.log("Archived existing master timetable");
      }
    }
    
    // Create new master from draft
    const { error: insertError } = await supabase
      .from('timetables')
      .insert({
        department,
        section,
        status: 'confirmed',
        grid: draft.grid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        draft_id: draft.id  // Reference to the original draft for tracking
      });
    
    if (insertError) {
      console.error("Error creating master timetable:", insertError);
      throw insertError;
    }
    
    console.log("Created new master timetable from draft");
    
    // Create notification about the new master timetable
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        section_id: `${department}-${section}`,
        type: 'timetable',
        message: `New master timetable has been confirmed for ${department} - Section ${section}.`,
        created_at: new Date().toISOString(),
        schedule_time: new Date().toISOString(),
        recipients: ['ALL'],
        sent_by: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
        department,
        section,
        year: '2024'  // default year
      });
    
    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Continue anyway, not a critical error
    } else {
      console.log("Created notification for new master timetable");
    }
    
    return true;
  } catch (error) {
    console.error('Error promoting timetable to master:', error);
    return false;
  }
};

// Function to check if a master timetable exists
export const checkMasterTimetableExists = async (department: string, section: string) => {
  try {
    console.log("Checking if master timetable exists for", department, section);
    
    const { data, error } = await supabase
      .from('timetables')
      .select('id')
      .eq('department', department)
      .eq('section', section)
      .eq('status', 'confirmed')
      .maybeSingle();
    
    if (error) {
      console.error("Error checking master timetable:", error);
      throw error;
    }
    
    console.log("Master timetable check result:", !!data);
    return !!data;
  } catch (error) {
    console.error('Error checking for master timetable:', error);
    return false;
  }
};
