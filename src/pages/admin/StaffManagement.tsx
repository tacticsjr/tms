
import React, { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  subject: string;
  maxPeriods: number;
  department?: string;
  section?: string;
  year?: string;
}

const StaffManagement: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    subject: "",
    maxPeriods: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
    
    // Subscribe to real-time changes
    const staffChannel = supabase
      .channel('staff-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'staff' }, 
        () => {
          fetchStaff();
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(staffChannel);
    };
  }, [year, dept, section]);
  
  const fetchStaff = async () => {
    if (!year || !dept || !section) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('year', year)
        .eq('department', dept)
        .eq('section', section);
        
      if (error) {
        throw error;
      }
      
      setStaff(data?.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        subject: item.subject || '',
        maxPeriods: item.max_periods || 5,
        department: item.department,
        section: item.section,
        year: item.year
      })) || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Error",
        description: "Failed to load staff data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill all the required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('staff')
        .insert([{
          name: newStaff.name,
          email: newStaff.email, 
          subject: newStaff.subject,
          max_periods: newStaff.maxPeriods,
          department: dept,
          section: section,
          year: year,
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Reset form
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
      
      // Fetch updated staff list
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Staff Removed",
        description: `${name} has been removed from this section`,
      });
      
      // Fetch updated staff list
      fetchStaff();
    } catch (error) {
      console.error('Error removing staff:', error);
      toast({
        title: "Error",
        description: "Failed to remove staff member. Please try again.",
        variant: "destructive",
      });
    }
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
          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : staff.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No staff members assigned to this section yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.subject}</TableCell>
                      <TableCell>{member.maxPeriods}/day</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Button 
            onClick={handleAddStaff} 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Staff'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StaffManagement;
