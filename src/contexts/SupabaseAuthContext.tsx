
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, getUser, signOut, onAuthStateChange } from "@/lib/supabase";
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Set up auth subscription
    const subscription = onAuthStateChange((session) => {
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

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(`Login failed: ${error.message}`);
        return { success: false, error: error.message };
      }

      toast.success("Login successful. Welcome back!");
      
      return { success: true };
    } catch (error: any) {
      toast.error(`Login error: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const handleSignUp = async (email: string, password: string, userData: any) => {
    try {
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'student'
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('User creation failed');
      }
      
      // 2. Insert additional user data into the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'student',
          department: userData.department,
          section: userData.section,
          year: userData.year || '2023'
        });
      
      if (profileError) {
        throw profileError;
      }
      
      toast.success("Registration successful! Your account has been created.");
      
      return { success: true };
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
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
