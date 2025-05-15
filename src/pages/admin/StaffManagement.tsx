
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StaffListSection from "@/components/dashboard/StaffListSection";
import { Staff } from "@/types/timetable";

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
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    subject: "",
    maxPeriods: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

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
    setDbError(null);
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
        subjects: [item.subject], // Convert subject to subjects array for compatibility with StaffListSection
        department: item.department,
        section: item.section,
        year: item.year
      })) || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      
      if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
        setDbError("Database tables haven't been created yet. Please run the SQL migration script first.");
      } else {
        setDbError(`Failed to load staff data: ${error.message || 'Unknown error'}`);
      }
      
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
        variant: "success",
      });
      
      // Fetch updated staff list
      fetchStaff();
    } catch (error: any) {
      console.error('Error adding staff:', error);
      
      if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
        setDbError("Database tables haven't been created yet. Please run the SQL migration script first.");
      }
      
      toast({
        title: "Error",
        description: `Failed to add staff member: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStaffUpdate = async (updatedStaff: Staff) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          max_periods: updatedStaff.maxPeriods
        })
        .eq('id', updatedStaff.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Staff Updated",
        description: `${updatedStaff.name}'s details have been updated`,
        variant: "success",
      });
      
      // Fetch updated staff list
      fetchStaff();
    } catch (error: any) {
      console.error('Error updating staff:', error);
      toast({
        title: "Error",
        description: `Failed to update staff member: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
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
        variant: "success",
      });
      
      // Fetch updated staff list
      fetchStaff();
    } catch (error: any) {
      console.error('Error removing staff:', error);
      toast({
        title: "Error",
        description: `Failed to remove staff member: ${error.message || 'Unknown error'}`,
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

      {dbError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            {dbError}
          </AlertDescription>
        </Alert>
      )}

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
          ) : dbError ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Unable to load staff data due to database errors.</p>
            </div>
          ) : (
            <StaffListSection staffList={staff} onStaffUpdate={handleStaffUpdate} />
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
                  disabled={!!dbError}
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
                  disabled={!!dbError}
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
                  disabled={!!dbError}
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
                  disabled={!!dbError}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAddStaff} 
            disabled={saving || !!dbError}
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
