
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DepartmentDashboard: React.FC = () => {
  const { year, dept } = useParams<{ year: string; dept: string }>();

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
          <span>{dept}</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mt-2">{dept} Department</h2>
        <p className="text-muted-foreground">
          {year} Year - Select a section to manage
        </p>
      </div>

      <div className="grid gap-6 grid-cols-2">
        <Link to={`/admin/dashboard/${year}/${dept}/A`}>
          <Card className="h-full transition-all hover:shadow-md cursor-pointer">
            <CardHeader>
              <CardTitle>Section A</CardTitle>
              <CardDescription>{year} Year {dept} Students - Section A</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-muted-foreground">Students:</span>
                  <span className="font-medium">60</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-muted-foreground">Timetable:</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    Draft
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={`/admin/dashboard/${year}/${dept}/B`}>
          <Card className="h-full transition-all hover:shadow-md cursor-pointer">
            <CardHeader>
              <CardTitle>Section B</CardTitle>
              <CardDescription>{year} Year {dept} Students - Section B</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-muted-foreground">Students:</span>
                  <span className="font-medium">60</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-muted-foreground">Timetable:</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    Master
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
              <CardDescription>Key metrics for {dept} department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">120</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lab Sessions</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Timetable Updated</p>
                    <p className="text-xs text-muted-foreground">Section B - Master timetable generated</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    Today
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Subject Added</p>
                    <p className="text-xs text-muted-foreground">New lab session added to Section A</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    Yesterday
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Staff</CardTitle>
              <CardDescription>Faculty members teaching {year} Year {dept}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    SR
                  </div>
                  <div>
                    <p className="font-medium">Ms. Sagaya Rebecca</p>
                    <p className="text-sm text-muted-foreground">Probability and Statistics</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    SJ
                  </div>
                  <div>
                    <p className="font-medium">Ms. Sujitha</p>
                    <p className="text-sm text-muted-foreground">Operating Systems</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    PA
                  </div>
                  <div>
                    <p className="font-medium">Ms. P. Abirami</p>
                    <p className="text-sm text-muted-foreground">Machine Learning</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    VD
                  </div>
                  <div>
                    <p className="font-medium">Ms. Vidya</p>
                    <p className="text-sm text-muted-foreground">Fundamentals of Data Science</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subjects" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Subjects</CardTitle>
              <CardDescription>Courses for {year} Year {dept}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                    PAS
                  </div>
                  <div>
                    <p className="font-medium">Probability and Statistics</p>
                    <p className="text-sm text-muted-foreground">5 periods per week</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                    OS
                  </div>
                  <div>
                    <p className="font-medium">Operating Systems</p>
                    <p className="text-sm text-muted-foreground">6 periods per week</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                    ML
                  </div>
                  <div>
                    <p className="font-medium">Machine Learning</p>
                    <p className="text-sm text-muted-foreground">5 periods per week</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center mr-3">
                    FDSA
                  </div>
                  <div>
                    <p className="font-medium">Fundamentals of Data Science</p>
                    <p className="text-sm text-muted-foreground">5 periods per week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepartmentDashboard;
