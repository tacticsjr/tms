
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getTimetableForSection, subscribeTimetableUpdates } from "@/services/timetableService";
import { TimetableData } from "@/types/timetable";

const Dashboard = () => {
  const { profile } = useSupabaseAuth();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [currentDay, setCurrentDay] = useState<string>("");
  const [currentPeriod, setCurrentPeriod] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Days and periods
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = ["1", "2", "3", "4", "5", "6", "7"];
  
  // Get current day and period
  useEffect(() => {
    const updateCurrentTimeInfo = () => {
      const now = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayName = dayNames[now.getDay()];
      setCurrentDay(currentDayName);
      
      // Determine current period based on time
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timeInMinutes = currentHour * 60 + currentMinute;
      
      // Period timings in minutes from 00:00
      const periodTimings = [
        { start: 8 * 60 + 30, end: 9 * 60 + 20 }, // 8:30-9:20
        { start: 9 * 60 + 20, end: 10 * 60 + 10 }, // 9:20-10:10
        { start: 10 * 60 + 10, end: 11 * 60 }, // 10:10-11:00
        { start: 11 * 60 + 15, end: 12 * 60 }, // 11:15-12:00
        { start: 12 * 60, end: 12 * 60 + 45 }, // 12:00-12:45
        { start: 13 * 60 + 35, end: 14 * 60 + 25 }, // 1:35-2:25
        { start: 14 * 60 + 25, end: 15 * 60 + 15 } // 2:25-3:15
      ];
      
      for (let i = 0; i < periodTimings.length; i++) {
        if (timeInMinutes >= periodTimings[i].start && timeInMinutes < periodTimings[i].end) {
          setCurrentPeriod(i);
          break;
        }
      }
    };
    
    updateCurrentTimeInfo();
    const timer = setInterval(updateCurrentTimeInfo, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Load user data and timetable
  useEffect(() => {
    const loadTimetable = async () => {
      if (!profile) return;
      
      setLoading(true);
      const data = await getTimetableForSection(profile.department, profile.section);
      if (data) {
        setTimetable(data);
      }
      setLoading(false);
    };
    
    loadTimetable();
    
    // Set up real-time subscription
    if (profile) {
      const unsubscribe = subscribeTimetableUpdates(
        profile.department,
        profile.section,
        (updatedTimetable) => {
          setTimetable(updatedTimetable);
        }
      );
      
      return unsubscribe;
    }
  }, [profile]);
  
  // Helper function to check if a period is the current one
  const isCurrentPeriod = (day: string, periodIndex: number) => {
    return day === currentDay && periodIndex === currentPeriod;
  };
  
  // Helper function to get subject for a specific day and period
  const getSubject = (day: string, period: string) => {
    if (!timetable) return null;
    
    const periodIndex = parseInt(period) - 1;
    const dayData = timetable[day.toLowerCase()];
    
    if (!dayData || !dayData[periodIndex]) return null;
    return dayData[periodIndex];
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
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        {profile && (
          <Badge variant="outline" className="px-3 py-1">
            {profile.department} - {profile.section}
          </Badge>
        )}
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>My Timetable</CardTitle>
          <CardDescription>
            {timetable ? (
              "Weekly class schedule"
            ) : (
              "No timetable available for your class yet"
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {timetable ? (
            <Tabs defaultValue={currentDay.toLowerCase()} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-6">
                {days.map((day) => (
                  <TabsTrigger 
                    key={day} 
                    value={day.toLowerCase()}
                    className={day === currentDay ? "font-bold" : ""}
                  >
                    {day.substring(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {days.map((day) => (
                <TabsContent key={day} value={day.toLowerCase()}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden sm:table-cell">Staff</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periods.map((period, index) => {
                        const subject = getSubject(day, period);
                        const isBreak = index === 3 || index === 5;
                        const isCurrent = isCurrentPeriod(day, index);
                        
                        // Different time slots based on period index
                        const timeSlots = [
                          "8:30 - 9:20",
                          "9:20 - 10:10",
                          "10:10 - 11:00",
                          "11:15 - 12:00",
                          "12:00 - 12:45",
                          "1:35 - 2:25",
                          "2:25 - 3:15"
                        ];
                        
                        return (
                          <React.Fragment key={period}>
                            {/* If it's after period 3 or period 5, show break row */}
                            {(index === 3 || index === 5) && (
                              <TableRow className="bg-accent/30">
                                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                                  {index === 3 ? "Tea Break (11:00 - 11:15)" : "Lunch Break (12:45 - 1:35)"}
                                </TableCell>
                              </TableRow>
                            )}
                            
                            <TableRow className={isCurrent ? "bg-primary/10" : ""}>
                              <TableCell>
                                {isCurrent && (
                                  <span className="mr-1">→</span>
                                )}
                                {period}
                              </TableCell>
                              <TableCell>{timeSlots[index]}</TableCell>
                              <TableCell>
                                {subject ? subject.subject : "Free Period"}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {subject?.staff || "-"}
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No timetable available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check back later when your department has published the timetable
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
