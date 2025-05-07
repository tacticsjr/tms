
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

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [timetable, setTimetable] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState<string>("");
  const [currentPeriod, setCurrentPeriod] = useState<number>(-1);
  
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
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      // Load master timetable for the user's department and section
      const allTimetables = JSON.parse(localStorage.getItem("masterTimetables") || "{}");
      
      // Create the key for the user's timetable (format: "deptname-sectionname")
      const timetableKey = `${user.department}-${user.section}`;
      
      if (allTimetables[timetableKey]) {
        setTimetable(allTimetables[timetableKey]);
      } else {
        // If no master timetable, check draft timetables
        const draftTimetables = JSON.parse(localStorage.getItem("timetableDrafts") || "{}");
        if (draftTimetables[timetableKey]) {
          setTimetable(draftTimetables[timetableKey]);
        }
      }
    }
  }, []);
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        {currentUser && (
          <Badge variant="outline" className="px-3 py-1">
            {currentUser.department} - {currentUser.section}
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
