
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, Calendar } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getNotificationsForSection, subscribeNotificationUpdates, markNotificationAsRead } from "@/services/timetableService";

interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  to: string;
  type: "general" | "alert" | "timetable";
  read?: boolean;
}

const Notifications = () => {
  const { profile } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Load user data and notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!profile) return;
      
      setLoading(true);
      const data = await getNotificationsForSection(profile.department, profile.section);
      setNotifications(data);
      setLoading(false);
    };
    
    loadNotifications();
    
    // Set up real-time subscription
    if (profile) {
      const unsubscribe = subscribeNotificationUpdates(
        profile.department,
        profile.section,
        (updatedNotifications) => {
          setNotifications(updatedNotifications);
        }
      );
      
      return unsubscribe;
    }
  }, [profile]);
  
  // Function to mark notification as read
  const handleMarkAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    
    if (success) {
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };
  
  // Helper to get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "timetable":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "general":
      default:
        return <Info className="h-5 w-5 text-green-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {profile && (
          <Badge variant="outline" className="px-3 py-1">
            {profile.department} - {profile.section}
          </Badge>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Notifications</CardTitle>
          <CardDescription>
            Important updates and announcements
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex gap-3 p-3 rounded-lg border ${
                    notification.read ? "bg-background" : "bg-accent/20"
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="self-start mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{notification.content}</p>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <Badge 
                        variant={notification.type === "alert" ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {notification.type === "general" ? "Announcement" : 
                          notification.type === "alert" ? "Important" : "Timetable"}
                      </Badge>
                      
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Any important announcements will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
