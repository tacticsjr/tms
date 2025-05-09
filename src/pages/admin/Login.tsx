
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Login = () => {
  // Using test credentials, real credentials should be entered by the user
  const [email, setEmail] = useState("admin@velammal.edu");
  const [password, setPassword] = useState("Monesh23062004");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Attempting admin login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Admin login error:", error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Admin login successful, user:", data.user?.id);
      
      // Successfully logged in, now check if the user has the admin role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user?.id)
        .single();
      
      if (profileError || !profile) {
        console.log("Profile not found or error, creating admin profile");
        // Create a user profile if it doesn't exist (first login)
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: data.user?.id,
            email: data.user?.email,
            name: "Admin User",
            role: "admin"
          }]);
          
        if (insertError) {
          console.error("Profile setup error:", insertError);
          toast({
            title: "Profile setup failed",
            description: "Could not create user profile",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setIsSubmitting(false);
          return;
        }
        
        toast({
          title: "Login successful",
          description: "Welcome to Velammal AI Scheduler",
        });
        
        navigate("/admin/dashboard");
        return;
      }
      
      if (profile.role !== 'admin') {
        console.error("User is not an admin:", profile.role);
        toast({
          title: "Access denied",
          description: "You don't have admin access",
          variant: "destructive",
        });
        // Sign the user out if they don't have admin access
        await supabase.auth.signOut();
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome to Velammal AI Scheduler",
      });
      
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Velammal AI Scheduler</h1>
          <p className="text-muted-foreground mt-2">Admin Portal</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@velammal.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Demo Credentials</p>
          <p>Email: admin@velammal.edu | Password: Monesh23062004</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
