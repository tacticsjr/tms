
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimetableEntry } from "@/types/timetable";
import { Badge } from "@/components/ui/badge";

interface TodayScheduleSectionProps {
  todaySchedule: TimetableEntry[];
  currentPeriodIndex: number;
  nextPeriodIndex: number;
}

const periodTimings = [
  "8:30-9:20",
  "9:20-10:10",
  "10:10-11:00",
  "11:15-12:00",
  "12:00-12:45",
  "1:35-2:25",
  "2:25-3:15"
];

const TodayScheduleSection: React.FC<TodayScheduleSectionProps> = ({ 
  todaySchedule,
  currentPeriodIndex,
  nextPeriodIndex
}) => {
  // If no schedule, show placeholder
  if (!todaySchedule || todaySchedule.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No schedule available for today</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generate a timetable to see today's schedule
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-4 text-sm font-medium text-center">
        {[1, 2, 3, 4, 5, 6, 7].map(period => (
          <div key={period}>P{period}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {periodTimings.map((time, index) => {
          const isBreak = index === 3 || index === 5;
          const isCurrent = index === currentPeriodIndex;
          const isNext = index === nextPeriodIndex;
          
          // Get class for this period
          const classInfo = todaySchedule[index];
          
          return (
            <div 
              key={index}
              className={`text-center p-2 rounded-md ${
                isBreak 
                  ? "border-t-2 border-primary/30" 
                  : isCurrent 
                    ? "bg-primary/20 border border-primary" 
                    : isNext 
                      ? "bg-accent/70 border border-accent" 
                      : "bg-accent"
              }`}
            >
              {classInfo ? (
                <>
                  <div className="font-medium text-sm">{classInfo.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {classInfo.staff ? classInfo.staff.split(' ').pop() : "Unassigned"}
                  </div>
                  
                  {isCurrent && (
                    <Badge variant="outline" className="mt-1 text-[10px] border-primary text-primary">
                      Now
                    </Badge>
                  )}
                  
                  {isNext && (
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      Next
                    </Badge>
                  )}
                </>
              ) : (
                <div className="text-xs text-muted-foreground">Free period</div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Tea Break after Period 3 (11:00 - 11:15) | Lunch Break after Period 5 (12:45 - 1:35)
      </div>
    </div>
  );
};

export default TodayScheduleSection;
