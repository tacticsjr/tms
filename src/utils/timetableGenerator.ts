
import { 
  Subject, 
  Staff, 
  TimeSlot, 
  TimetableSettings, 
  TimetableDraft,
  ConflictInfo,
  TimetableData,
  TimetableEntry
} from "../types/timetable";

export const generateTimetable = (
  subjects: Subject[],
  staff: Staff[],
  settings: TimetableSettings
): TimeSlot[] => {
  // Include Saturday for regular classes
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const labDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // Labs only on weekdays
  const periodsPerDay = settings.periodTimings.length;
  let timetable: TimeSlot[] = [];

  console.log("Starting timetable generation with:", { 
    subjects: subjects.length, 
    staff: staff.length, 
    days, 
    periodsPerDay 
  });

  // Create empty timetable structure
  days.forEach((day) => {
    for (let period = 1; period <= periodsPerDay; period++) {
      // Add regular periods
      timetable.push({
        day,
        period,
        subjectId: null,
        staffId: null,
      });
    }
  });

  // Add breaks to the timetable
  days.forEach((day) => {
    settings.breaks.forEach((breakInfo) => {
      timetable.push({
        day,
        period: breakInfo.after + 0.5, // Position breaks between periods
        subjectId: null,
        staffId: null,
        isBreak: true,
        breakName: breakInfo.name,
      });
    });
  });

  // Find the Activity Period subject
  const activitySubject = subjects.find(
    (subject) => subject.shortName === "ACTIVITY" || subject.name === "Department Activity Hour"
  );

  // Remove activity subject from the subjects array to prevent it from being scheduled elsewhere
  const subjectsWithoutActivity = activitySubject 
    ? subjects.filter(subject => subject.id !== activitySubject.id)
    : [...subjects];

  // Sort subjects by priority (labs first, then regular subjects)
  const sortedSubjects = [...subjectsWithoutActivity].sort((a, b) => {
    // Labs have higher priority
    if (a.isLab && !b.isLab) return -1;
    if (!a.isLab && b.isLab) return 1;
    // Then sort by custom priority value
    return a.priority - b.priority;
  });

  const labs = subjectsWithoutActivity.filter((subject) => subject.isLab);
  console.log(labs, "labs");
  
  const labDayCombination = getRandomUniqueArray(labs.length + 1).slice(0, labs.length); // e.g., [2, 4, 1]
  const labPeriodCombination = getRandomUniquePeriod(6, 4).map((p) => p + 1).sort((a, b) => a - b); // Now 1-based
  console.log("Lab Days:", labDayCombination);
  console.log("Lab Periods:", labPeriodCombination);

  const usedSlots = new Set<string>();

  labs.forEach((lab, index) => {
    const dayIndex = labDayCombination[index % labDayCombination.length];
    const day = days[dayIndex];
  
    const requiredConsecutive = lab.periodsPerWeek;
    let placed = false;
  
    // Get the period to start with
    const startPeriod = labPeriodCombination[index % labPeriodCombination.length];
    console.log('startPeriod', startPeriod);
  
    if (startPeriod + requiredConsecutive - 1 <= periodsPerDay) {
      let canPlace = true;
  
      // Check if all required consecutive periods are free
      for (let i = 0; i < requiredConsecutive; i++) {
        const slot = timetable.find(
          t => t.day === day && t.period === startPeriod + i && !t.subjectId && !t.isBreak
        );
        if (!slot) {
          canPlace = false;
          break;
        }
      }
  
      if (canPlace) {
        // Assign the lab to consecutive periods
        for (let i = 0; i < requiredConsecutive; i++) {
          const slot = timetable.find(
            t => t.day === day && t.period === startPeriod + i && !t.subjectId && !t.isBreak
          );
          if (slot) {
            slot.subjectId = lab.id;
            slot.staffId = lab.staffId;
            usedSlots.add(`${day}-${startPeriod + i}`);
          }
        }
        placed = true;
      }
    }
  
    if (!placed) {
      console.warn(`Could not place lab ${lab.shortName} on ${day}`);
    }
  });
  
  // Handle activity period - last two periods of Saturday
  if (activitySubject) {
    const saturdayIndex = days.indexOf("Saturday");
    if (saturdayIndex !== -1) {
      // Find the last two periods on Saturday
      const lastPeriod = periodsPerDay;
      const secondLastPeriod = periodsPerDay - 1;
      
      // Assign activity period to these slots
      const lastPeriodSlot = timetable.find(
        slot => slot.day === "Saturday" && slot.period === lastPeriod && !slot.isBreak
      );
      
      const secondLastPeriodSlot = timetable.find(
        slot => slot.day === "Saturday" && slot.period === secondLastPeriod && !slot.isBreak
      );
      
      if (lastPeriodSlot) {
        lastPeriodSlot.subjectId = activitySubject.id;
        lastPeriodSlot.staffId = activitySubject.staffId;
        console.log(`Assigned activity period to Saturday, Period ${lastPeriod}`);
      }
      
      if (secondLastPeriodSlot) {
        secondLastPeriodSlot.subjectId = activitySubject.id;
        secondLastPeriodSlot.staffId = activitySubject.staffId;
        console.log(`Assigned activity period to Saturday, Period ${secondLastPeriod}`);
      }
    }
  }

  // Distribute regular subjects (can be on any day including Saturday)
  const regularSubjects = sortedSubjects.filter(subject => !subject.isLab);
  
  regularSubjects.forEach(subject => {
    let periodsAssigned = 0;
    let failedAttempts = 0;
    
    while (periodsAssigned < subject.periodsPerWeek && failedAttempts < 50) {
      // Pick a random day and period (can include Saturday for regular classes)
      const randomDayIndex = Math.floor(Math.random() * days.length);
      const day = days[randomDayIndex];
      const randomPeriodIndex = Math.floor(Math.random() * periodsPerDay) + 1;
      
      // Find the slot for this period
      const timeSlot = timetable.find(
        slot => slot.day === day && slot.period === randomPeriodIndex && !slot.isBreak
      );
      
      // Check if slot is available
      if (timeSlot && !timeSlot.subjectId) {
        // Check if staff is already teaching in another class at this time
        const staffBusy = timetable.some(
          slot => 
            slot.day === day && 
            slot.period === randomPeriodIndex && 
            slot.staffId === subject.staffId &&
            slot !== timeSlot
        );
        
        if (!staffBusy) {
          // Assign subject to this period
          timeSlot.subjectId = subject.id;
          timeSlot.staffId = subject.staffId;
          periodsAssigned++;
        } else {
          failedAttempts++;
        }
      } else {
        failedAttempts++;
      }
    }
    
    // If we couldn't assign all periods normally, force assign the remaining ones
    if (periodsAssigned < subject.periodsPerWeek) {
      // Sort the timetable slots to ensure a deterministic order
      const availableSlots = timetable
        .filter(slot => !slot.isBreak && !slot.subjectId)
        .sort((a, b) => {
          // Sort by day first
          const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
          if (dayOrder !== 0) return dayOrder;
          // Then by period
          return a.period - b.period;
        });
      
      for (let i = 0; i < availableSlots.length && periodsAssigned < subject.periodsPerWeek; i++) {
        const slot = availableSlots[i];
        
        // Assign subject even if staff is busy elsewhere
        slot.subjectId = subject.id;
        slot.staffId = subject.staffId;
        periodsAssigned++;
      }
    }
    
    console.log(`Assigned ${periodsAssigned}/${subject.periodsPerWeek} periods for ${subject.name}`);
  });

  // Sort the timetable by day and period for display
  timetable.sort((a, b) => {
    const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    return a.period - b.period;
  });
  
  printTimetableSummary(timetable, subjects, settings, days);
  console.log(timetable);
  return timetable;
};

function getRandomUniqueArray(length: number) {
  const numbers = Array.from({ length }, (_, i) => i);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

function getRandomUniquePeriod(totalPeriods: number, selectCount: number): number[] {
  const allPeriods = Array.from({ length: totalPeriods }, (_, i) => i);
  for (let i = allPeriods.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPeriods[i], allPeriods[j]] = [allPeriods[j], allPeriods[i]];
  }
  return allPeriods.slice(0, selectCount);
}

function printTimetableSummary(timetable: TimeSlot[], subjects: Subject[], settings: TimetableSettings, days: string[]) {
  const totalPeriodsPerDay = settings.periodTimings.length;
  const expectedTotalSlots = days.length * totalPeriodsPerDay;

  const assignedSlots = timetable.filter(slot => slot.subjectId && !slot.isBreak);
  const unassignedSlots = timetable.filter(slot => !slot.subjectId && !slot.isBreak);

  console.log("\n========= 📊 Timetable Summary =========");
  console.log(`📅 Days: ${days.join(", ")}`);
  console.log(`🕒 Periods per day: ${totalPeriodsPerDay}`);
  console.log(`📚 Total non-break slots: ${expectedTotalSlots}`);
  console.log(`✅ Assigned periods: ${assignedSlots.length}`);
  console.log(`❌ Unassigned periods: ${unassignedSlots.length}`);

  if (unassignedSlots.length > 0) {
    console.log("\n⚠️ Unassigned Periods:");
    unassignedSlots.forEach(slot => {
      console.log(`- ${slot.day}, Period ${slot.period}`);
    });
  } else {
    console.log("🎉 All periods are successfully assigned!");
  }

  console.log("\n📦 Subject-wise Period Assignment:");
  subjects.forEach(subject => {
    const assigned = timetable.filter(slot => slot.subjectId === subject.id).length;
    const emoji = assigned === subject.periodsPerWeek ? "✅" : "⚠️";
    console.log(`${emoji} ${subject.name} → Assigned: ${assigned}/${subject.periodsPerWeek}`);
  });

  console.log("========================================\n");
}

// Utility function to convert TimeSlot[] to the TimetableData format used by the UI
export const convertToTimetableData = (
  timeSlots: TimeSlot[], 
  subjects: Subject[], 
  staff: Staff[]
): TimetableData => {
  const result: TimetableData = {};
  
  // Initialize empty days
  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach(day => {
    result[day] = [];
  });
  
  // Find the maximum period number
  const maxPeriod = Math.max(...timeSlots.map(slot => slot.period).filter(p => Number.isInteger(p)));
  
  // For each day, create an array with enough slots
  for (const day in result) {
    // Create empty slots for each period
    for (let i = 1; i <= maxPeriod; i++) {
      result[day].push({
        subject: "",
        title: "",
        staff: ""
      });
    }
    
    // Fill in actual data
    timeSlots
      .filter(slot => slot.day === day && Number.isInteger(slot.period) && !slot.isBreak)
      .forEach(slot => {
        const periodIndex = slot.period - 1;
        
        if (periodIndex >= 0 && periodIndex < result[day].length) {
          if (slot.subjectId) {
            const subject = subjects.find(s => s.id === slot.subjectId);
            const staffMember = staff.find(s => s.id === slot.staffId);
            
            if (subject) {
              // Check if this is part of a lab (continuous periods)
              const isLab = subject.isLab;
              
              result[day][periodIndex] = {
                subject: subject.shortName,
                title: subject.name,
                staff: staffMember?.name || "",
                continuous: isLab,
                span: isLab ? subject.periodsPerWeek : undefined
              };
              
              // For lab slots, pad the following slots that are part of the span
              if (isLab && subject.periodsPerWeek > 1) {
                for (let i = 1; i < subject.periodsPerWeek; i++) {
                  if (periodIndex + i < result[day].length) {
                    result[day][periodIndex + i] = {
                      subject: subject.shortName,
                      title: subject.name,
                      staff: staffMember?.name || "",
                      continuous: true
                    };
                  }
                }
              }
            }
          }
        }
      });
  }
  
  return result;
};

// Function to detect conflicts between two timetable drafts
export const detectConflicts = (
  draft1: TimetableDraft,
  draft2: TimetableDraft,
  staff: Staff[]
): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];
  
  // Group slots by day and period
  const slotsByTimeKey: Record<string, TimeSlot[]> = {};
  
  // Process all slots from both drafts
  const allSlots = [...draft1.timeSlots, ...draft2.timeSlots];
  
  allSlots.forEach(slot => {
    if (!slot.isBreak) {
      const timeKey = `${slot.day}-${slot.period}`;
      
      if (!slotsByTimeKey[timeKey]) {
        slotsByTimeKey[timeKey] = [];
      }
      
      slotsByTimeKey[timeKey].push(slot);
    }
  });
  
  // Check for conflicts
  for (const timeKey in slotsByTimeKey) {
    const slotsAtTime = slotsByTimeKey[timeKey];
    
    // If there's more than one slot at this time, check for staff conflicts
    if (slotsAtTime.length > 1) {
      // Group by staff
      const slotsByStaff: Record<string, TimeSlot[]> = {};
      
      slotsAtTime.forEach(slot => {
        if (slot.staffId) {
          if (!slotsByStaff[slot.staffId]) {
            slotsByStaff[slot.staffId] = [];
          }
          
          slotsByStaff[slot.staffId].push(slot);
        }
      });
      
      // Check each staff for conflicts
      for (const staffId in slotsByStaff) {
        const staffSlots = slotsByStaff[staffId];
        
        if (staffSlots.length > 1) {
          // This staff is assigned to multiple sections at the same time
          const staffMember = staff.find(s => s.id === staffId);
          
          conflicts.push({
            timeSlot1: staffSlots[0],
            timeSlot2: staffSlots[1],
            type: 'staff',
            description: `${staffMember?.name || 'A staff member'} is assigned to multiple sections on ${staffSlots[0].day} at period ${staffSlots[0].period}`
          });
        }
      }
    }
  }
  
  return conflicts;
};

// Function to resolve conflicts by reassigning slots
export const resolveConflicts = (
  conflicts: ConflictInfo[],
  draft1: TimetableDraft,
  draft2: TimetableDraft,
  subjects: Subject[],
  staff: Staff[]
): {
  resolvedTimeSlots: TimeSlot[],
  remainingConflicts: ConflictInfo[]
} => {
  // Clone the timetable slots to avoid mutating the originals
  const timeSlots1 = JSON.parse(JSON.stringify(draft1.timeSlots)) as TimeSlot[];
  const timeSlots2 = JSON.parse(JSON.stringify(draft2.timeSlots)) as TimeSlot[];
  
  // Combine all slots
  const allTimeSlots = [...timeSlots1, ...timeSlots2];
  
  // Track unresolved conflicts
  const remainingConflicts: ConflictInfo[] = [];
  
  // Process each conflict
  conflicts.forEach(conflict => {
    // For staff conflicts, try to reassign one of the slots
    if (conflict.type === 'staff') {
      // Find available slots for the first section
      const availableSlots1 = timeSlots1.filter(slot => 
        !slot.subjectId && !slot.isBreak && slot.day !== conflict.timeSlot1.day
      );
      
      // If we have available slots, reassign
      if (availableSlots1.length > 0) {
        // Find the slot we want to reassign
        const slotToReassign = timeSlots1.find(slot => 
          slot.day === conflict.timeSlot1.day && 
          slot.period === conflict.timeSlot1.period &&
          slot.staffId === conflict.timeSlot1.staffId
        );
        
        if (slotToReassign) {
          // Clear the original slot
          slotToReassign.subjectId = null;
          slotToReassign.staffId = null;
          
          // Assign to a new slot
          const newSlot = availableSlots1[0];
          newSlot.subjectId = conflict.timeSlot1.subjectId;
          newSlot.staffId = conflict.timeSlot1.staffId;
        } else {
          // Couldn't find the slot to reassign
          remainingConflicts.push(conflict);
        }
      } else {
        // No available slots to reassign
        remainingConflicts.push(conflict);
      }
    } else {
      // Other types of conflicts
      remainingConflicts.push(conflict);
    }
  });
  
  // Return the resolved timetable and any remaining conflicts
  return {
    resolvedTimeSlots: allTimeSlots,
    remainingConflicts
  };
};
