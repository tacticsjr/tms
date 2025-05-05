
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const yearCards = [
  { id: "I", title: "I Year", description: "First year students" },
  { id: "II", title: "II Year", description: "Second year students" },
  { id: "III", title: "III Year", description: "Third year students" },
  { id: "IV", title: "IV Year", description: "Fourth year students" },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome to the Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Select a year to manage timetables and schedules
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {yearCards.map((card) => (
          <Link key={card.id} to={`/admin/dashboard/${card.id}`}>
            <Card className="h-full transition-all hover:shadow-md cursor-pointer">
              <CardHeader>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {card.id}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Summary of key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">36</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timetables Generated</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Timetable Generated</p>
                  <p className="text-xs text-muted-foreground">II Year - AI&DS - Section B</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  5 mins ago
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Substitution Added</p>
                  <p className="text-xs text-muted-foreground">III Year - CSE - Section A</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  2 hours ago
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Staff Updated</p>
                  <p className="text-xs text-muted-foreground">New faculty added to ECE</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  Yesterday
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
