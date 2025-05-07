
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProtectedRoute from "@/components/UserProtectedRoute";
import DashboardLayout from "@/components/admin/DashboardLayout";
import UserDashboardLayout from "@/components/user/UserDashboardLayout";

// Admin pages
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import YearDashboard from "@/pages/admin/YearDashboard";
import DepartmentDashboard from "@/pages/admin/DepartmentDashboard";
import SectionDashboard from "@/pages/admin/SectionDashboard";
import StaffManagement from "@/pages/admin/StaffManagement";
import SubjectManagement from "@/pages/admin/SubjectManagement";
import TimetableGenerator from "@/pages/admin/TimetableGenerator";
import TimetableView from "@/pages/admin/TimetableView";
import MasterTimetable from "@/pages/admin/MasterTimetable";
import SubstitutionManagement from "@/pages/admin/SubstitutionManagement";
import NotificationManagement from "@/pages/admin/NotificationManagement";
import Settings from "@/pages/admin/Settings";

// User pages
import UserLogin from "@/pages/user/Login";
import UserRegister from "@/pages/user/Register";
import UserDashboard from "@/pages/user/Dashboard";
import UserNotifications from "@/pages/user/Notifications";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SupabaseAuthProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/user/login" replace />} />
              <Route path="/admin/login" element={<Login />} />
              
              {/* User routes */}
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/register" element={<UserRegister />} />
              
              {/* Protected user routes */}
              <Route path="/user" element={
                <UserProtectedRoute>
                  <UserDashboardLayout />
                </UserProtectedRoute>
              }>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="notifications" element={<UserNotifications />} />
              </Route>
              
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
                <Route path="timetables/:year/:dept/:section/draft" element={<TimetableView />} />
                
                {/* Master timetable */}
                <Route path="master/:year/:dept/:section" element={<MasterTimetable />} />
                
                {/* Substitutions */}
                <Route path="substitutions/:year/:dept/:section" element={<SubstitutionManagement />} />
                
                {/* Notifications */}
                <Route path="notifications/:year/:dept/:section" element={<NotificationManagement />} />
                
                {/* Settings */}
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster />
            <Sonner />
          </AuthProvider>
        </SupabaseAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
