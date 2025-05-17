
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TimetableEntry } from "@/types/timetable";
import { Bell, Play, Pause, Trash2 } from "lucide-react";

const notificationFormSchema = z.object({
  webhookUrl: z.string().url({ message: "Please enter a valid webhook URL" }),
  notifyBeforeMinutes: z.number().min(1).max(30),
  enabled: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const defaultValues: Partial<NotificationFormValues> = {
  webhookUrl: "",
  notifyBeforeMinutes: 10,
  enabled: true,
};

interface ClassNotificationsSetupProps {
  year?: string;
  dept?: string;
  section?: string;
}

const ClassNotificationsSetup: React.FC<ClassNotificationsSetupProps> = ({ year, dept, section }) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [nextClass, setNextClass] = useState<TimetableEntry | null>(null);
  const [nextClassTime, setNextClassTime] = useState<string | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<Array<{ time: Date; subject: string }>>([]);
  
  // Form definition
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      ...defaultValues,
      ...loadNotificationSettings(),
    },
  });

  // Load notification settings from localStorage
  function loadNotificationSettings() {
    const key = `notification_settings_${year}_${dept}_${section}`;
    const savedSettings = localStorage.getItem(key);
    return savedSettings ? JSON.parse(savedSettings) : defaultValues;
  }

  // Save notification settings to localStorage
  function saveNotificationSettings(values: NotificationFormValues) {
    const key = `notification_settings_${year}_${dept}_${section}`;
    localStorage.setItem(key, JSON.stringify(values));
  }

  // Function to check for upcoming classes
  const checkUpcomingClasses = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (day === 0 || day === 6) {
      // Weekend, no classes
      setNextClass(null);
      setNextClassTime(null);
      return;
    }
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[day];
    
    // Load timetable from localStorage
    const timetableKey = `timetable_ui_${year}_${dept}_${section}`;
    const timetableData = localStorage.getItem(timetableKey);
    
    if (!timetableData) {
      toast({
        title: "No timetable found",
        description: "Please generate a timetable first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const timetable = JSON.parse(timetableData);
      const todaySchedule = timetable[todayName] || [];
      
      if (!todaySchedule.length) {
        setNextClass(null);
        setNextClassTime(null);
        return;
      }
      
      const periodTimings = [
        { start: { hour: 8, minute: 30 }, end: { hour: 9, minute: 20 } },
        { start: { hour: 9, minute: 20 }, end: { hour: 10, minute: 10 } },
        { start: { hour: 10, minute: 10 }, end: { hour: 11, minute: 0 } },
        { start: { hour: 11, minute: 15 }, end: { hour: 12, minute: 0 } },
        { start: { hour: 12, minute: 0 }, end: { hour: 12, minute: 45 } },
        { start: { hour: 13, minute: 35 }, end: { hour: 14, minute: 25 } },
        { start: { hour: 14, minute: 25 }, end: { hour: 15, minute: 15 } }
      ];
      
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      
      let foundNextClass = false;
      let nextClassEntry: TimetableEntry | null = null;
      let nextClassPeriodIndex = -1;
      let nextClassStartTime = "";
      
      for (let i = 0; i < periodTimings.length; i++) {
        const periodStartTime = periodTimings[i].start;
        const periodStartTotalMinutes = periodStartTime.hour * 60 + periodStartTime.minute;
        
        // If this period starts in the future
        if (periodStartTotalMinutes > currentTotalMinutes) {
          // Check if there's a class at this period
          if (todaySchedule[i]) {
            nextClassEntry = todaySchedule[i];
            nextClassPeriodIndex = i;
            nextClassStartTime = `${periodStartTime.hour}:${periodStartTime.minute.toString().padStart(2, '0')}`;
            foundNextClass = true;
            break;
          }
        }
      }
      
      if (foundNextClass && nextClassEntry) {
        setNextClass(nextClassEntry);
        setNextClassTime(nextClassStartTime);
        
        // Calculate time until class starts (in minutes)
        const nextClassPeriod = periodTimings[nextClassPeriodIndex];
        const nextClassTotalMinutes = nextClassPeriod.start.hour * 60 + nextClassPeriod.start.minute;
        const minutesUntilClass = nextClassTotalMinutes - currentTotalMinutes;
        
        // Check if notification should be sent (based on settings)
        const settings = form.getValues();
        if (settings.enabled && settings.webhookUrl && minutesUntilClass <= settings.notifyBeforeMinutes && minutesUntilClass > 0) {
          // Check if we've already notified for this class
          const classKey = `notified_${year}_${dept}_${section}_${todayName}_${nextClassPeriodIndex}`;
          const alreadyNotified = localStorage.getItem(classKey) === "true";
          
          if (!alreadyNotified) {
            sendZapierNotification(nextClassEntry, minutesUntilClass, nextClassStartTime);
            localStorage.setItem(classKey, "true");
            
            // Add to notification history
            setNotificationHistory(prev => [
              { time: new Date(), subject: nextClassEntry.subject },
              ...prev.slice(0, 9) // Keep only the last 10 notifications
            ]);
          }
        }
      } else {
        setNextClass(null);
        setNextClassTime(null);
      }
    } catch (error) {
      console.error("Error parsing timetable:", error);
      toast({
        title: "Error",
        description: "Could not parse timetable data",
        variant: "destructive",
      });
    }
  };
  
  // Function to send notification via Zapier webhook
  const sendZapierNotification = async (classInfo: TimetableEntry, minutesUntil: number, startTime: string) => {
    const settings = form.getValues();
    
    if (!settings.webhookUrl) {
      toast({
        title: "No webhook URL",
        description: "Please enter your Zapier webhook URL to receive notifications",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Sending notification to Zapier webhook:", settings.webhookUrl);
      
      await fetch(settings.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Add this to handle CORS
        body: JSON.stringify({
          class: classInfo.subject,
          teacher: classInfo.staff || "Unassigned",
          startTime: startTime,
          minutesUntil: minutesUntil,
          message: `Your ${classInfo.subject} class starts in ${minutesUntil} minutes (at ${startTime})`,
          section: `${year} Year ${dept} - Section ${section}`,
          timestamp: new Date().toISOString()
        }),
      });
      
      toast({
        title: "Notification Sent",
        description: `Sent notification for ${classInfo.subject} starting at ${startTime}`,
      });
      
    } catch (error) {
      console.error("Error sending Zapier notification:", error);
      toast({
        title: "Failed to send notification",
        description: "Could not send notification via Zapier webhook",
        variant: "destructive",
      });
    }
  };
  
  // Submit handler for form
  const onSubmit = (values: NotificationFormValues) => {
    saveNotificationSettings(values);
    
    toast({
      title: "Settings saved",
      description: "Your notification settings have been saved",
    });
    
    // Start checking immediately after saving
    checkUpcomingClasses();
  };
  
  // Start/stop periodic checks
  const toggleChecking = () => {
    if (isChecking) {
      setIsChecking(false);
      toast({
        title: "Notifications paused",
        description: "Class notifications have been paused",
      });
    } else {
      setIsChecking(true);
      checkUpcomingClasses(); // Check immediately when starting
      toast({
        title: "Notifications active",
        description: "Checking for upcoming classes every minute",
      });
    }
  };
  
  // Clear notification history
  const clearHistory = () => {
    setNotificationHistory([]);
    toast({
      title: "History cleared",
      description: "Notification history has been cleared",
    });
  };

  // Effect to run periodic checks
  useEffect(() => {
    if (isChecking) {
      const interval = setInterval(() => {
        checkUpcomingClasses();
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [isChecking]);
  
  // Effect to initialize from localStorage and start checking on component mount
  useEffect(() => {
    const settings = loadNotificationSettings();
    form.reset(settings);
    
    if (settings.enabled) {
      setIsChecking(true);
      checkUpcomingClasses();
    }
    
    // Load notification history if available
    const historyKey = `notification_history_${year}_${dept}_${section}`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        // Convert string dates back to Date objects
        setNotificationHistory(history.map((item: any) => ({
          ...item,
          time: new Date(item.time)
        })));
      } catch (error) {
        console.error("Error loading notification history:", error);
      }
    }
    
    // Save history when component unmounts
    return () => {
      const historyToSave = notificationHistory.map(item => ({
        ...item,
        time: item.time.toISOString() // Convert Date to string for storage
      }));
      localStorage.setItem(historyKey, JSON.stringify(historyToSave));
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Class Notifications
        </CardTitle>
        <CardDescription>
          Get notified before your classes start via Zapier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zapier Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://hooks.zapier.com/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your Zapier webhook URL to receive notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notifyBeforeMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notify Before (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={30} 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many minutes before class to send notification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Notifications</FormLabel>
                    <FormDescription>
                      Turn class notifications on or off
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </Form>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Notification Status</h3>
            <Button
              variant={isChecking ? "destructive" : "default"}
              size="sm"
              onClick={toggleChecking}
            >
              {isChecking ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>
          </div>
          
          <div className="rounded-md border p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={isChecking ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                  {isChecking ? "Active" : "Paused"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Class:</span>
                <span className="font-medium">
                  {nextClass ? nextClass.subject : "No upcoming classes"}
                </span>
              </div>
              
              {nextClass && nextClassTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Time:</span>
                  <span className="font-medium">{nextClassTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {notificationHistory.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Recent Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-40 overflow-y-auto">
                {notificationHistory.map((notification, index) => (
                  <div 
                    key={index} 
                    className={`p-2 ${index % 2 === 0 ? 'bg-muted/50' : ''} text-sm`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{notification.subject}</span>
                      <span className="text-muted-foreground text-xs">
                        {notification.time.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p className="mb-1">ℹ️ You can use the Zapier webhook to:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Send email notifications before class</li>
          <li>Create calendar events</li>
          <li>Send SMS reminders</li>
          <li>Push notifications to your phone</li>
        </ul>
      </CardFooter>
    </Card>
  );
};

export default ClassNotificationsSetup;
