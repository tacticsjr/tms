import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Unlock, Save, RotateCcw, FileCheck, ArrowRight } from "lucide-react";
import { TimetableData, TimetableDraft, TimeSlot, RecentUpdate } from "@/types/timetable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateTimetable, convertToTimetableData } from "@/utils/timetableGenerator";
import { staffData, subjectData } from "./TimetableGenerator";
import { saveDraftTimetable } from "@/services/timetableService";

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
  // Add state for dialogs
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
 
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
    loadTimetableData();
  }, [year, dept, section]);
 
  // Function to load timetable data
  const loadTimetableData = () => {
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
       
        // Load locked cells from draft
        const lockedSlots = parsedDraft.timeSlots
          .filter(slot => slot.locked)
          .map(slot => ({ day: slot.day, period: slot.period }));
       
        setLockedCells(lockedSlots);
       
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
  };
 
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
 
  const handleSaveTimetable = async () => {
    setIsSaving(true);
    
    try {
      // Get the current timetable grid from state
      if (!timetable || Object.keys(timetable).length === 0) {
        throw new Error("No timetable data to save");
      }
      
      // Save to Supabase
      if (year && dept && section) {
        const saveSuccess = await saveDraftTimetable(
          dept,
          section,
          timetable
        );
        
        if (!saveSuccess) {
          throw new Error("Failed to save timetable to database");
        }
      }
      
      // Also save to localStorage as before for backward compatibility
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
          const currentTime = new Date();
          const updatedDraft: TimetableDraft = {
            ...parsedDraft,
            timeSlots: updatedTimeSlots,
            lastUpdated: currentTime
          };
         
          localStorage.setItem(`timetable_draft_${year}_${dept}_${section}`,
            JSON.stringify(updatedDraft)
          );
          
          // Add to recent updates in app state
          const appStateKey = `appState_${year}_${dept}_${section}`;
          const appStateStr = localStorage.getItem(appStateKey);
          
          if (appStateStr) {
            try {
              const appState = JSON.parse(appStateStr);
              
              // Create a new update
              const newUpdate: RecentUpdate = {
                id: `update_${Date.now()}`,
                time: currentTime,
                message: `Timetable draft saved for ${year} Year ${dept} - Section ${section}`,
                type: 'timetable',
                relatedId: `${year}_${dept}_${section}_draft`
              };
              
              // Update the app state with the new update
              const updatedAppState = {
                ...appState,
                recentUpdates: [newUpdate, ...appState.recentUpdates.slice(0, 19)]
              };
              
              // Save the updated app state
              localStorage.setItem(appStateKey, JSON.stringify(updatedAppState));
            } catch (error) {
              console.error("Error updating app state:", error);
            }
          }
        } catch (error) {
          console.error("Error saving local timetable:", error);
        }
      }
      
      setTimeout(() => {
        setIsSaving(false);
        setSaveComplete(true);
        
        toast({
          title: "Timetable Saved",
          description: "Your draft timetable has been saved successfully with locked cells preserved.",
        });
        
        setTimeout(() => {
          setSaveComplete(false);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error("Error saving timetable:", error);
      setIsSaving(false);
      toast({
        title: "Save Failed",
        description: `There was an error saving your timetable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
 
  const handleRegenerateTimetable = () => {
    setIsRegenerating(true);
   
    // First, save the current locked cells to ensure they're preserved
    const draft = localStorage.getItem(`timetable_draft_${year}_${dept}_${section}`);
   
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft) as TimetableDraft;
       
        // Get the selected subject IDs from the current timetable
        const usedSubjects = new Set<string>();
        parsedDraft.timeSlots.forEach(slot => {
          if (slot.subjectId) {
            usedSubjects.add(slot.subjectId);
          }
        });
        const selectedSubjectIds = Array.from(usedSubjects);
       
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
       
        // Save the updated draft with locked cells
        const updatedDraft = {
          ...parsedDraft,
          timeSlots: updatedTimeSlots,
          lastUpdated: new Date()
        };
       
        localStorage.setItem(`timetable_draft_${year}_${dept}_${section}`,
          JSON.stringify(updatedDraft)
        );
       
        // Prepare the subjects for regeneration
        const subjectsToUse = subjectData.filter(subject => selectedSubjectIds.includes(subject.id));
       
        // Prepare timetable settings with locked cells constraint enabled
        const timetableSettings = {
          periodsPerDay: 7, // Use the same period count as the original
          periodTimings: periodTimings,
          breaks: [
            { name: "Tea Break", after: 3 },
            { name: "Lunch Break", after: 5 }
          ],
          hardConstraints: {
            noTeacherOverlap: true,
            exactSubjectCounts: true,
            preserveLockedSlots: true // Important: ensure this is true
          },
          softConstraints: {
            loadBalancing: true,
            priorityScheduling: true,
            labClustering: true,
            teacherPreferences: false,
            requireBackupTeacher: false
          }
        };
       
        // Generate new timetable while respecting locked cells
        setTimeout(() => {
          try {
            // Generate the timetable using our algorithm from TimetableGenerator
            const newTimeSlots = generateTimetable(subjectsToUse, staffData, timetableSettings);
           
            // Update the draft with new time slots
            const regeneratedDraft = {
              ...updatedDraft,
              timeSlots: newTimeSlots,
              lastUpdated: new Date()
            };
           
            // Convert to UI format for the timetable view
            const uiTimetableData = convertToTimetableData(newTimeSlots, subjectsToUse, staffData);
           
            // Save both formats
            localStorage.setItem(`timetable_draft_${year}_${dept}_${section}`,
              JSON.stringify(regeneratedDraft)
            );
            localStorage.setItem(`timetable_ui_${year}_${dept}_${section}`,
              JSON.stringify(uiTimetableData)
            );
           
            // Update the UI
            setTimetable(uiTimetableData);
            setOriginalTimeSlots(newTimeSlots);
           
            // Recalculate statistics
            const validSlots = newTimeSlots.filter(slot => !slot.isBreak);
            const assignedSlots = validSlots.filter(slot => slot.subjectId !== null);
           
            setTimetableStats({
              totalSlots: validSlots.length,
              assignedSlots: assignedSlots.length,
              unassignedSlots: validSlots.length - assignedSlots.length
            });
           
            setIsRegenerating(false);
           
            toast({
              title: "Timetable Regenerated",
              description: "Your timetable has been successfully regenerated with locked cells preserved.",
            });
          } catch (error) {
            console.error("Error regenerating timetable:", error);
            setIsRegenerating(false);
           
            toast({
              title: "Regeneration Failed",
              description: "There was an error regenerating the timetable. Please try again.",
              variant: "destructive",
            });
          }
        }, 2000); // Simulate processing time
      } catch (error) {
        console.error("Error preparing for regeneration:", error);
        setIsRegenerating(false);
       
        toast({
          title: "Regeneration Failed",
          description: "There was an error preparing the timetable for regeneration.",
          variant: "destructive",
        });
      }
    } else {
      setIsRegenerating(false);
      toast({
        title: "No Draft Found",
        description: "No timetable draft found to regenerate.",
        variant: "destructive",
      });
    }
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
 
  // Add a new function to handle promoting to master
  const handlePromoteToMaster = () => {
    // First save the current draft
    handleSaveTimetable();
    
    // Navigate to the master timetable page where they can promote it
    setTimeout(() => {
      window.location.href = `/admin/master/${year}/${dept}/${section}`;
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Add breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/dashboard/${year}`}>{year} Year</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/dashboard/${year}/${dept}`}>{dept}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/dashboard/${year}/${dept}/${section}`}>Section {section}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Timetable Draft</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
              <Button variant="secondary" className="h-8" onClick={handlePromoteToMaster}>
                <ArrowRight className="mr-1 h-4 w-4" />
                Review & Promote
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
 
      {/* Regeneration dialog */}
      <Dialog open={isRegenerating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regenerating your timetable</DialogTitle>
            <DialogDescription>
              Preserving locked cells and optimizing the schedule
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="spinner h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Applying constraints and reassigning periods...</p>
              <p className="text-xs text-muted-foreground">Locked cells will be preserved</p>
            </div>
          </div>
          <style>
            {`.radix-dialog-close-button { display: none; }`}
          </style>
        </DialogContent>
      </Dialog>
      
      {/* Saving dialog */}
      <Dialog open={isSaving || saveComplete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{saveComplete ? "Timetable Saved Successfully" : "Saving Timetable Draft"}</DialogTitle>
            <DialogDescription>
              {saveComplete 
                ? "Your timetable draft has been saved with locked cells preserved"
                : "Please wait while we save your draft timetable"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            {isSaving ? (
              <div className="spinner h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FileCheck className="h-6 w-6" />
              </div>
            )}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                {isSaving 
                  ? "Saving your timetable configuration..." 
                  : "Your timetable has been saved!"
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {isSaving
                  ? "This will just take a moment"
                  : "All locked cells and schedule changes have been preserved"
                }
              </p>
            </div>
          </div>
          {saveComplete && (
            <DialogFooter>
              <Button variant="outline" className="w-full" onClick={() => setSaveComplete(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
          <style>
            {`.radix-dialog-close-button { display: none; }`}
          </style>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetableView;
