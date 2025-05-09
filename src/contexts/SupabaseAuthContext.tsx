
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

// Auto logout after inactivity
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Track user activity
  useEffect(() => {
    const resetInactivityTimer = () => {
      setLastActivity(Date.now());
    };
    
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);
    window.addEventListener("scroll", resetInactivityTimer);
    
    return () => {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      window.removeEventListener("scroll", resetInactivityTimer);
    };
  }, []);
  
  // Auto logout timer
  useEffect(() => {
    // Clear any existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Only set timer if user is logged in
    if (user) {
      const timer = setTimeout(() => {
        // Auto logout when inactive
        handleSignOut();
        toast("You have been logged out due to inactivity");
      }, INACTIVITY_TIMEOUT);
      
      setInactivityTimer(timer);
    }
    
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [lastActivity, user]);

  useEffect(() => {
    // First set up auth subscription to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Defer user profile fetch to avoid auth listener deadlocks
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
      console.log("Profile loaded:", data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error);
        
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account before logging in.");
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
        
        return { success: false, error: error.message };
      }

      if (!data.user) {
        toast.error("Login failed: User data not found");
        return { success: false, error: "User data not found" };
      }

      console.log("Login successful, user:", data.user.id);
      toast.success("Login successful. Welcome back!");
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Login error: ${error.message || "Unknown error"}`);
      return { success: false, error: error.message };
    }
  };

  const handleSignUp = async (email: string, password: string, userData: any) => {
    try {
      console.log("Attempting signup with:", email);
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'student',
            department: userData.department,
            section: userData.section,
            year: userData.year
          }
        }
      });
      
      if (authError) {
        console.error("Signup error:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('User creation failed');
      }
      
      console.log("Signup successful, user created:", authData.user.id);
      toast.success("Registration successful! Please check your email to confirm your account.");
      
      return { success: true };
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Registration failed: ${error.message || "Unknown error"}`);
      return { success: false, error: error.message };
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setLoading(false);
    toast.success("Logged out successfully");
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        session,
        user,
        profile,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        loading
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
};
