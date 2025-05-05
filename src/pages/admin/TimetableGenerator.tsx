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
  DialogClose,
} from "@/components/ui/dialog";

// Sample subject data
const sampleSubjects = [
  { id: "PAS", code: "PAS", title: "Probability and Statistics", type: "Theory", periods: 5, staff: "Ms. Sagaya Rebecca" },
  { id: "OS", code: "OS", title: "Operating Systems", type: "Theory", periods: 6, staff: "Ms. Sujitha" },
  { id: "ML", code: "ML", title: "Machine Learning", type: "Theory", periods: 5, staff: "Ms. P. Abirami" },
  { id: "FDSA", code: "FDSA", title: "Fundamentals of Data Science and Analytics", type: "Theory", periods: 5, staff: "Ms. Vidya" },
  { id: "CN", code: "CN", title: "Computer Networks", type: "Theory", periods: 6, staff: "Mr. Justin Xavier" },
  { id: "EVS", code: "EVS", title: "Environmental Sciences and Sustainability", type: "Theory", periods: 4, staff: "Mr. Siva Karthikeyan" },
  { id: "FDSA_LAB", code: "FDSA LAB", title: "Data Science and Analytics Laboratory", type: "Lab", periods: 3, continuous: true, staff: "Ms. Vidya" },
  { id: "ML_LAB", code: "ML LAB", title: "Machine Learning Laboratory", type: "Lab", periods: 3, continuous: true, staff: "Ms. P. Abirami" },
  { id: "CN_LAB", code: "CN LAB", title: "Computer Networks Lab", type: "Lab", periods: 3, continuous: true, staff: "" },
  { id: "ACTIVITY", code: "ACTIVITY", title: "Department Activity Hour", type: "Activity", periods: 2, staff: "All AI&DS Dept Staffs" },
  { id: "PD", code: "PD", title: "Professional Development", type: "Activity", periods: 2, staff: "Ms. Vidya" },
  { id: "LIB", code: "LIB/SKILL RACK", title: "Library / Skill Rack", type: "Activity", periods: 1, staff: "Ms. Vidya" },
];

// Sample staff data
const sampleStaff = [
  { id: "SR", name: "Ms. Sagaya Rebecca", email: "sagaya@velammal.edu", maxPeriods: 5 },
  { id: "SJ", name: "Ms. Sujitha", email: "sujitha@velammal.edu", maxPeriods: 6 },
  { id: "PA", name: "Ms. P. Abirami", email: "abirami@velammal.edu", maxPeriods: 6 },
  { id: "VD", name: "Ms. Vidya", email: "vidya@velammal.edu", maxPeriods: 7 },
  { id: "JX", name: "Mr. Justin Xavier", email: "justin@velammal.edu", maxPeriods: 5 },
  { id: "SK", name: "Mr. Siva Karthikeyan", email: "siva@velammal.edu", maxPeriods: 4 },
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
  
  // Calculate total periods selected
  const totalPeriodsSelected = selectedSubjects.reduce((total, subjectId) => {
    const subject = sampleSubjects.find(s => s.id === subjectId);
    return total + (subject?.periods || 0);
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
    
    // Simulate API call/processing delay
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationComplete(true);
      toast({
        title: "Timetable Generated",
        description: "The timetable draft has been successfully created",
      });
    }, 3000);
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
                {sampleStaff.map(staff => (
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
                  {sampleSubjects
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
                            <span>{subject.periods} periods</span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>

                <h3 className="font-medium text-sm mt-6">Lab Sessions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sampleSubjects
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
                            <span>{subject.periods} periods (continuous)</span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>

                <h3 className="font-medium text-sm mt-6">Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sampleSubjects
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
                            <span>{subject.periods} periods</span>
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
                      const subject = sampleSubjects.find(s => s.id === subjectId && s.type === "Theory");
                      return total + (subject?.periods || 0);
                    }, 0)} periods
                  </div>
                  <div>Lab Sessions:</div>
                  <div className="font-medium">
                    {selectedSubjects.reduce((total, subjectId) => {
                      const subject = sampleSubjects.find(s => s.id === subjectId && s.type === "Lab");
                      return total + (subject?.periods || 0);
                    }, 0)} periods
                  </div>
                  <div>Activities:</div>
                  <div className="font-medium">
                    {selectedSubjects.reduce((total, subjectId) => {
                      const subject = sampleSubjects.find(s => s.id === subjectId && s.type === "Activity");
                      return total + (subject?.periods || 0);
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
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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
            <div className="spinner h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Optimizing faculty schedules...</p>
              <p className="text-xs text-muted-foreground">Applying hard and soft constraints</p>
            </div>
          </div>
          {/* We're using the default close button that comes with DialogContent */}
          {/* If we want to hide it, we can add custom CSS instead of using hideClose */}
          <style>
            {`
              .radix-dialog-close-button {
                display: none;
              }
            `}
          </style>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetableGenerator;
