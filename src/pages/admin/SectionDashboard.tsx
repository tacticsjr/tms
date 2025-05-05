
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const SectionDashboard: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();

  // Mock data for today's schedule
  const todaySchedule = [
    { time: "8:30-9:20", period: 1, subject: "PAS", title: "Probability and Statistics", faculty: "Ms. Sagaya Rebecca" },
    { time: "9:20-10:10", period: 2, subject: "OS", title: "Operating Systems", faculty: "Ms. Sujitha" },
    { time: "10:10-11:00", period: 3, subject: "ML", title: "Machine Learning", faculty: "Ms. P. Abirami" },
    { time: "11:15-12:00", period: 4, subject: "FDSA", title: "Fundamentals of Data Science", faculty: "Ms. Vidya" },
    { time: "12:00-12:45", period: 5, subject: "CN", title: "Computer Networks", faculty: "Mr. Justin Xavier" },
    { time: "1:35-2:25", period: 6, subject: "OS", title: "Operating Systems", faculty: "Ms. Sujitha" },
    { time: "2:25-3:15", period: 7, subject: "EVS", title: "Environmental Sciences", faculty: "Mr. Siva Karthikeyan" }
  ];

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
            <div className="text-2xl font-bold">6</div>
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
            <div className="text-2xl font-bold">11</div>
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
              <div className="text-2xl font-bold">Master</div>
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: 24.02.2025
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PAS</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                8:30 AM, Monday
              </p>
              <Badge className="bg-blue-500 hover:bg-blue-600">Period 1</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTitle>Attention Required</AlertTitle>
        <AlertDescription>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">Unassigned</Badge>
              <span className="text-sm">Computer Networks Lab needs a faculty assignment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Suggestion</Badge>
              <span className="text-sm">Consider regenerating timetable to optimize lab sessions</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Monday, 24th February 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4 text-sm font-medium">
            {[1, 2, 3, 4, 5, 6, 7].map(period => (
              <div key={period} className="text-center">P{period}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {todaySchedule.map((slot, index) => {
              const isBreak = slot.period === 3 || slot.period === 5;
              return (
                <div 
                  key={index}
                  className={`text-center p-2 rounded-md ${
                    isBreak ? "border-t-2 border-primary/30" : "bg-accent"
                  }`}
                >
                  <div className="font-medium text-sm">{slot.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {slot.faculty.split(' ')[1]}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            Tea Break after Period 3 (11:00 - 11:15) | Lunch Break after Period 5 (12:45 - 1:35)
          </div>
        </CardContent>
      </Card>

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
            <CardTitle>Faculty Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Ms. Sagaya Rebecca</p>
                <p className="text-xs text-muted-foreground">Probability and Statistics</p>
              </div>
              <div className="text-sm">5/6 <span className="text-muted-foreground">hrs/week</span></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Ms. Sujitha</p>
                <p className="text-xs text-muted-foreground">Operating Systems</p>
              </div>
              <div className="text-sm">6/8 <span className="text-muted-foreground">hrs/week</span></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Ms. P. Abirami</p>
                <p className="text-xs text-muted-foreground">Machine Learning</p>
              </div>
              <div className="text-sm">8/10 <span className="text-muted-foreground">hrs/week</span></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Ms. Vidya</p>
                <p className="text-xs text-muted-foreground">Data Science</p>
              </div>
              <div className="text-sm">11/12 <span className="text-muted-foreground">hrs/week</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SectionDashboard;
