
import React from "react";
import { Badge } from "@/components/ui/badge";
import { RecentUpdate } from "@/types/timetable";
import { Clock, AlertTriangle, Pencil, Book, Bell, Save, FileCheck } from "lucide-react";

interface RecentUpdatesSectionProps {
  updates: RecentUpdate[];
}

const RecentUpdatesSection: React.FC<RecentUpdatesSectionProps> = ({ updates }) => {
  if (!updates || updates.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">No recent updates</p>
      </div>
    );
  }

  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day ago`;
  };

  return (
    <div className="space-y-3">
      {updates.map(update => (
        <div key={update.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/30 transition-colors">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-accent">
            {update.type === 'substitution' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            {update.type === 'timetable' && <Save className="h-4 w-4 text-blue-500" />}
            {update.type === 'staff' && <Pencil className="h-4 w-4 text-green-500" />}
            {update.type === 'subject' && <Book className="h-4 w-4 text-purple-500" />}
            {update.type === 'notification' && <Bell className="h-4 w-4 text-red-500" />}
            {update.type === 'master' && <FileCheck className="h-4 w-4 text-green-500" />}
          </div>
          
          <div className="flex-1">
            <p className="text-sm">{update.message}</p>
            <p className="text-xs text-muted-foreground">
              {update.time instanceof Date 
                ? getTimeAgo(update.time)
                : getTimeAgo(new Date(update.time))}
            </p>
          </div>
          
          <div>
            {update.type === 'substitution' && <Badge variant="destructive">Substitution</Badge>}
            {update.type === 'timetable' && <Badge variant="outline" className="text-blue-500 border-blue-500">Timetable</Badge>}
            {update.type === 'staff' && <Badge className="bg-blue-500">Staff</Badge>}
            {update.type === 'subject' && <Badge className="bg-purple-500">Subject</Badge>}
            {update.type === 'notification' && <Badge className="bg-yellow-500">Notification</Badge>}
            {update.type === 'master' && <Badge className="bg-green-500">Master</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentUpdatesSection;
