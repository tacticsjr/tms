
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/admin/DashboardLayout";

// Admin pages
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import YearDashboard from "@/pages/admin/YearDashboard";
import DepartmentDashboard from "@/pages/admin/DepartmentDashboard";
import SectionDashboard from "@/pages/admin/SectionDashboard";
import StaffManagement from "@/pages/admin/StaffManagement";
import SubjectManagement from "@/pages/admin/SubjectManagement";
import TimetableGenerator from "@/pages/admin/TimetableGenerator";
import Settings from "@/pages/admin/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<Login />} />
            
            {/* Protected admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dashboard/:year" element={<YearDashboard />} />
              <Route path="dashboard/:year/:dept" element={<DepartmentDashboard />} />
              <Route path="dashboard/:year/:dept/:section" element={<SectionDashboard />} />
              
              {/* Staff management */}
              <Route path="staff/:year/:dept/:section" element={<StaffManagement />} />
              
              {/* Subject management */}
              <Route path="subjects/:year/:dept/:section" element={<SubjectManagement />} />
              
              {/* Timetable related */}
              <Route path="timetables/:year/:dept/:section" element={<TimetableGenerator />} />
              
              {/* Settings */}
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
