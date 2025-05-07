
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load user data and notifications
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      // Load all notifications
      const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      
      // Filter notifications for this user's department and section
      const userDeptSection = `${user.department}-${user.section}`;
      const relevantNotifications = allNotifications.filter((notification: Notification) => 
        notification.to === userDeptSection || notification.to === "ALL"
      );
      
      setNotifications(relevantNotifications.sort((a: Notification, b: Notification) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  }, []);
  
  // Function to mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // You might want to store read status in localStorage as well
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updatedNotifications = allNotifications.map((notification: Notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {currentUser && (
          <Badge variant="outline" className="px-3 py-1">
            {currentUser.department} - {currentUser.section}
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
                  onClick={() => markAsRead(notification.id)}
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
