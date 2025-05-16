
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppState, TimetableStatus, createSectionKey, TimetableData } from "@/types/timetable";
import { ArrowLeft, Check, AlertTriangle, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTimetableForSection, promoteTimetableToMaster, checkMasterTimetableExists } from "@/services/timetableService";

const MasterTimetable: React.FC = () => {
  const { year, dept, section } = useParams<{ year: string; dept: string; section: string }>();
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [isDraftAvailable, setIsDraftAvailable] = useState(false);
  const [isMasterAvailable, setIsMasterAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPromoting, setIsPromoting] = useState(false);
  
  // Period timings for reference
  const periodTimings = [
    "8:30-9:20",
    "9:20-10:10",
    "10:10-11:00",
    "11:15-12:00",
    "12:00-12:45",
    "1:35-2:25",
    "2:25-3:15"
  ];
  
  useEffect(() => {
    if (year && dept && section) {
      loadTimetableData();
    }
  }, [year, dept, section]);
  
  const loadTimetableData = async () => {
    setIsLoading(true);
    
    try {
      // Check if master timetable exists
      const masterExists = await checkMasterTimetableExists(dept || '', section || '');
      setIsMasterAvailable(masterExists);
      
      if (masterExists) {
        // Get the master timetable
        const masterTimetable = await getTimetableForSection(dept || '', section || '', 'confirmed');
        setTimetable(masterTimetable);
      } else {
        // Check for draft
        const draftTimetable = await getTimetableForSection(dept || '', section || '', 'draft');
        setIsDraftAvailable(!!draftTimetable);
      }
    } catch (error) {
      console.error("Error loading timetable data:", error);
      toast({
        title: "Error",
        description: "Failed to load timetable data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMaster = async () => {
    if (!dept || !section) return;
    
    setIsPromoting(true);
    
    try {
      const success = await promoteTimetableToMaster(dept, section);
      
      if (success) {
        toast({
          title: "Master timetable confirmed",
          description: "The timetable has been set as the master timetable.",
          variant: "success"
        });
        
        // Reload data to show the new master timetable
        await loadTimetableData();
      } else {
        toast({
          title: "Error",
          description: "Failed to promote timetable to master. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error promoting timetable:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPromoting(false);
    }
  };

  // Helper to determine if a cell is a lab period
  const isLabPeriod = (entry: any) => {
    return entry && entry.isLab;
  };
  
  // Helper to determine if a period is a break (tea or lunch)
  const isBreakPeriod = (period: number) => {
    // Tea break after period 3, lunch break after period 5
    return period === 3 || period === 5;
  };
  
  // Get class for a cell based on the entry type
  const getCellClass = (entry: any) => {
    if (!entry) return "bg-white dark:bg-slate-900";
    if (entry.isLab) return "bg-blue-50 dark:bg-blue-900/20";
    return "bg-white dark:bg-slate-900";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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
              <BreadcrumbPage>Master Timetable</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <h2 className="text-3xl font-bold tracking-tight">
          Master Timetable
        </h2>
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <BreadcrumbPage>Master Timetable</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Master Timetable
        </h2>
        <p className="text-muted-foreground">
          {year} Year {dept} - Section {section}
        </p>
      </div>

      <div className="flex justify-between">
        <Link to={`/admin/dashboard/${year}/${dept}/${section}`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        {isDraftAvailable && !isMasterAvailable && (
          <Button 
            onClick={handleConfirmMaster} 
            className="flex items-center gap-2"
            disabled={isPromoting}
          >
            <Check className="h-4 w-4" />
            {isPromoting ? "Promoting..." : "Promote to Master"}
          </Button>
        )}
      </div>
      
      {!isMasterAvailable && !isDraftAvailable && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Master Timetable Available</AlertTitle>
          <AlertDescription>
            No master timetable is available for this section. Please generate a draft timetable first.
          </AlertDescription>
          <div className="mt-4">
            <Link to={`/admin/timetables/${year}/${dept}/${section}`}>
              <Button>Generate Timetable</Button>
            </Link>
          </div>
        </Alert>
      )}
      
      {!isMasterAvailable && isDraftAvailable && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Draft Available</AlertTitle>
          <AlertDescription>
            A draft timetable is available for this section. Click "Promote to Master" to make it the official timetable.
          </AlertDescription>
        </Alert>
      )}
      
      {isMasterAvailable && timetable && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Master Timetable</CardTitle>
              <Badge className="bg-green-500">Confirmed</Badge>
            </div>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Day</TableHead>
                    {Array.from({ length: 7 }, (_, i) => i).map((period) => (
                      <TableHead key={period} className={`min-w-[160px] ${isBreakPeriod(period) ? "relative" : ""}`}>
                        Period {period + 1}
                        <div className="text-xs font-normal">{periodTimings[period]}</div>
                        {isBreakPeriod(period) && (
                          <div className="absolute -bottom-3 left-0 right-0 text-[10px] text-center text-muted-foreground">
                            {period === 3 ? "Tea Break" : "Lunch Break"}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(timetable).map((day) => (
                    <TableRow key={day}>
                      <TableCell className="font-medium">{day}</TableCell>
                      {Array.from({ length: 7 }, (_, i) => i).map((period) => {
                        const entry = timetable[day]?.[period];
                        return (
                          <TableCell 
                            key={`${day}-${period}`} 
                            className={`border ${getCellClass(entry)}`}
                          >
                            {entry ? (
                              <div>
                                <div className="font-medium">{entry.subject}</div>
                                {entry.title && <div className="text-xs text-muted-foreground">{entry.title}</div>}
                                <div className="text-xs mt-1">{entry.staff}</div>
                              </div>
                            ) : "—"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Timetable Legend */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Legend:</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border mr-2"></div>
                  <span className="text-sm">Theory</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-50 border mr-2"></div>
                  <span className="text-sm">Lab</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border mr-2"></div>
                  <span className="text-sm">Break</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MasterTimetable;
