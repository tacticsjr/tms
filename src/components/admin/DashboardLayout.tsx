
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  
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
