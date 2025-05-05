
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Unlock, Edit2, Save, RotateCcw } from "lucide-react";

// Define type for timetable entries
interface TimetableEntry {
  subject: string;
  title: string;
  staff: string;
  continuous?: boolean;
  span?: number;
}

// Type for the daily timetable
type DaySchedule = TimetableEntry[];

// Type for the full timetable
interface TimetableData {
  [key: string]: DaySchedule;
}

// Sample timetable data
const sampleTimetableData: TimetableData = {
  Monday: [
    { subject: "PAS", title: "Probability and Statistics", staff: "Ms. Sagaya Rebecca" },
    { subject: "OS", title: "Operating Systems", staff: "Ms. Sujitha" },
    { subject: "ML", title: "Machine Learning", staff: "Ms. P. Abirami" },
    { subject: "FDSA", title: "Fundamentals of Data Science and Analytics", staff: "Ms. Vidya" },
    { subject: "CN", title: "Computer Networks", staff: "Mr. Justin Xavier" },
    { subject: "EVS", title: "Environmental Sciences and Sustainability", staff: "Mr. Siva Karthikeyan" },
    { subject: "ACTIVITY", title: "Department Activity Hour", staff: "All AI&DS Dept Staffs" }
  ],
  Tuesday: [
    { subject: "OS", title: "Operating Systems", staff: "Ms. Sujitha" },
    { subject: "ML", title: "Machine Learning", staff: "Ms. P. Abirami" },
    { subject: "CN", title: "Computer Networks", staff: "Mr. Justin Xavier" },
    { subject: "FDSA_LAB", title: "Data Science and Analytics Laboratory", staff: "Ms. Vidya", continuous: true, span: 3 },
    { subject: "", title: "", staff: "" },
    { subject: "", title: "", staff: "" },
    { subject: "LIB", title: "Library / Skill Rack", staff: "Ms. Vidya" }
  ],
  Wednesday: [
    { subject: "EVS", title: "Environmental Sciences and Sustainability", staff: "Mr. Siva Karthikeyan" },
    { subject: "PAS", title: "Probability and Statistics", staff: "Ms. Sagaya Rebecca" },
    { subject: "OS", title: "Operating Systems", staff: "Ms. Sujitha" },
    { subject: "ML_LAB", title: "Machine Learning Laboratory", staff: "Ms. P. Abirami", continuous: true, span: 3 },
    { subject: "", title: "", staff: "" },
    { subject: "", title: "", staff: "" },
    { subject: "PD", title: "Professional Development", staff: "Ms. Vidya" }
  ],
  Thursday: [
    { subject: "CN", title: "Computer Networks", staff: "Mr. Justin Xavier" },
    { subject: "FDSA", title: "Fundamentals of Data Science and Analytics", staff: "Ms. Vidya" },
    { subject: "PAS", title: "Probability and Statistics", staff: "Ms. Sagaya Rebecca" },
    { subject: "ML", title: "Machine Learning", staff: "Ms. P. Abirami" },
    { subject: "OS", title: "Operating Systems", staff: "Ms. Sujitha" },
    { subject: "EVS", title: "Environmental Sciences and Sustainability", staff: "Mr. Siva Karthikeyan" },
    { subject: "PD", title: "Professional Development", staff: "Ms. Vidya" }
  ],
  Friday: [
    { subject: "ML", title: "Machine Learning", staff: "Ms. P. Abirami" },
    { subject: "CN", title: "Computer Networks", staff: "Mr. Justin Xavier" },
    { subject: "FDSA", title: "Fundamentals of Data Science and Analytics", staff: "Ms. Vidya" },
    { subject: "OS", title: "Operating Systems", staff: "Ms. Sujitha" },
    { subject: "PAS", title: "Probability and Statistics", staff: "Ms. Sagaya Rebecca" },
    { subject: "CN_LAB", title: "Computer Networks Lab", staff: "Mr. Justin Xavier", continuous: true, span: 3 },
    { subject: "", title: "", staff: "" }
  ],
  Saturday: [
    { subject: "FDSA", title: "Fundamentals of Data Science and Analytics", staff: "Ms. Vidya" },
    { subject: "PAS", title: "Probability and Statistics", staff: "Ms. Sagaya Rebecca" },
    { subject: "EVS", title: "Environmental Sciences and Sustainability", staff: "Mr. Siva Karthikeyan" },
    { subject: "OS", title: "Operating Systems", staff: "Ms. Sujitha" },
    { subject: "CN", title: "Computer Networks", staff: "Mr. Justin Xavier" },
    { subject: "ACTIVITY", title: "Department Activity Hour", staff: "All AI&DS Dept Staffs" },
    { subject: "", title: "", staff: "" }
  ]
};

const periodTimings = [
  "8:30-9:20",
  "9:20-10:10", 
  "10:10-11:00",
  "11:15-12:00", // After tea break
  "12:00-12:45",
  "1:35-2:25",  // After lunch break
  "2:25-3:15"
];

const TimetableView: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  
  const [timetable, setTimetable] = useState<TimetableData>(sampleTimetableData);
  const [editingCell, setEditingCell] = useState<{ day: string; period: number } | null>(null);
  const [lockedCells, setLockedCells] = useState<Array<{ day: string; period: number }>>([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const handleCellClick = (day: string, period: number) => {
    // Check if cell is part of a continuous lab
    const cell = timetable[day][period];
    if (cell && cell.continuous && period > 0) {
      const prevCell = timetable[day][period - 1];
      if (prevCell && prevCell.continuous && prevCell.subject === cell.subject) {
        // This is a continuation cell, edit the first cell instead
        let firstPeriod = period - 1;
        while (firstPeriod > 0 && 
               timetable[day][firstPeriod - 1]?.subject === cell.subject) {
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
    } else {
      setLockedCells([...lockedCells, { day, period }]);
    }
  };
  
  const handleSaveTimetable = () => {
    toast({
      title: "Timetable Saved",
      description: "Your draft timetable has been saved successfully.",
    });
  };
  
  const handleRegenerateTimetable = () => {
    toast({
      title: "Regenerating Timetable",
      description: "Please wait while we regenerate your timetable...",
    });
    // This would trigger the regeneration process
    setTimeout(() => {
      toast({
        title: "Timetable Regenerated",
        description: "Your timetable has been successfully regenerated.",
      });
    }, 2000);
  };
  
  // Function to determine if cell is part of tea break or lunch break
  const isBreakPeriod = (period: number) => {
    // Tea break is after period 3, lunch break is after period 5
    return period === 3 || period === 5;
  };

  // This would be used for cell editing, not implemented fully here
  const renderCellContent = (day: string, period: number) => {
    const dayData = timetable[day];
    if (!dayData || !dayData[period]) return null;
    
    const cell = dayData[period];
    
    // If this is a continuation cell (part of a lab span), don't render content
    if (cell.continuous && period > 0) {
      const prevCell = timetable[day][period - 1];
      if (prevCell && prevCell.continuous && prevCell.subject === cell.subject) {
        return null;
      }
    }
    
    const isLocked = isCellLocked(day, period);
    
    // Determine cell span for lab sessions
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
                    {periodTimings.map((timing, index) => (
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
                  {days.map((day) => (
                    <TableRow key={day}>
                      <TableCell className="font-medium">{day}</TableCell>
                      {[0, 1, 2, 3, 4, 5, 6].map((period) => {
                        const dayData = timetable[day];
                        const cell = dayData[period];
                        
                        // Skip rendering cells that are part of a multi-period span
                        if (cell.continuous && period > 0) {
                          const prevCell = dayData[period - 1];
                          if (prevCell.continuous && prevCell.subject === cell.subject) {
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
                  ))}
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
