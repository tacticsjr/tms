
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  email: string;
  role: "admin" | "staff" | "student";
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  checkSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo credentials - in a real app, this would be an API call
  const DEMO_USER = {
    email: "admin@velammal.edu",
    password: "admin123",
    name: "Admin User",
    role: "admin" as const,
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    const timer = setTimeout(() => {
      logout();
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity",
        variant: "destructive",
      });
      navigate("/admin/login");
    }, INACTIVITY_TIMEOUT);
    
    setInactivityTimer(timer);
  };

  useEffect(() => {
    const handleActivity = () => {
      if (user) resetInactivityTimer();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, [user, inactivityTimer]);

  const checkSession = () => {
    setIsLoading(true);
    
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        resetInactivityTimer();
      }
    } catch (error) {
      console.error("Error checking session:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check credentials
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const userData = {
          email: DEMO_USER.email,
          role: DEMO_USER.role,
          name: DEMO_USER.name
        };
        
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "demo-token-" + Date.now());
        
        setUser(userData);
        resetInactivityTimer();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
