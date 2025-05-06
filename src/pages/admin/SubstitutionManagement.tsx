
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AppState, Substitution, Staff, RecentUpdate, createSectionKey } from "@/types/timetable";
import { ArrowLeft, Plus, Bell } from "lucide-react";

const SubstitutionManagement: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
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

  const handleMarkAbsent = () => {
    if (!appState || !selectedStaff || !year || !dept || !section) return;
    
    // Find the staff member
    const absentStaff = appState.staffList.find(staff => staff.id === selectedStaff);
    if (!absentStaff) return;
    
    // Create a new substitution
    const newSubstitution: Substitution = {
      id: `sub_${Date.now()}`,
      slotId: `${selectedDay}_${selectedPeriod}`,
      originalTeacherId: selectedStaff,
      substituteTeacherId: "",
      createdAt: new Date(),
      day: selectedDay,
      period: selectedPeriod,
      section: section,
      dept: dept,
      year: year
    };
    
    // Create a recent update
    const newUpdate: RecentUpdate = {
      id: `update_${Date.now()}`,
      time: new Date(),
      message: `${absentStaff.name} marked absent for ${selectedDay} Period ${selectedPeriod}`,
      type: 'substitution',
      relatedId: newSubstitution.id
    };
    
    // Update the app state
    const updatedAppState = {
      ...appState,
      substitutions: [...appState.substitutions, newSubstitution],
      recentUpdates: [newUpdate, ...appState.recentUpdates.slice(0, 19)]
    };
    
    setAppState(updatedAppState);
    
    // Save to localStorage
    localStorage.setItem(`appState_${year}_${dept}_${section}`, JSON.stringify(updatedAppState));
    
    toast({
      title: "Absence marked",
      description: `${absentStaff.name} has been marked absent for ${selectedDay} Period ${selectedPeriod}.`,
    });
  };

  const handleAssignSubstitute = (substitutionId: string, substituteId: string) => {
    if (!appState || !year || !dept || !section) return;
    
    // Find the substitution and staff members
    const substitution = appState.substitutions.find(sub => sub.id === substitutionId);
    if (!substitution) return;
    
    const originalStaff = appState.staffList.find(staff => staff.id === substitution.originalTeacherId);
    const substituteStaff = appState.staffList.find(staff => staff.id === substituteId);
    if (!originalStaff || !substituteStaff) return;
    
    // Update the substitution
    const updatedSubstitutions = appState.substitutions.map(sub => 
      sub.id === substitutionId ? { ...sub, substituteTeacherId: substituteId } : sub
    );
    
    // Create a recent update
    const newUpdate: RecentUpdate = {
      id: `update_${Date.now()}`,
      time: new Date(),
      message: `${substituteStaff.name} assigned as substitute for ${originalStaff.name} on ${substitution.day} Period ${substitution.period}`,
      type: 'substitution',
      relatedId: substitutionId
    };
    
    // Update the app state
    const updatedAppState = {
      ...appState,
      substitutions: updatedSubstitutions,
      recentUpdates: [newUpdate, ...appState.recentUpdates.slice(0, 19)]
    };
    
    setAppState(updatedAppState);
    
    // Save to localStorage
    localStorage.setItem(`appState_${year}_${dept}_${section}`, JSON.stringify(updatedAppState));
    
    toast({
      title: "Substitute assigned",
      description: `${substituteStaff.name} has been assigned as substitute for ${originalStaff.name}.`,
    });
    
    // Send a simulated notification
    setTimeout(() => {
      toast({
        title: "Notification sent",
        description: `${substituteStaff.name} has been notified of the substitution.`,
      });
    }, 1000);
  };

  const getAvailableSubstitutes = (originalStaffId: string, day: string, period: number): Staff[] => {
    if (!appState) return [];
    
    // Get the current substitutions for the day and period
    const currentSubs = appState.substitutions.filter(
      sub => sub.day === day && sub.period === period && sub.substituteTeacherId
    );
    
    // Get the IDs of staff who are already assigned as substitutes
    const assignedSubstituteIds = currentSubs.map(sub => sub.substituteTeacherId);
    
    // Filter out the original staff member and already assigned substitutes
    return appState.staffList.filter(staff => 
      staff.id !== originalStaffId && !assignedSubstituteIds.includes(staff.id)
    );
  };

  const getStaffName = (staffId: string): string => {
    if (!appState) return "Unknown";
    const staff = appState.staffList.find(s => s.id === staffId);
    return staff ? staff.name : "Unknown";
  };

  if (!appState) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const pendingSubstitutions = appState.substitutions.filter(sub => !sub.substituteTeacherId);
  const completedSubstitutions = appState.substitutions.filter(sub => sub.substituteTeacherId);

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
          <span>Substitutions</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mt-2">
          Substitution Management
        </h2>
        <p className="text-muted-foreground">
          Manage staff absences and substitutions
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
          <CardTitle>Mark Staff Absence</CardTitle>
          <CardDescription>
            Record a staff absence and assign a substitute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Staff Member</label>
              <Select onValueChange={setSelectedStaff}>
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
            
            <div>
              <label className="text-sm font-medium block mb-2">Day</label>
              <Select defaultValue={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Period</label>
              <Select defaultValue={selectedPeriod.toString()} onValueChange={(value) => setSelectedPeriod(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map(period => (
                    <SelectItem key={period} value={period.toString()}>
                      Period {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleMarkAbsent} 
                disabled={!selectedStaff} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Mark Absent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Substitutions</CardTitle>
          <CardDescription>
            Staff absences that require substitutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSubstitutions.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No pending substitutions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubstitutions.map(substitution => (
                  <TableRow key={substitution.id}>
                    <TableCell>
                      <div className="font-medium">{getStaffName(substitution.originalTeacherId)}</div>
                    </TableCell>
                    <TableCell>{substitution.day}</TableCell>
                    <TableCell>Period {substitution.period}</TableCell>
                    <TableCell>{new Date(substitution.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => handleAssignSubstitute(substitution.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Assign substitute" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSubstitutes(
                            substitution.originalTeacherId, 
                            substitution.day, 
                            substitution.period
                          ).map(staff => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Completed Substitutions</CardTitle>
          <CardDescription>
            Recent substitution assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedSubstitutions.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No completed substitutions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Absent Staff</TableHead>
                  <TableHead>Substitute</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedSubstitutions.map(substitution => (
                  <TableRow key={substitution.id}>
                    <TableCell>
                      <div className="font-medium">{getStaffName(substitution.originalTeacherId)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getStaffName(substitution.substituteTeacherId)}</div>
                    </TableCell>
                    <TableCell>{substitution.day}</TableCell>
                    <TableCell>Period {substitution.period}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">Assigned</Badge>
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

export default SubstitutionManagement;
