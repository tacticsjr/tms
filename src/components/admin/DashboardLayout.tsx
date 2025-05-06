
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("");
  
  // Set page title based on current route
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    let title = "Dashboard";
    
    if (pathParts.length >= 2) {
      const section = pathParts[pathParts.length - 1];
      
      // If we're in a section specific route
      if (pathParts.length >= 5 && pathParts[1] === "dashboard") {
        title = `Section ${section} Dashboard`;
      } else if (pathParts.includes("staff")) {
        title = "Staff Management";
      } else if (pathParts.includes("subjects")) {
        title = "Subject Management";
      } else if (pathParts.includes("timetables")) {
        title = "Timetable Generator";
        
        // If the last part is "draft", it's the timetable view
        if (section === "draft") {
          title = "Timetable Draft Editor";
        }
      } else if (pathParts.includes("master")) {
        title = "Master Timetable";
      } else if (pathParts.includes("substitutions")) {
        title = "Substitution Management";
      } else if (pathParts.includes("notifications")) {
        title = "Notification Management";
      }
    }
    
    // Set the document title
    document.title = `${title} | Timetable Manager`;
    setPageTitle(title);
  }, [location]);
  
  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader user={user} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
