
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
        // Create a default profile if one doesn't exist
        await createDefaultProfile(userId);
        return;
      }
      
      setProfile(data);
      console.log("Profile loaded:", data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Create a default profile if one doesn't exist
  const createDefaultProfile = async (userId: string) => {
    try {
      // Get user metadata from auth
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      
      if (!userData || !userData.user) {
        console.error('User data not found for ID:', userId);
        return;
      }
      
      const userEmail = userData.user.email || '';
      
      // Create a default profile
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: userData.user.user_metadata.name || 'User',
          email: userEmail,
          role: userData.user.user_metadata.role || 'student',
          department: userData.user.user_metadata.department || null,
          section: userData.user.user_metadata.section || null,
          year: userData.user.user_metadata.year || null
        }])
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating default profile:', error);
        return;
      }
      
      setProfile(data);
      console.log('Created default profile:', data);
    } catch (error) {
      console.error('Error creating default profile:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "User data not found" };
      }

      console.log("Login successful, user:", data.user.id);
      
      // Check if a profile exists, if not create one
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata.name || 'User',
            role: email.includes('admin') ? 'admin' : 'student', // Set role based on email
          });
        
        if (createError) {
          console.error("Error creating profile during login:", createError);
          // We continue anyway as this is non-critical
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
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
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (authError) {
        console.error("Signup error:", authError);
        return { success: false, error: authError.message };
      }
      
      if (!authData.user) {
        return { success: false, error: 'User creation failed' };
      }

      console.log("Signup successful, user created:", authData.user.id);
      
      // If Supabase trigger fails, create the user profile manually as a fallback
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: email,
          name: userData.name,
          role: userData.role || 'student',
          department: userData.department || null,
          section: userData.section || null,
          year: userData.year || null
        }])
        .select()
        .single();
        
      if (insertError) {
        console.log("Profile may already exist or failed to create:", insertError);
        // Non-critical error, continue
      }
      
      toast.success("Registration successful! Please check your email to confirm your account.");
      return { success: true };
    } catch (error: any) {
      console.error("Registration error:", error);
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
