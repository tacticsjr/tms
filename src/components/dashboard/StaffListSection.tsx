
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Staff } from "@/types/timetable";
import { Edit2, Save, Mail } from "lucide-react";

interface StaffListSectionProps {
  staffList: Staff[];
  onStaffUpdate: (updatedStaff: Staff) => void;
}

const StaffListSection: React.FC<StaffListSectionProps> = ({ staffList, onStaffUpdate }) => {
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editedMaxPeriods, setEditedMaxPeriods] = useState<number>(0);
  
  const handleEditClick = (staff: Staff) => {
    setEditingStaffId(staff.id);
    setEditedMaxPeriods(staff.maxPeriods || 5);
  };
  
  const handleSaveClick = (staff: Staff) => {
    onStaffUpdate({
      ...staff,
      maxPeriods: editedMaxPeriods
    });
    setEditingStaffId(null);
  };
  
  const handleCancelEdit = () => {
    setEditingStaffId(null);
  };
  
  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };
  
  if (!staffList || staffList.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No staff assigned yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Max Periods</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">{staff.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="mr-2">{staff.email}</span>
                  {staff.email && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => sendEmail(staff.email!)}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {staff.subjects?.map((subjectCode, idx) => (
                    <span key={idx} className="bg-accent text-xs px-1 py-0.5 rounded">
                      {subjectCode}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {editingStaffId === staff.id ? (
                  <Input 
                    type="number"
                    min={1}
                    max={10}
                    value={editedMaxPeriods}
                    onChange={(e) => setEditedMaxPeriods(Number(e.target.value))}
                    className="w-16 h-8"
                  />
                ) : (
                  <span>{staff.maxPeriods}/day</span>
                )}
              </TableCell>
              <TableCell>
                {editingStaffId === staff.id ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleSaveClick(staff)}
                    >
                      <Save className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(staff)}
                  >
                    <Edit2 className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffListSection;
