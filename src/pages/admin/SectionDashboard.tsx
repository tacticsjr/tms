
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AppState, 
  TimetableStatus, 
  Staff, 
  Subject, 
  RecentUpdate,
  TimeSlot,
  createSectionKey
} from "@/types/timetable";
import TodayScheduleSection from "@/components/dashboard/TodayScheduleSection";
import StaffListSection from "@/components/dashboard/StaffListSection";
import SubjectsListSection from "@/components/dashboard/SubjectsListSection";
import RecentUpdatesSection from "@/components/dashboard/RecentUpdatesSection";
import { Clock, CheckCircle, AlertTriangle, Book, Users } from "lucide-react";

// Mock initial state (in a real app, this would come from a context or state management)
const initializeAppState = (year: string, dept: string, section: string): AppState => {
  // Try to get from localStorage first
  const storedState = localStorage.getItem(`appState_${year}_${dept}_${section}`);
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error("Failed to parse stored app state:", error);
    }
  }

  // Generate mock data if nothing in localStorage
  const sectionKey = createSectionKey(year, dept, section);
  
  // Generate staff
  const staffList: Staff[] = [
    { id: "1", name: "Sagaya Rebecca", email: "sagaya@velammal.edu", maxPeriods: 5, subjects: ["MA8402"] },
    { id: "2", name: "Sujitha", email: "sujitha@velammal.edu", maxPeriods: 6, subjects: ["CS8491"] },
    { id: "3", name: "P. Abirami", email: "abirami@velammal.edu", maxPeriods: 6, subjects: ["CS8491"] },
    { id: "4", name: "Vidya", email: "vidya@velammal.edu", maxPeriods: 7, subjects: ["AD8401", "AD8071", "HS8581"] },
    { id: "5", name: "Justin Xavier", email: "justin@velammal.edu", maxPeriods: 5, subjects: ["CS8591"] },
    { id: "6", name: "Siva Karthikeyan", email: "siva@velammal.edu", maxPeriods: 4, subjects: ["GE8561"] },
  ];
  
  // Generate subjects
  const subjectList: Subject[] = [
    {
      id: "1", code: "MA8402", name: "Probability and Statistics",
      title: "Probability and Statistics", staff: "Ms. Sagaya Rebecca",
      shortName: "PAS", type: "Theory", periodsPerWeek: 5,
      isLab: false, staffId: "1", priority: 1,
    },
    {
      id: "2", code: "CS8491", name: "Operating Systems",
      shortName: "OS", periodsPerWeek: 4,
      isLab: false, staffId: "2", type: "Theory",
      priority: 1, title: "Operating Systems", staff: "Ms. Sujitha"
    },
    {
      id: "3", code: "CS8491", name: "Machine Learning",
      shortName: "ML", type: "Theory",
      periodsPerWeek: 5, title: "Machine Learning", staff: "Ms. P. Abirami",
      isLab: false, staffId: "3", priority: 1,
    },
    {
      id: "4", code: "AD8401", name: "Fundamentals of Data Science and Analytics",
      shortName: "FDSA", periodsPerWeek: 5, type: "Theory",
      isLab: false, staffId: "4", priority: 1,
      title: "Fundamentals of Data Science and Analytics", staff: "Ms. Vidya"
    }
  ];
  
  // Check if we have a timetable draft stored
  const timetableDraftKey = `timetable_draft_${year}_${dept}_${section}`;
  const timetableUIKey = `timetable_ui_${year}_${dept}_${section}`;
  let timetableStatus = TimetableStatus.Draft;
  let timetableGrid = {};
  
  const storedTimetableUI = localStorage.getItem(timetableUIKey);
  if (storedTimetableUI) {
    try {
      timetableGrid = JSON.parse(storedTimetableUI);
    } catch (error) {
      console.error("Failed to parse timetable UI data:", error);
    }
  }
  
  // Generate recent updates
  const recentUpdates: RecentUpdate[] = [
    { 
      id: "1", 
      time: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      message: "Ms. Vidya marked absent for Monday Period 4",
      type: "substitution",
      relatedId: "sub1"
    },
    { 
      id: "2", 
      time: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      message: "Timetable draft generated",
      type: "timetable",
      relatedId: "timetable1"
    },
    { 
      id: "3", 
      time: new Date(Date.now() - 24 * 3600000), // 1 day ago
      message: "CN Lab staff assignment updated to Mr. Justin Xavier",
      type: "subject",
      relatedId: "sub9"
    }
  ];
  
  // Create and return the initial state
  const initialState: AppState = {
    staffList,
    subjectList,
    timetables: {
      [sectionKey]: {
        status: timetableStatus,
        grid: timetableGrid
      }
    },
    masterCards: [],
    recentUpdates,
    substitutions: [],
    notifications: [],
    history: {
      undoStack: [],
      redoStack: []
    }
  };
  
  // Save to localStorage for persistence
  localStorage.setItem(`appState_${year}_${dept}_${section}`, JSON.stringify(initialState));
  
  return initialState;
};

const SectionDashboard: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  
  // Generate days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Get current day index (0 = Sunday, 1 = Monday, etc.)
  const currentDayIndex = new Date().getDay();
  // Map to our days array (0 = Monday in our array)
  const todayIndex = currentDayIndex === 0 ? 5 : currentDayIndex - 1;
  const today = days[todayIndex];

  useEffect(() => {
    if (year && dept && section) {
      // Initialize app state
      const initialState = initializeAppState(year, dept, section);
      setAppState(initialState);
      
      // Set up interval to update the current time
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      
      return () => clearInterval(timeInterval);
    }
  }, [year, dept, section]);

  useEffect(() => {
    // Simulate WebSocket updates
    const wsUpdateInterval = setInterval(() => {
      if (Math.random() > 0.85 && appState) {
        // Simulate a new update
        const updateTypes = ['substitution', 'timetable', 'staff', 'subject', 'notification'] as const;
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        const newUpdate: RecentUpdate = {
          id: `update_${Date.now()}`,
          time: new Date(),
          message: getRandomUpdateMessage(randomType),
          type: randomType
        };
        
        const newState = {
          ...appState,
          recentUpdates: [newUpdate, ...appState.recentUpdates.slice(0, 19)]
        };
        
        setAppState(newState);
        
        // Save to localStorage
        if (year && dept && section) {
          localStorage.setItem(`appState_${year}_${dept}_${section}`, JSON.stringify(newState));
        }
        
        // Show toast
        toast({
          title: "New Update",
          description: newUpdate.message,
        });
      }
    }, 30000);
    
    return () => clearInterval(wsUpdateInterval);
  }, [appState, year, dept, section, toast]);

  const getRandomUpdateMessage = (type: RecentUpdate['type']): string => {
    switch (type) {
      case 'substitution':
        return `${getRandomStaffName()} assigned as substitute for ${getRandomDay()} Period ${Math.floor(Math.random() * 7) + 1}`;
      case 'timetable':
        return `Timetable ${Math.random() > 0.5 ? 'updated' : 'regenerated'} by admin`;
      case 'staff':
        return `${getRandomStaffName()}'s maximum periods updated to ${Math.floor(Math.random() * 5) + 3}`;
      case 'subject':
        return `${getRandomSubject()} assignment updated`;
      case 'notification':
        return `New announcement sent to all students`;
      default:
        return `System update at ${new Date().toLocaleTimeString()}`;
    }
  };

  const getRandomStaffName = (): string => {
    if (!appState || !appState.staffList.length) return "Staff member";
    const randomStaff = appState.staffList[Math.floor(Math.random() * appState.staffList.length)];
    return randomStaff.name;
  };

  const getRandomDay = (): string => {
    return days[Math.floor(Math.random() * days.length)];
  };

  const getRandomSubject = (): string => {
    if (!appState || !appState.subjectList.length) return "Subject";
    const randomSubject = appState.subjectList[Math.floor(Math.random() * appState.subjectList.length)];
    return randomSubject.name;
  };

  const handleStaffUpdate = (updatedStaff: Staff) => {
    if (!appState) return;

    const newStaffList = appState.staffList.map(staff => 
      staff.id === updatedStaff.id ? updatedStaff : staff
    );
    
    const newUpdate: RecentUpdate = {
      id: `update_${Date.now()}`,
      time: new Date(),
      message: `${updatedStaff.name}'s information updated`,
      type: 'staff',
      relatedId: updatedStaff.id
    };
    
    const newState = {
      ...appState,
      staffList: newStaffList,
      recentUpdates: [
        newUpdate,
        ...appState.recentUpdates.slice(0, 19)
      ]
    };
    
    setAppState(newState);
    
    // Save to localStorage
    if (year && dept && section) {
      localStorage.setItem(`appState_${year}_${dept}_${section}`, JSON.stringify(newState));
    }
    
    toast({
      title: "Staff Updated",
      description: `${updatedStaff.name}'s information has been updated.`,
    });
  };

  const handleSubjectUpdate = (updatedSubject: Subject) => {
    if (!appState) return;

    const newSubjectList = appState.subjectList.map(subject => 
      subject.id === updatedSubject.id ? updatedSubject : subject
    );
    
    const newUpdate: RecentUpdate = {
      id: `update_${Date.now()}`,
      time: new Date(),
      message: `${updatedSubject.name} subject updated`,
      type: 'subject',
      relatedId: updatedSubject.id
    };
    
    const newState = {
      ...appState,
      subjectList: newSubjectList,
      recentUpdates: [
        newUpdate,
        ...appState.recentUpdates.slice(0, 19)
      ]
    };
    
    setAppState(newState);
    
    // Save to localStorage
    if (year && dept && section) {
      localStorage.setItem(`appState_${year}_${dept}_${section}`, JSON.stringify(newState));
    }
    
    toast({
      title: "Subject Updated",
      description: `${updatedSubject.name} has been updated.`,
    });
  };

  if (!appState) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const sectionKey = createSectionKey(year || '', dept || '', section || '');
  const timetableStatus = appState.timetables[sectionKey]?.status || TimetableStatus.Draft;
  
  // Find next class (this would be based on the current time in a real app)
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const periodTimes = [
    { start: { hour: 8, minute: 30 }, end: { hour: 9, minute: 20 } },
    { start: { hour: 9, minute: 20 }, end: { hour: 10, minute: 10 } },
    { start: { hour: 10, minute: 10 }, end: { hour: 11, minute: 0 } },
    { start: { hour: 11, minute: 15 }, end: { hour: 12, minute: 0 } },
    { start: { hour: 12, minute: 0 }, end: { hour: 12, minute: 45 } },
    { start: { hour: 13, minute: 35 }, end: { hour: 14, minute: 25 } },
    { start: { hour: 14, minute: 25 }, end: { hour: 15, minute: 15 } }
  ];
  
  let currentPeriodIndex = -1;
  let nextPeriodIndex = -1;
  
  for (let i = 0; i < periodTimes.length; i++) {
    const period = periodTimes[i];
    const startTotalMinutes = period.start.hour * 60 + period.start.minute;
    const endTotalMinutes = period.end.hour * 60 + period.end.minute;
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes) {
      currentPeriodIndex = i;
      nextPeriodIndex = i + 1 < periodTimes.length ? i + 1 : -1;
      break;
    }
    
    if (currentTotalMinutes < startTotalMinutes) {
      nextPeriodIndex = i;
      break;
    }
  }

  // Get the next class info
  const timetableGrid = appState.timetables[sectionKey]?.grid || {};
  const todaySchedule = timetableGrid[today] || [];
  
  let nextClass = "No more classes today";
  let nextClassTime = "";
  let nextClassPeriod = "";
  
  if (nextPeriodIndex !== -1 && todaySchedule[nextPeriodIndex]) {
    const nextPeriodInfo = todaySchedule[nextPeriodIndex];
    nextClass = nextPeriodInfo.subject;
    nextClassTime = `${periodTimes[nextPeriodIndex].start.hour}:${periodTimes[nextPeriodIndex].start.minute.toString().padStart(2, '0')}`;
    nextClassPeriod = `Period ${nextPeriodIndex + 1}`;
  }

  // Stats
  const totalStaff = appState.staffList.length;
  const totalSubjects = appState.subjectList.length;
  const timetableStatusBadge = timetableStatus === TimetableStatus.Master
    ? <Badge className="bg-green-500 hover:bg-green-600">Master</Badge>
    : <Badge className="bg-yellow-500 hover:bg-yellow-600">Draft</Badge>;
  
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
          <span>Section {section}</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mt-2">
          {year} Year {dept} - Section {section}
        </h2>
        <p className="text-muted-foreground">
          Manage timetable and scheduling
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to this section
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Including labs and activity hours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timetable Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {timetableStatus === TimetableStatus.Master ? "Master" : "Draft"}
              </div>
              {timetableStatusBadge}
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextClass}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {nextClassTime ? `${nextClassTime}, ${today}` : "None scheduled"}
              </p>
              {nextClassPeriod && <Badge className="bg-blue-500 hover:bg-blue-600">{nextClassPeriod}</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {appState.recentUpdates.length > 0 && (
        <Alert>
          <AlertTitle>Recent Activities</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {appState.recentUpdates.slice(0, 2).map((update, index) => (
                <div key={update.id} className="flex items-center space-x-2">
                  {update.type === 'substitution' && <Badge variant="destructive">Substitution</Badge>}
                  {update.type === 'timetable' && <Badge variant="outline">Timetable</Badge>}
                  {update.type === 'staff' && <Badge className="bg-blue-500">Staff</Badge>}
                  {update.type === 'subject' && <Badge className="bg-purple-500">Subject</Badge>}
                  {update.type === 'notification' && <Badge className="bg-yellow-500">Notification</Badge>}
                  <span className="text-sm">{update.message}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {getTimeAgo(update.time)}
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today's Schedule
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Subjects
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to={`/admin/staff/${year}/${dept}/${section}`} 
                    className="flex flex-col items-center justify-center p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <div className="font-medium">Staff</div>
                    <div className="text-xs text-muted-foreground">Manage faculty</div>
                  </Link>
                  
                  <Link 
                    to={`/admin/subjects/${year}/${dept}/${section}`} 
                    className="flex flex-col items-center justify-center p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <div className="font-medium">Subjects</div>
                    <div className="text-xs text-muted-foreground">Configure courses</div>
                  </Link>
                  
                  <Link 
                    to={`/admin/timetables/${year}/${dept}/${section}`} 
                    className="flex flex-col items-center justify-center p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <div className="font-medium">Timetables</div>
                    <div className="text-xs text-muted-foreground">Generate schedules</div>
                  </Link>
                  
                  <Link 
                    to={`/admin/master/${year}/${dept}/${section}`} 
                    className="flex flex-col items-center justify-center p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <div className="font-medium">Master</div>
                    <div className="text-xs text-muted-foreground">Finalize timetable</div>
                  </Link>
                  
                  <Link 
                    to={`/admin/substitutions/${year}/${dept}/${section}`} 
                    className="flex flex-col items-center justify-center p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <div className="font-medium">Substitutions</div>
                    <div className="text-xs text-muted-foreground">Handle absences</div>
                  </Link>
                  
                  <Link 
                    to={`/admin/notifications/${year}/${dept}/${section}`} 
                    className="flex flex-col items-center justify-center p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <div className="font-medium">Notifications</div>
                    <div className="text-xs text-muted-foreground">Send alerts</div>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                <RecentUpdatesSection updates={appState.recentUpdates} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Faculty Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appState.staffList.slice(0, 4).map((staff) => (
                <div key={staff.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {appState.subjectList.find(s => s.staffId === staff.id)?.name || "No subject assigned"}
                    </p>
                  </div>
                  <div className="text-sm">{Math.floor(Math.random() * staff.maxPeriods!)}/{staff.maxPeriods} <span className="text-muted-foreground">hrs/week</span></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule - {today}</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TodayScheduleSection 
                todaySchedule={todaySchedule} 
                currentPeriodIndex={currentPeriodIndex}
                nextPeriodIndex={nextPeriodIndex}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff List</CardTitle>
              <CardDescription>Faculty assigned to this section</CardDescription>
            </CardHeader>
            <CardContent>
              <StaffListSection 
                staffList={appState.staffList}
                onStaffUpdate={handleStaffUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject List</CardTitle>
              <CardDescription>All subjects for this section</CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectsListSection 
                subjectList={appState.subjectList}
                staffList={appState.staffList}
                onSubjectUpdate={handleSubjectUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to format time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hr ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day ago`;
};

export default SectionDashboard;
