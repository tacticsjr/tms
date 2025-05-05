
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Sample initial staff data
const initialStaff = [
  { id: "SR", name: "Ms. Sagaya Rebecca", email: "sagaya@velammal.edu", subject: "Probability and Statistics", maxPeriods: 5 },
  { id: "SJ", name: "Ms. Sujitha", email: "sujitha@velammal.edu", subject: "Operating Systems", maxPeriods: 6 },
  { id: "PA", name: "Ms. P. Abirami", email: "abirami@velammal.edu", subject: "Machine Learning", maxPeriods: 6 },
  { id: "VD", name: "Ms. Vidya", email: "vidya@velammal.edu", subject: "Fundamentals of Data Science", maxPeriods: 7 },
  { id: "JX", name: "Mr. Justin Xavier", email: "justin@velammal.edu", subject: "Computer Networks", maxPeriods: 5 },
  { id: "SK", name: "Mr. Siva Karthikeyan", email: "siva@velammal.edu", subject: "Environmental Sciences", maxPeriods: 4 },
];

const StaffManagement: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  
  const [staff, setStaff] = useState(initialStaff);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    subject: "",
    maxPeriods: 5
  });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email || !newStaff.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill all the required fields",
        variant: "destructive",
      });
      return;
    }

    // Generate a simple ID from name
    const id = newStaff.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();

    const staffMember = {
      id,
      ...newStaff
    };

    setStaff([...staff, staffMember]);
    setNewStaff({
      name: "",
      email: "",
      subject: "",
      maxPeriods: 5
    });

    toast({
      title: "Staff Added",
      description: `${newStaff.name} has been added successfully`,
    });
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    
    toast({
      title: "Staff Removed",
      description: "The staff member has been removed",
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
          <span>Staff Management</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight mt-2">
          Staff Management
        </h2>
        <p className="text-muted-foreground">
          {year} Year {dept} - Section {section}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Assigned to This Section</CardTitle>
          <CardDescription>
            Manage faculty members teaching in this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Max Periods</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.subject}</TableCell>
                    <TableCell>{member.maxPeriods}/day</TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteStaff(member.id)}
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
          <CardTitle>Add New Staff</CardTitle>
          <CardDescription>
            Assign a new faculty member to this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={newStaff.name} 
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} 
                  placeholder="e.g. Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newStaff.email} 
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} 
                  placeholder="e.g. johndoe@velammal.edu"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  value={newStaff.subject} 
                  onChange={(e) => setNewStaff({...newStaff, subject: e.target.value})} 
                  placeholder="e.g. Machine Learning"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPeriods">Max Periods Per Day</Label>
                <Input 
                  id="maxPeriods" 
                  type="number"
                  min={1}
                  max={10}
                  value={newStaff.maxPeriods} 
                  onChange={(e) => setNewStaff({...newStaff, maxPeriods: Number(e.target.value)})} 
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddStaff}>Add Staff</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StaffManagement;
