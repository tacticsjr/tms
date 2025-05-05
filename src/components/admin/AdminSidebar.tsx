
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, children, exact = false }) => {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) => 
        cn(
          "flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors",
          isActive 
            ? "bg-primary text-primary-foreground font-medium"
            : "text-foreground/70 hover:bg-muted"
        )
      }
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </NavLink>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  
  // Extract current path components for dynamic links
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isInYearView = pathParts.length >= 3 && pathParts[2] !== 'settings';
  const isInDepartment = pathParts.length >= 4;
  const isInSection = pathParts.length >= 5;
  
  const currentYear = isInYearView ? pathParts[2] : null;
  const currentDept = isInDepartment ? pathParts[3] : null;
  const currentSection = isInSection ? pathParts[4] : null;

  return (
    <nav className="w-64 border-r bg-background flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-4 space-y-8">
        <div className="space-y-1">
          <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider px-3 mb-2">
            Navigation
          </h3>
          <SidebarLink to="/admin/dashboard" exact>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/admin/settings">
            Settings
          </SidebarLink>
        </div>

        {isInYearView && currentYear && (
          <div className="space-y-1">
            <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider px-3 mb-2">
              {currentYear} Year
            </h3>
            {isInDepartment && currentDept && (
              <>
                <SidebarLink to={`/admin/dashboard/${currentYear}/${currentDept}`} exact>
                  {currentDept} Dashboard
                </SidebarLink>
                
                {isInSection && currentSection && (
                  <>
                    <SidebarLink to={`/admin/dashboard/${currentYear}/${currentDept}/${currentSection}`} exact>
                      Section {currentSection}
                    </SidebarLink>
                    <SidebarLink to={`/admin/staff/${currentYear}/${currentDept}/${currentSection}`}>
                      Staff
                    </SidebarLink>
                    <SidebarLink to={`/admin/subjects/${currentYear}/${currentDept}/${currentSection}`}>
                      Subjects
                    </SidebarLink>
                    <SidebarLink to={`/admin/timetables/${currentYear}/${currentDept}/${currentSection}`}>
                      Timetables
                    </SidebarLink>
                    <SidebarLink to={`/admin/master/${currentYear}/${currentDept}/${currentSection}`}>
                      Master Timetable
                    </SidebarLink>
                    <SidebarLink to={`/admin/substitutions/${currentYear}/${currentDept}/${currentSection}`}>
                      Substitutions
                    </SidebarLink>
                    <SidebarLink to={`/admin/notifications/${currentYear}/${currentDept}/${currentSection}`}>
                      Notifications
                    </SidebarLink>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="px-3 py-2">
            <div className="text-xs text-muted-foreground">
              <p>Velammal AI Scheduler</p>
              <p>Academic Year: 2024-2025</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminSidebar;
