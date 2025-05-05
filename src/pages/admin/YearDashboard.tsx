
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const departments = [
  { id: "AI&DS", title: "AI & DS", description: "Artificial Intelligence & Data Science" },
  { id: "IT", title: "IT", description: "Information Technology" },
  { id: "CSE", title: "CSE", description: "Computer Science Engineering" },
  { id: "ECE", title: "ECE", description: "Electronics & Communication" },
  { id: "EEE", title: "EEE", description: "Electrical & Electronics" },
  { id: "MCH", title: "MCH", description: "Mechanical Engineering" },
];

const YearDashboard: React.FC = () => {
  const { year } = useParams<{ year: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Year {year} Dashboard</h2>
          <p className="text-muted-foreground">
            Select a department to view and manage sections
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Link key={dept.id} to={`/admin/dashboard/${year}/${dept.id}`}>
            <Card className="h-full transition-all hover:shadow-md cursor-pointer">
              <CardHeader>
                <CardTitle>{dept.title}</CardTitle>
                <CardDescription>{dept.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {dept.id}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Year {year} Overview</CardTitle>
          <CardDescription>Summary statistics across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Sections</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">720</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Complete Timetables</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Timetables</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YearDashboard;
