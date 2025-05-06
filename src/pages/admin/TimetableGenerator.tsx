
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Subject,
  Staff,
  TimetableSettings,
  TimeSlot,
  TimetableDraft
} from "@/types/timetable";
import { generateTimetable, convertToTimetableData } from "@/utils/timetableGenerator";
import { Timer } from "lucide-react";
 
// Sample subject data
export const staffData: Staff[] = [
  {
    id: "1",
    name: "Sagaya Rebecca",
    email: "sagaya@velammal.edu",
    maxPeriods: 5
  },
  {
    id: "2",
    name: "Sujitha",
    email: "sujitha@velammal.edu", 
    maxPeriods: 6
  },
  {
    id: "3",
    name: "P. Abirami",
    email: "abirami@velammal.edu", 
    maxPeriods: 6
  },
  {
    id: "4",
    name: "Vidya",
    email: "vidya@velammal.edu",
    maxPeriods: 7
  },
  {
    id: "5",
    name: "Justin Xavier",
    email: "justin@velammal.edu",
    maxPeriods: 5
  },
  {
    id: "6",
    name: "Siva Karthikeyan",
    email: "siva@velammal.edu",
    maxPeriods: 4
  },
];
 
export const subjectData: Subject[] = [
  {
    id: "1",
    code: "MA8402",
    name: "Probability and Statistics",
    title: "Probability and Statistics",
    staff: "Ms. Sagaya Rebecca",
    shortName: "PAS",
    type: "Theory",
    periodsPerWeek: 5,
    isLab: false,
    staffId: "1",
    priority: 1,
  },
  {
    id: "2",
    code: "CS8491",
    name: "Operating Systems",
    shortName: "OS",
    periodsPerWeek: 4,
    isLab: false,
    staffId: "2",
    type: "Theory",
    priority: 1, 
    title: "Operating Systems", 
    staff: "Ms. Sujitha"
  },
  {
    id: "3",
    code: "CS8491",
    name: "Machine Learning",
    shortName: "ML",
    type: "Theory",
    periodsPerWeek: 5,
    title: "Machine Learning", 
    staff: "Ms. P. Abirami",
    isLab: false,
    staffId: "3",
    priority: 1,
  },
  {
    id: "4",
    code: "AD8401",
    name: "Fundamentals of Data Science and Analytics",
    shortName: "FDSA",
    periodsPerWeek: 5,
    type: "Theory",
    isLab: false,
    staffId: "4",
    priority: 1,
    title: "Fundamentals of Data Science and Analytics", 
    staff: "Ms. Vidya"
  },
  {
    id: "5",
    code: "CS8591",
    name: "Computer Networks",
    shortName: "CN",
    periodsPerWeek: 4,
    type: "Theory",
    isLab: false,
    staffId: "5",
    priority: 1, 
    title: "Computer Networks", 
    staff: "Mr. Justin Xavier"
  },
  {
    id: "6",
    code: "GE8561",
    name: "Environmental Sciences and Sustainability",
    shortName: "EVS",
    periodsPerWeek: 4,
    type: "Theory",
    isLab: false,
    staffId: "6",
    priority: 2,
    title: "Environmental Sciences and Sustainability", 
    staff: "Mr. Siva Karthikeyan"
  },
  {
    id: "7",
    code: "AD8411",
    name: "Data Science and Analytics Laboratory",
    shortName: "FDSA LAB",
    periodsPerWeek: 3,
    isLab: true,
    type: "Lab",
    staffId: "4",
    priority: 3, 
    title: "Data Science and Analytics Laboratory", 
    staff: "Ms. Vidya", 
    continuous: true, 
    span: 3
  },
  {
    id: "8",
    code: "CS8581",
    name: "Machine Learning Laboratory",
    shortName: "ML LAB",
    periodsPerWeek: 3,
    type: "Lab",
    isLab: true,
    staffId: "3",
    priority: 3,
    title: "Machine Learning Laboratory", 
    staff: "Ms. P. Abirami", 
    continuous: true, 
    span: 3
  },
  {
    id: "9",
    code: "CS8581",
    name: "Computer Networks Laboratory",
    shortName: "CN LAB",
    type: "Lab",
    periodsPerWeek: 2,
    isLab: true,
    staffId: "5",
    priority: 3,
    title: "Computer Networks Lab", 
    staff: "", 
    continuous: true, 
    span: 3
  },
  {
    id: "10",
    code: "AD8071",
    name: "Department Activity Hour",
    shortName: "ACTIVITY",
    periodsPerWeek: 2, 
    type: "Activity",
    isLab: false,
    staffId: "4",
    priority: 4,
    title: "Department Activity Hour", 
    staff: "All AI&DS Dept Staffs"
  },
  {
    id: "11",
    code: "HS8581",
    name: "Professional Development",
    shortName: "PD",
    periodsPerWeek: 2,
    isLab: false, 
    type: "Activity",
    staffId: "4",
    priority: 2,
    title: "Professional Development", 
    staff: "Ms. Vidya"
  },
  {
    id: "12",
    code: "LIB1001",
    name: "Library / Skill Rack",
    shortName: "LIB/SKILL RACK", 
    type: "Activity",
    periodsPerWeek: 1,
    isLab: false,
    staffId: "4",
    priority: 5, 
    title: "Library / Skill Rack", 
    staff: "Ms. Vidya"
  },
  {
    id: "13",
    code: "AL3452",
    name: "Operating System Laboratory",
    shortName: "OS LAB",
    periodsPerWeek: 2,
    type: "Lab",
    isLab: true,
    staffId: "4",
    priority: 5,
    title: "Operating System Laboratory",
    staff: "Ms. Sujitha"
  },
];
 
// Default period timings
const defaultPeriodTimings = [
  "8:30-9:20",
  "9:20-10:10",
  "10:10-11:00",
  "11:15-12:00", // After tea break
  "12:00-12:45",
  "1:35-2:25",  // After lunch break
  "2:25-3:15"
];
 
const TimetableGenerator: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
 
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [periodsPerDay, setPeriodsPerDay] = useState<number>(7);
  const [showTeaBreak, setShowTeaBreak] = useState<boolean>(true);
  const [showLunchBreak, setShowLunchBreak] = useState<boolean>(true);
  const [hardConstraints, setHardConstraints] = useState({
    noTeacherOverlap: true,
    exactSubjectCounts: true,
    preserveLockedSlots: true
  });
  const [softConstraints, setSoftConstraints] = useState({
    loadBalancing: true,
    priorityScheduling: true,
    labClustering: true,
    teacherPreferences: false,
    requireBackupTeacher: false
  });
 
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState<TimeSlot[]>([]);
 
  // Calculate total periods selected
  const totalPeriodsSelected = selectedSubjects.reduce((total, subjectId) => {
    const subject = subjectData.find(s => s.id === subjectId);
    return total + (subject?.periodsPerWeek || 0);
  }, 0);
 
  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    }
  };
 
  const handleGenerate = () => {
    if (selectedSubjects.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one subject to generate a timetable",
        variant: "destructive",
      });
      return;
    }
   
    setIsGenerating(true);
   
    // Prepare the subjects for generation
    const subjectsToUse = subjectData.filter(subject => selectedSubjects.includes(subject.id));
   
    // Prepare the timetable settings
    const timetableSettings: TimetableSettings = {
      periodsPerDay,
      periodTimings: defaultPeriodTimings.slice(0, periodsPerDay),
      breaks: [
        ...(showTeaBreak ? [{ name: "Tea Break", after: 3 }] : []),
        ...(showLunchBreak ? [{ name: "Lunch Break", after: 5 }] : []),
      ],
      hardConstraints,
      softConstraints
    };
   
    // Generate the timetable after a short delay to allow the UI to update
    setTimeout(() => {
      try {
        // Generate the timetable using our algorithm
        const timetable = generateTimetable(subjectsToUse, staffData, timetableSettings);
       
        // Store the generated timetable
        setGeneratedTimetable(timetable);
       
        // Save as a draft
        const draft: TimetableDraft = {
          id: `${year}_${dept}_${section}_draft`,
          name: `${year} Year ${dept} Section ${section} Draft`,
          year: year || '',
          dept: dept || '',
          section: section || '',
          timeSlots: timetable,
          lastUpdated: new Date()
        };
       
        // In a real app, we would persist this draft
        // For now, we'll just store it in localStorage for demo purposes
        localStorage.setItem(`timetable_draft_${year}_${dept}_${section}`, JSON.stringify(draft));
       
        // Convert to UI format and store for the timetable view
        const uiTimetableData = convertToTimetableData(timetable, subjectsToUse, staffData);
        localStorage.setItem(`timetable_ui_${year}_${dept}_${section}`, JSON.stringify(uiTimetableData));
       
        setIsGenerating(false);
        setGenerationComplete(true);
       
        toast({
          title: "Timetable Generated",
          description: "The timetable draft has been successfully created",
        });
      } catch (error) {
        console.error("Error generating timetable:", error);
        setIsGenerating(false);
       
        toast({
          title: "Generation Failed",
          description: "There was an error generating the timetable. Please try again.",
          variant: "destructive",
        });
      }
    }, 2000);
  };
 
  // Function to handle view draft timetable button click
  const handleViewDraft = () => {
    toast({
      title: "Redirecting",
      description: "Taking you to the draft timetable editor",
    });
    // Navigate to the timetable view page
    navigate(`/admin/timetables/${year}/${dept}/${section}/draft`);
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
          <span>Timetables</span>
        </div>
       
        <h2 className="text-3xl font-bold tracking-tight mt-2">
          Generate Timetable
        </h2>
        <p className="text-muted-foreground">
          {year} Year {dept} - Section {section}
        </p>
      </div>
 
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Staff Assignment</CardTitle>
              <CardDescription>Faculty members available for this section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffData.filter(staff => staff.id !== "ALL").map(staff => (
                  <div key={staff.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.email}</p>
                    </div>
                    <div className="text-sm">
                      Max: <span className="font-medium">{staff.maxPeriods}</span> periods/day
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader>
              <CardTitle>Select Subjects</CardTitle>
              <CardDescription>Choose which subjects to include in this timetable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Theory Subjects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjectData
                    .filter(subject => subject.type === "Theory")
                    .map(subject => (
                      <div key={subject.id} className="flex items-center space-x-2 border rounded-md p-3">
                        <Checkbox
                          id={subject.id}
                          checked={selectedSubjects.includes(subject.id)}
                          onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked as boolean)}
                        />
                        <div className="grid gap-0.5">
                          <Label htmlFor={subject.id} className="font-medium cursor-pointer">
                            {subject.code} ({subject.title})
                          </Label>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{subject.staff || "Unassigned"}</span>
                            <span>{subject.periodsPerWeek} periods</span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
 
                <h3 className="font-medium text-sm mt-6">Lab Sessions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjectData
                    .filter(subject => subject.type === "Lab")
                    .map(subject => (
                      <div key={subject.id} className="flex items-center space-x-2 border rounded-md p-3">
                        <Checkbox
                          id={subject.id}
                          checked={selectedSubjects.includes(subject.id)}
                          onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked as boolean)}
                        />
                        <div className="grid gap-0.5 w-full">
                          <Label htmlFor={subject.id} className="font-medium cursor-pointer">
                            {subject.code} ({subject.title})
                          </Label>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{subject.staff || "Unassigned"}</span>
                            <span>{subject.periodsPerWeek} periods (continuous)</span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
 
                <h3 className="font-medium text-sm mt-6">Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subjectData
                    .filter(subject => subject.type === "Activity")
                    .map(subject => (
                      <div key={subject.id} className="flex items-center space-x-2 border rounded-md p-3">
                        <Checkbox
                          id={subject.id}
                          checked={selectedSubjects.includes(subject.id)}
                          onCheckedChange={(checked) => handleSubjectToggle(subject.id, checked as boolean)}
                        />
                        <div className="grid gap-0.5">
                          <Label htmlFor={subject.id} className="font-medium cursor-pointer">
                            {subject.code} ({subject.title})
                          </Label>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{subject.staff || "Unassigned"}</span>
                            <span>{subject.periodsPerWeek} periods</span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
 
              <div className="mt-6 p-4 bg-muted/50 rounded-md">
                <h3 className="font-medium">Weekly Summary</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>Total Selected:</div>
                  <div className="font-medium">{totalPeriodsSelected} periods</div>
                  <div>Theory:</div>
                  <div className="font-medium">
                    {selectedSubjects.reduce((total, subjectId) => {
                      const subject = subjectData.find(s => s.id === subjectId && s.type === "Theory");
                      return total + (subject?.periodsPerWeek || 0);
                    }, 0)} periods
                  </div>
                  <div>Lab Sessions:</div>
                  <div className="font-medium">
                    {selectedSubjects.reduce((total, subjectId) => {
                      const subject = subjectData.find(s => s.id === subjectId && s.type === "Lab");
                      return total + (subject?.periodsPerWeek || 0);
                    }, 0)} periods
                  </div>
                  <div>Activities:</div>
                  <div className="font-medium">
                    {selectedSubjects.reduce((total, subjectId) => {
                      const subject = subjectData.find(s => s.id === subjectId && s.type === "Activity");
                      return total + (subject?.periodsPerWeek || 0);
                    }, 0)} periods
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
 
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timetable Settings</CardTitle>
              <CardDescription>Configure generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="periodsPerDay">Periods Per Day</Label>
                <Input
                  id="periodsPerDay"
                  type="number"
                  min={1}
                  max={10}
                  value={periodsPerDay}
                  onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                />
              </div>
             
              <div className="space-y-2">
                <Label>Break Slots</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="teaBreak"
                    checked={showTeaBreak}
                    onCheckedChange={setShowTeaBreak}
                  />
                  <Label htmlFor="teaBreak">Tea Break (after P3)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lunchBreak"
                    checked={showLunchBreak}
                    onCheckedChange={setShowLunchBreak}
                  />
                  <Label htmlFor="lunchBreak">Lunch Break (after P5)</Label>
                </div>
              </div>
             
              <div className="space-y-2">
                <Label>Hard Constraints</Label>
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="noTeacherOverlap"
                      checked={hardConstraints.noTeacherOverlap}
                      onCheckedChange={(checked) =>
                        setHardConstraints({...hardConstraints, noTeacherOverlap: checked})
                      }
                    />
                    <Label htmlFor="noTeacherOverlap">No teacher overlap</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="exactSubjectCounts"
                      checked={hardConstraints.exactSubjectCounts}
                      onCheckedChange={(checked) =>
                        setHardConstraints({...hardConstraints, exactSubjectCounts: checked})
                      }
                    />
                    <Label htmlFor="exactSubjectCounts">Exact subject counts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preserveLockedSlots"
                      checked={hardConstraints.preserveLockedSlots}
                      onCheckedChange={(checked) =>
                        setHardConstraints({...hardConstraints, preserveLockedSlots: checked})
                      }
                    />
                    <Label htmlFor="preserveLockedSlots">Preserve locked slots</Label>
                  </div>
                </div>
              </div>
             
              <div className="space-y-2">
                <Label>Soft Constraints</Label>
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="loadBalancing"
                      checked={softConstraints.loadBalancing}
                      onCheckedChange={(checked) =>
                        setSoftConstraints({...softConstraints, loadBalancing: checked})
                      }
                    />
                    <Label htmlFor="loadBalancing">Load balancing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="priorityScheduling"
                      checked={softConstraints.priorityScheduling}
                      onCheckedChange={(checked) =>
                        setSoftConstraints({...softConstraints, priorityScheduling: checked})
                      }
                    />
                    <Label htmlFor="priorityScheduling">Priority scheduling</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="labClustering"
                      checked={softConstraints.labClustering}
                      onCheckedChange={(checked) =>
                        setSoftConstraints({...softConstraints, labClustering: checked})
                      }
                    />
                    <Label htmlFor="labClustering">Lab clustering</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="teacherPreferences"
                      checked={softConstraints.teacherPreferences}
                      onCheckedChange={(checked) =>
                        setSoftConstraints({...softConstraints, teacherPreferences: checked})
                      }
                    />
                    <Label htmlFor="teacherPreferences">Teacher time preferences</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireBackupTeacher"
                      checked={softConstraints.requireBackupTeacher}
                      onCheckedChange={(checked) =>
                        setSoftConstraints({...softConstraints, requireBackupTeacher: checked})
                      }
                    />
                    <Label htmlFor="requireBackupTeacher">Backup teacher requirement</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedSubjects.length === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <Timer className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                    Generating...
                  </div>
                ) : (
                  "Generate Timetable"
                )}
              </Button>
            </CardFooter>
          </Card>
         
          {generationComplete && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Generation Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-lg font-medium">Timetable draft created!</p>
                  <p className="text-sm text-muted-foreground mt-1">Click below to view and edit.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleViewDraft}
                >
                  View Draft Timetable
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
 
      {/* AI generation dialog */}
      <Dialog open={isGenerating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI is generating your timetable</DialogTitle>
            <DialogDescription>
              This process may take a few moments to complete
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="spinner h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Optimizing faculty schedules...</p>
              <p className="text-xs text-muted-foreground">Applying hard and soft constraints</p>
            </div>
          </div>
          <style>
            {`.radix-dialog-close-button { display: none; }`}
          </style>
        </DialogContent>
      </Dialog>
    </div>
  );
};
 
export default TimetableGenerator;
