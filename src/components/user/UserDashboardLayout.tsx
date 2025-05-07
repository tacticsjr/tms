
import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Calendar, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";

const UserDashboardLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isMobile = useMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      navigate("/user/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem("currentUser");
      navigate("/user/login");
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    navigate("/user/login");
  };
  
  if (!currentUser) {
    return null; // Will redirect in useEffect
  }
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-accent text-accent-foreground" : "";
  };
  
  // Navigation items
  const navItems = [
    {
      name: "Timetable",
      path: "/user/dashboard",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      name: "Notifications",
      path: "/user/notifications",
      icon: <Bell className="h-4 w-4 mr-2" />,
    },
  ];
  
  // Content for both mobile and desktop navigation
  const navigationContent = (
    <div className="space-y-2 py-4">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent ${isActive(item.path)}`}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
      <div className="h-8"></div>
      <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
  
  return (
    <div className="h-screen flex flex-col">
      {/* Top header bar */}
      <header className="border-b bg-background h-14 flex items-center px-4">
        <div className="flex-1 flex items-center">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-2 px-3">Velammal AI Scheduler</h2>
                  <p className="text-sm text-muted-foreground mb-4 px-3">Student Portal</p>
                  {navigationContent}
                </div>
              </SheetContent>
            </Sheet>
          )}
          <h1 className="text-lg font-semibold">
            {currentUser.department}-{currentUser.section} Dashboard
          </h1>
        </div>
        <div>
          <span className="text-sm font-medium">{currentUser.name}</span>
        </div>
      </header>
      
      {/* Main content area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - only on desktop */}
        {!isMobile && (
          <aside className="hidden md:block w-64 border-r bg-background p-4">
            <h2 className="text-lg font-semibold mb-2">Velammal AI Scheduler</h2>
            <p className="text-sm text-muted-foreground mb-4">Student Portal</p>
            {navigationContent}
          </aside>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
