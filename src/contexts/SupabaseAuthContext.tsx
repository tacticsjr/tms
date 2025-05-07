
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, getUser } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

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

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({ 
          title: "Login failed", 
          description: error.message,
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      toast({ 
        title: "Login successful", 
        description: "Welcome back!"
      });
      
      return { success: true };
    } catch (error: any) {
      toast({ 
        title: "Login error", 
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // 1. Sign up user with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: userData.name,
            role: 'student'
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
          role: 'student',
          department: userData.department,
          section: userData.section,
          year: '2023'  // Default to current academic year
        });
      
      if (profileError) {
        throw profileError;
      }
      
      toast({ 
        title: "Registration successful", 
        description: "Your account has been created" 
      });
      
      return { success: true };
    } catch (error: any) {
      toast({ 
        title: "Registration failed", 
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setProfile(null);
    setLoading(false);
    toast({ title: "Logged out successfully" });
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        session,
        user,
        profile,
        signIn,
        signUp,
        signOut: signOutUser,
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
