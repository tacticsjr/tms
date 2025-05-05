
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Unlock, Save, RotateCcw } from "lucide-react";
import { TimetableData, TimetableDraft, TimeSlot } from "@/types/timetable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const TimetableView: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [originalTimeSlots, setOriginalTimeSlots] = useState<TimeSlot[]>([]);
  const [editingCell, setEditingCell] = useState<{ day: string; period: number } | null>(null);
  const [lockedCells, setLockedCells] = useState<Array<{ day: string; period: number }>>([]);
  const [timetableStats, setTimetableStats] = useState({
    totalSlots: 0,
    assignedSlots: 0,
    unassignedSlots: 0
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periodTimings = [
    "8:30-9:20",
    "9:20-10:10", 
    "10:10-11:00",
    "11:15-12:00", 
    "12:00-12:45",
    "1:35-2:25", 
    "2:25-3:15"
  ];

  // Load timetable data on component mount
  useEffect(() => {
    const storedTimetable = localStorage.getItem(`timetable_ui_${year}_${dept}_${section}`);
    const storedDraft = localStorage.getItem(`timetable_draft_${year}_${dept}_${section}`);
    
    if (storedTimetable) {
      try {
        const parsedTimetable = JSON.parse(storedTimetable) as TimetableData;
        setTimetable(parsedTimetable);
      } catch (error) {
        console.error("Error parsing timetable data:", error);
      }
    }

    if (storedDraft) {
      try {
        const parsedDraft = JSON.parse(storedDraft) as TimetableDraft;
        setOriginalTimeSlots(parsedDraft.timeSlots);
        
        // Calculate statistics
        const validSlots = parsedDraft.timeSlots.filter(slot => !slot.isBreak);
        const assignedSlots = validSlots.filter(slot => slot.subjectId !== null);
        
        setTimetableStats({
          totalSlots: validSlots.length,
          assignedSlots: assignedSlots.length,
          unassignedSlots: validSlots.length - assignedSlots.length
        });
      } catch (error) {
        console.error("Error parsing timetable draft:", error);
      }
    }
  }, [year, dept, section]);
  
  const handleCellClick = (day: string, period: number) => {
    // Check if cell is part of a continuous lab
    const dayData = timetable[day];
    if (!dayData) return;
    
    const cell = dayData[period];
    if (cell && cell.continuous && period > 0) {
      const prevCell = dayData[period - 1];
      if (prevCell && prevCell.continuous && prevCell.subject === cell.subject) {
        // This is a continuation cell, edit the first cell instead
        let firstPeriod = period - 1;
        while (firstPeriod > 0 && 
              dayData[firstPeriod - 1]?.subject === cell.subject) {
          firstPeriod--;
        }
        setEditingCell({ day, period: firstPeriod });
        return;
      }
    }
    
    setEditingCell({ day, period });
  };
  
  const isCellLocked = (day: string, period: number) => {
    return lockedCells.some(cell => cell.day === day && cell.period === period);
  };
  
  const toggleLockCell = (day: string, period: number) => {
    if (isCellLocked(day, period)) {
      setLockedCells(lockedCells.filter(cell => 
        !(cell.day === day && cell.period === period)
      ));
      toast({
        title: "Cell Unlocked",
        description: `${day} Period ${period + 1} is now unlocked and can be changed.`
      });
    } else {
      setLockedCells([...lockedCells, { day, period }]);
      toast({
        title: "Cell Locked",
        description: `${day} Period ${period + 1} is now locked and will be preserved during regeneration.`
      });
    }
  };
  
  const handleSaveTimetable = () => {
    // In a real application, this would send the data to the server
    // For now we'll just persist to localStorage with the locked cells information
    const draft = localStorage.getItem(`timetable_draft_${year}_${dept}_${section}`);
    
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft) as TimetableDraft;
        
        // Update locked status on the timeslots
        const updatedTimeSlots = parsedDraft.timeSlots.map(slot => {
          const isLocked = lockedCells.some(
            cell => cell.day === slot.day && cell.period === slot.period
          );
          
          return {
            ...slot,
            locked: isLocked
          };
        });
        
        // Save the updated draft
        const updatedDraft: TimetableDraft = {
          ...parsedDraft,
          timeSlots: updatedTimeSlots,
          lastUpdated: new Date()
        };
        
        localStorage.setItem(`timetable_draft_${year}_${dept}_${section}`, 
          JSON.stringify(updatedDraft)
        );
        
        toast({
          title: "Timetable Saved",
          description: "Your draft timetable has been saved successfully with locked cells preserved.",
        });
      } catch (error) {
        console.error("Error saving timetable:", error);
        toast({
          title: "Save Failed",
          description: "There was an error saving your timetable.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleRegenerateTimetable = () => {
    toast({
      title: "Regenerating Timetable",
      description: "Please wait while we regenerate your timetable...",
    });
    
    // In a full implementation, this would trigger the regeneration process
    // preserving any locked cells
    setTimeout(() => {
      toast({
        title: "Timetable Regenerated",
        description: "Your timetable has been successfully regenerated preserving locked cells.",
      });
    }, 2000);
  };
  
  // Function to determine if cell is part of tea break or lunch break
  const isBreakPeriod = (period: number) => {
    // Tea break is after period 3, lunch break is after period 5
    return period === 3 || period === 5;
  };

  // Render cell content
  const renderCellContent = (day: string, period: number) => {
    const dayData = timetable[day];
    if (!dayData || !dayData[period]) return null;
    
    const cell = dayData[period];
    
    // If this is a continuation cell (part of a lab span), don't render content
    if (cell.continuous && period > 0) {
      const prevCell = dayData[period - 1];
      if (prevCell && prevCell.continuous && prevCell.subject === cell.subject) {
        return null;
      }
    }
    
    const isLocked = isCellLocked(day, period);
    
    // Determine cell span for lab sessions - only used for visualization below
    const colSpan = cell.continuous && cell.span ? cell.span : 1;
    
    return (
      <div className={`relative p-1 h-full ${cell.continuous ? "bg-muted/30" : ""}`}>
        {cell.subject && (
          <>
            <div className="font-medium">{cell.subject}</div>
            <div className="text-xs text-muted-foreground">{cell.title}</div>
            <div className="text-xs mt-1">{cell.staff}</div>
            
            <div className="absolute top-1 right-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLockCell(day, period);
                }}
              >
                {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

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
          <Link to={`/admin/timetables/${year}/${dept}/${section}`} className="text-muted-foreground hover:text-foreground">
            Timetables
          </Link>
          <span className="text-muted-foreground">/</span>
          <span>Draft View</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mt-2">
          Draft Timetable
        </h2>
        <p className="text-muted-foreground">
          {year} Year {dept} - Section {section}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Analytics Card */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetableStats.totalSlots}</div>
              <p className="text-xs text-muted-foreground">
                Total periods in the schedule
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Assigned Periods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetableStats.assignedSlots}</div>
              <p className="text-xs text-muted-foreground">
                Successfully assigned to subjects
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Free Periods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetableStats.unassignedSlots}</div>
              <p className="text-xs text-muted-foreground">
                Available for additional subjects
              </p>
            </CardContent>
          </Card>
        </div>
        
        {timetableStats.unassignedSlots > 0 && (
          <Alert>
            <AlertTitle className="flex items-center">
              <Badge className="mr-2 bg-yellow-500">Note</Badge>
              Unassigned Periods
            </AlertTitle>
            <AlertDescription>
              There are {timetableStats.unassignedSlots} unassigned periods in the timetable. 
              These can be used for additional subjects or left as free periods.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Timetable Draft</CardTitle>
              <CardDescription>Click on a cell to edit or lock it</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="h-8" onClick={handleRegenerateTimetable}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Regenerate
              </Button>
              <Button className="h-8" onClick={handleSaveTimetable}>
                <Save className="mr-1 h-4 w-4" />
                Save Draft
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Day</TableHead>
                    {periodTimings.slice(0, 7).map((timing, index) => (
                      <TableHead key={index} className={`min-w-[160px] ${isBreakPeriod(index) ? "relative" : ""}`}>
                        Period {index + 1}
                        <div className="text-xs font-normal">{timing}</div>
                        {isBreakPeriod(index) && (
                          <div className="absolute -bottom-3 left-0 right-0 text-[10px] text-center text-muted-foreground">
                            {index === 3 ? "Tea Break" : "Lunch Break"}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(timetable).length > 0 ? (
                    days.map((day) => (
                      <TableRow key={day}>
                        <TableCell className="font-medium">{day}</TableCell>
                        {[0, 1, 2, 3, 4, 5, 6].map((period) => {
                          if (!timetable[day]) return <TableCell key={`${day}-${period}`} />;
                          
                          const cell = timetable[day][period];
                          if (!cell) return <TableCell key={`${day}-${period}`} />;
                          
                          // Skip rendering cells that are part of a multi-period span
                          if (cell.continuous && period > 0) {
                            const prevCell = timetable[day][period - 1];
                            if (prevCell && prevCell.continuous && prevCell.subject === cell.subject) {
                              return null;
                            }
                          }
                          
                          // Calculate colspan for labs
                          const colSpan = cell.continuous && cell.span ? cell.span : 1;
                          
                          return (
                            <TableCell 
                              key={`${day}-${period}`}
                              className={`border ${isCellLocked(day, period) ? "bg-muted/50" : "hover:bg-muted/20"} cursor-pointer`}
                              onClick={() => handleCellClick(day, period)}
                              colSpan={colSpan}
                            >
                              {renderCellContent(day, period)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No timetable data available. Please generate a timetable first.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetableView;
