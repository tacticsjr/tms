
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Attempting login with:", data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) {
        console.error("Login error:", error);
        
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account before logging in.");
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
        
        setIsSubmitting(false);
        return;
      }
      
      // Login successful
      if (authData && authData.user) {
        toast.success("Login successful!");
        
        // Check user role for redirection
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        }
        
        // Redirect based on role
        if (profile && profile.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Velammal AI Scheduler</h1>
          <p className="text-muted-foreground mt-2">Student Portal</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your timetable
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => navigate("/user/register")}>
                      Register now
                    </Button>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <div className="mt-6 flex justify-center">
          <Button variant="link" onClick={() => navigate("/admin/login")}>
            Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
