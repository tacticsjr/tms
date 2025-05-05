
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Sample staff for assignment
const sampleStaff = [
  { id: "SR", name: "Ms. Sagaya Rebecca" },
  { id: "SJ", name: "Ms. Sujitha" },
  { id: "PA", name: "Ms. P. Abirami" },
  { id: "VD", name: "Ms. Vidya" },
  { id: "JX", name: "Mr. Justin Xavier" },
  { id: "SK", name: "Mr. Siva Karthikeyan" },
  { id: "UN", name: "Unassigned" },
];

// Sample initial subjects
const initialSubjects = [
  { id: "PAS", code: "PAS", title: "Probability and Statistics", type: "Theory", periods: 5, staff: "Ms. Sagaya Rebecca", continuous: false },
  { id: "OS", code: "OS", title: "Operating Systems", type: "Theory", periods: 6, staff: "Ms. Sujitha", continuous: false },
  { id: "ML", code: "ML", title: "Machine Learning", type: "Theory", periods: 5, staff: "Ms. P. Abirami", continuous: false },
  { id: "FDSA", code: "FDSA", title: "Fundamentals of Data Science and Analytics", type: "Theory", periods: 5, staff: "Ms. Vidya", continuous: false },
  { id: "CN", code: "CN", title: "Computer Networks", type: "Theory", periods: 6, staff: "Mr. Justin Xavier", continuous: false },
  { id: "EVS", code: "EVS", title: "Environmental Sciences and Sustainability", type: "Theory", periods: 4, staff: "Mr. Siva Karthikeyan", continuous: false },
  { id: "FDSA_LAB", code: "FDSA LAB", title: "Data Science and Analytics Laboratory", type: "Lab", periods: 3, staff: "Ms. Vidya", continuous: true },
  { id: "ML_LAB", code: "ML LAB", title: "Machine Learning Laboratory", type: "Lab", periods: 3, staff: "Ms. P. Abirami", continuous: true },
  { id: "CN_LAB", code: "CN LAB", title: "Computer Networks Lab", type: "Lab", periods: 3, staff: "Unassigned", continuous: true },
  { id: "ACTIVITY", code: "ACTIVITY", title: "Department Activity Hour", type: "Activity", periods: 2, staff: "All AI&DS Dept Staffs", continuous: false },
  { id: "PD", code: "PD", title: "Professional Development", type: "Activity", periods: 2, staff: "Ms. Vidya", continuous: false },
  { id: "LIB", code: "LIB/SKILL RACK", title: "Library / Skill Rack", type: "Activity", periods: 1, staff: "Ms. Vidya", continuous: false },
];

const SubjectManagement: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState(initialSubjects);
  const [newSubject, setNewSubject] = useState({
    code: "",
    title: "",
    type: "Theory",
    periods: 1,
    staff: "Unassigned",
    continuous: false
  });

  const handleAddSubject = () => {
    if (!newSubject.code || !newSubject.title) {
      toast({
        title: "Missing Information",
        description: "Please fill all the required fields",
        variant: "destructive",
      });
      return;
    }

    // Generate a simple ID from code
    const id = newSubject.code.replace(/\s+/g, '_');

    const subject = {
      id,
      ...newSubject
    };

    setSubjects([...subjects, subject]);
    setNewSubject({
      code: "",
      title: "",
      type: "Theory",
      periods: 1,
      staff: "Unassigned",
      continuous: false
    });

    toast({
      title: "Subject Added",
      description: `${newSubject.code} (${newSubject.title}) has been added successfully`,
    });
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    
    toast({
      title: "Subject Removed",
      description: "The subject has been removed from this section",
    });
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
          <span>Subject Management</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mt-2">
          Subject Management
        </h2>
        <p className="text-muted-foreground">
          {year} Year {dept} - Section {section}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects for This Section</CardTitle>
          <CardDescription>
            Manage subjects and lab sessions for this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Periods/Week</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Continuous</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.code}</TableCell>
                    <TableCell>{subject.title}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        subject.type === "Lab" 
                          ? "bg-blue-100 text-blue-800" 
                          : subject.type === "Activity" 
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {subject.type}
                      </span>
                    </TableCell>
                    <TableCell>{subject.periods}</TableCell>
                    <TableCell>{subject.staff}</TableCell>
                    <TableCell>
                      {subject.continuous ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Subject</CardTitle>
          <CardDescription>
            Add a new subject to this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input 
                  id="code" 
                  value={newSubject.code} 
                  onChange={(e) => setNewSubject({...newSubject, code: e.target.value})} 
                  placeholder="e.g. CS101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Subject Title</Label>
                <Input 
                  id="title" 
                  value={newSubject.title} 
                  onChange={(e) => setNewSubject({...newSubject, title: e.target.value})} 
                  placeholder="e.g. Introduction to Programming"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newSubject.type} 
                  onValueChange={(value) => setNewSubject({...newSubject, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theory">Theory</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periods">Periods Per Week</Label>
                <Input 
                  id="periods" 
                  type="number"
                  min={1}
                  max={10}
                  value={newSubject.periods} 
                  onChange={(e) => setNewSubject({...newSubject, periods: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff">Assigned Staff</Label>
                <Select 
                  value={newSubject.staff} 
                  onValueChange={(value) => setNewSubject({...newSubject, staff: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleStaff.map(staff => (
                      <SelectItem key={staff.id} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="continuous" 
                checked={newSubject.continuous} 
                onCheckedChange={(checked) => setNewSubject({...newSubject, continuous: checked})} 
              />
              <Label htmlFor="continuous">Continuous Periods (for Labs)</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddSubject}>Add Subject</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject Statistics</CardTitle>
          <CardDescription>
            Overview of subject distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Theory Subjects</div>
              <div className="text-2xl font-bold">
                {subjects.filter(s => s.type === "Theory").length}
              </div>
              <div className="text-sm text-muted-foreground">
                {subjects.reduce((sum, s) => s.type === "Theory" ? sum + s.periods : sum, 0)} periods/week
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Lab Sessions</div>
              <div className="text-2xl font-bold">
                {subjects.filter(s => s.type === "Lab").length}
              </div>
              <div className="text-sm text-muted-foreground">
                {subjects.reduce((sum, s) => s.type === "Lab" ? sum + s.periods : sum, 0)} periods/week
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Activities</div>
              <div className="text-2xl font-bold">
                {subjects.filter(s => s.type === "Activity").length}
              </div>
              <div className="text-sm text-muted-foreground">
                {subjects.reduce((sum, s) => s.type === "Activity" ? sum + s.periods : sum, 0)} periods/week
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectManagement;
