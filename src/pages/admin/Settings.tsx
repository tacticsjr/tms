
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Settings: React.FC = () => {
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  const handleResetSettings = () => {
    toast({
      title: "Settings Reset",
      description: "Your settings have been reset to default values",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application preferences and configurations
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure global system parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input 
                id="academicYear" 
                defaultValue="2024-2025" 
                placeholder="e.g. 2024-2025"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semester">Current Semester</Label>
              <Input 
                id="semester" 
                defaultValue="Even Semester" 
                placeholder="e.g. Even Semester"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="institution">Institution Name</Label>
              <Input 
                id="institution" 
                defaultValue="Velammal Institute of Technology" 
                placeholder="Enter institution name"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="emailNotifications" defaultChecked />
              <Label htmlFor="emailNotifications">Email Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="autoLogout" defaultChecked />
              <Label htmlFor="autoLogout">Auto Logout (30 min inactivity)</Label>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configure email notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input 
                id="adminEmail" 
                type="email"
                defaultValue="monimonesh2327@gmail.com" 
                placeholder="Enter admin email"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="timetableEmails" defaultChecked />
              <Label htmlFor="timetableEmails">Send timetable update emails</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="substitutionEmails" defaultChecked />
              <Label htmlFor="substitutionEmails">Send substitution notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="reminderEmails" defaultChecked />
              <Label htmlFor="reminderEmails">Send class reminders (35 min before)</Label>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Scheduling Settings</CardTitle>
            <CardDescription>
              Configure AI timetable generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="optimizationLevel">Optimization Level</Label>
              <Input 
                id="optimizationLevel" 
                type="range"
                min={1}
                max={5}
                defaultValue={3}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Faster</span>
                <span>Balanced</span>
                <span>Better Quality</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="enableAI" defaultChecked />
              <Label htmlFor="enableAI">Enable AI scheduling suggestions</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="autoRegeneration" defaultChecked />
              <Label htmlFor="autoRegeneration">Suggest timetable improvements</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="conflictResolution" defaultChecked />
              <Label htmlFor="conflictResolution">Automatic conflict resolution</Label>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleResetSettings}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
