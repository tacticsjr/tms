
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AppState, Notification, RecentUpdate, createSectionKey } from "@/types/timetable";
import { ArrowLeft, Send, Bell } from "lucide-react";

const NotificationManagement: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [notificationType, setNotificationType] = useState<"announcement" | "reminder">("announcement");
  const [notificationText, setNotificationText] = useState<string>("");
  const [recipientType, setRecipientType] = useState<"all" | "staff" | "specific">("all");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  
  useEffect(() => {
    if (year && dept && section) {
      // Get stored app state
      const storedState = localStorage.getItem(`appState_${year}_${dept}_${section}`);
      if (storedState) {
        try {
          setAppState(JSON.parse(storedState));
        } catch (error) {
          console.error("Failed to parse app state:", error);
        }
      }
    }
  }, [year, dept, section]);

  const handleSendNotification = () => {
    if (!appState || !year || !dept || !section || !notificationText) return;
    
    let recipients: string[] = [];
    
    // Determine recipients based on selection
    if (recipientType === "all") {
      recipients = ["all_users"];
    } else if (recipientType === "staff") {
      recipients = appState.staffList.map(staff => staff.id);
    } else if (recipientType === "specific" && selectedRecipient) {
      recipients = [selectedRecipient];
    }
    
    if (recipients.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient.",
        variant: "destructive"
      });
      return;
    }
    
    // Create notifications for each recipient
    const newNotifications: Notification[] = recipients.map(recipientId => ({
      id: `notification_${Date.now()}_${recipientId}`,
      type: notificationType,
      recipientId,
      payload: { 
        message: notificationText,
        section,
        dept,
        year
      },
      sentAt: new Date(),
      read: false
    }));
    
    // Create a recent update
    const newUpdate: RecentUpdate = {
      id: `update_${Date.now()}`,
      time: new Date(),
      message: `${notificationType === "announcement" ? "Announcement" : "Reminder"} sent to ${recipientType === "all" ? "everyone" : recipientType === "staff" ? "all staff" : "specific recipient"}`,
      type: 'notification',
      relatedId: newNotifications[0].id
    };
    
    // Update the app state
    const updatedAppState = {
      ...appState,
      notifications: [...appState.notifications, ...newNotifications],
      recentUpdates: [newUpdate, ...appState.recentUpdates.slice(0, 19)]
    };
    
    setAppState(updatedAppState);
    
    // Save to localStorage
    localStorage.setItem(`appState_${year}_${dept}_${section}`, JSON.stringify(updatedAppState));
    
    toast({
      title: "Notification sent",
      description: `${notificationType === "announcement" ? "Announcement" : "Reminder"} has been sent successfully.`,
    });
    
    // Clear the form
    setNotificationText("");
  };

  const getRecipientName = (recipientId: string): string => {
    if (!appState) return "Unknown";
    
    if (recipientId === "all_users") {
      return "All users";
    }
    
    const staff = appState.staffList.find(s => s.id === recipientId);
    return staff ? staff.name : "Unknown";
  };

  if (!appState) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const recentNotifications = appState.notifications
    .slice()
    .sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/admin/dashboard/${year}`} className="text-muted-foreground hover:text-foreground">
            {year} Year
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/admin/dashboard/${year}/${dept}`} className="text-muted-foreground hover:text-foreground">
            {dept}
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/admin/dashboard/${year}/${dept}/${section}`} className="text-muted-foreground hover:text-foreground">
            Section {section}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span>Notifications</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mt-2">
          Notification Management
        </h2>
        <p className="text-muted-foreground">
          Send announcements and reminders to staff
        </p>
      </div>

      <div className="flex justify-between">
        <Link to={`/admin/dashboard/${year}/${dept}/${section}`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Notification</CardTitle>
          <CardDescription>
            Send announcements or reminders to staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Notification Type</label>
                <Select 
                  defaultValue={notificationType} 
                  onValueChange={(value) => setNotificationType(value as "announcement" | "reminder")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Recipients</label>
                <Select 
                  defaultValue={recipientType} 
                  onValueChange={(value) => setRecipientType(value as "all" | "staff" | "specific")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="staff">All Staff</SelectItem>
                    <SelectItem value="specific">Specific Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {recipientType === "specific" && (
                <div>
                  <label className="text-sm font-medium block mb-2">Select Staff</label>
                  <Select onValueChange={setSelectedRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {appState.staffList.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Message</label>
              <Textarea 
                placeholder="Type your notification message here..." 
                rows={4}
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSendNotification}
                disabled={!notificationText || (recipientType === "specific" && !selectedRecipient)}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Last 10 notifications sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotifications.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No notifications sent yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNotifications.map(notification => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <Badge className={notification.type === "announcement" ? "bg-blue-500" : "bg-amber-500"}>
                        {notification.type === "announcement" ? "Announcement" : "Reminder"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getRecipientName(notification.recipientId)}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {notification.payload.message}
                    </TableCell>
                    <TableCell>
                      {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.read ? "outline" : "default"}>
                        {notification.read ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagement;
