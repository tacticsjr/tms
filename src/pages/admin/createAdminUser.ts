
import { supabase } from "@/lib/supabase";

/**
 * This function attempts to create an admin user if one doesn't exist
 * It's a helper function that can be called during initial setup
 */
export const createAdminUser = async () => {
  try {
    // First check if admin user already exists
    const { data: adminUsers, error: queryError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', 'admin@velammal.edu')
      .eq('role', 'admin');
    
    if (queryError) {
      console.error("Error checking for admin user:", queryError);
      return { success: false, error: queryError.message };
    }
    
    // If admin exists, we're done
    if (adminUsers && adminUsers.length > 0) {
      console.log("Admin user already exists");
      return { success: true, message: "Admin user already exists" };
    }
    
    // If no admin exists, try to create one via signup
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@velammal.edu',
      password: 'admin123',
      options: {
        data: {
          name: 'Admin User',
          role: 'admin'
        }
      }
    });
    
    if (error) {
      console.error("Error creating admin user:", error);
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: "Admin user creation failed" };
    }
    
    // Manually insert user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: 'admin@velammal.edu',
        name: 'Admin User',
        role: 'admin'
      });
      
    if (profileError) {
      console.error("Error creating admin profile:", profileError);
      // Non-critical error, continue
    }
    
    console.log("Admin user created successfully");
    return { success: true, message: "Admin user created successfully" };
  } catch (error: any) {
    console.error("Unexpected error creating admin user:", error);
    return { success: false, error: error.message };
  }
};
