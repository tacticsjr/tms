
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Save } from "lucide-react";
import { Subject, Staff } from "@/types/timetable";

interface SubjectsListSectionProps {
  subjectList: Subject[];
  staffList: Staff[];
  onSubjectUpdate: (updatedSubject: Subject) => void;
}

const SubjectsListSection: React.FC<SubjectsListSectionProps> = ({ 
  subjectList, 
  staffList,
  onSubjectUpdate 
}) => {
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editedStaffId, setEditedStaffId] = useState<string>("");
  
  const handleEditClick = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditedStaffId(subject.staffId || "");
  };
  
  const handleSaveClick = (subject: Subject) => {
    const selectedStaff = staffList.find(staff => staff.id === editedStaffId);
    
    onSubjectUpdate({
      ...subject,
      staffId: editedStaffId,
      staff: selectedStaff ? selectedStaff.name : ""
    });
    
    setEditingSubjectId(null);
  };
  
  const handleCancelEdit = () => {
    setEditingSubjectId(null);
  };
  
  if (!subjectList || subjectList.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No subjects configured yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Periods</TableHead>
            <TableHead>Assigned Staff</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjectList.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell className="font-medium">
                {subject.code || subject.shortName}
              </TableCell>
              <TableCell>{subject.title || subject.name}</TableCell>
              <TableCell>
                {subject.type === "Theory" && <Badge>Theory</Badge>}
                {subject.type === "Lab" && <Badge variant="secondary">Lab</Badge>}
                {subject.type === "Activity" && <Badge variant="outline">Activity</Badge>}
              </TableCell>
              <TableCell>{subject.periodsPerWeek}/week</TableCell>
              <TableCell>
                {editingSubjectId === subject.id ? (
                  <Select 
                    value={editedStaffId} 
                    onValueChange={setEditedStaffId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span>{subject.staff || "Unassigned"}</span>
                )}
              </TableCell>
              <TableCell>
                {editingSubjectId === subject.id ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleSaveClick(subject)}
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
                    onClick={() => handleEditClick(subject)}
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

export default SubjectsListSection;
