import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema, LoginData } from "@shared/schema";
import { EsportsLogo } from "@/components/ui/esports-logo";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobileNo: "",
    },
  });

  const handleRegister = (data: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  // Handle tab switching
  const handleTabChange = (value: string) => {
    setActiveTab(value as "login" | "signup");
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <EsportsLogo className="mb-8" size="md" />
        
        <Tabs defaultValue="login" className="w-full max-w-md" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your username" 
                          className="bg-primary-50 border-gray-700 text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <a href="#" className="text-xs text-secondary hover:text-secondary-300">
                          Forgot Password?
                        </a>
                      </div>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="••••••••" 
                          className="bg-primary-50 border-gray-700 text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary-600 text-white" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6">
              <div className="relative flex items-center justify-center">
                <Separator className="my-4" />
                <span className="absolute bg-primary px-2 text-xs text-gray-500">OR</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button variant="outline" className="bg-[#3b5998] hover:bg-[#324e8c] border-none">
                  <i className="ri-facebook-fill text-xl mr-2"></i>
                  Facebook
                </Button>
                <Button variant="outline" className="bg-gray-500 hover:bg-gray-600  border-none">
                  <i className="ri-google-fill text-xl mr-2"></i>
                  Google
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="signup">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Choose a username" 
                          className="bg-primary-50 border-gray-700 text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Enter your email" 
                          className="bg-primary-50 border-gray-700 text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="mobileNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile No</FormLabel>
                      <FormControl>
                        <Input 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          value={field.value ?? ''}
                          disabled={field.disabled}
                          type="tel" 
                          placeholder="Enter your mobile number" 
                          className="bg-primary-50 border-gray-700 text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Create a password" 
                          className="bg-primary-50 border-gray-700 text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Confirm your password" 
                          className="bg-primary-50 border-gray-700 text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary-600 text-black" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-6 w-full">
        <Card className="w-full bg-primary-900/50 border-0">
          <CardContent className="p-0">
            <img 
              src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              className="w-full h-24 object-cover rounded-xl opacity-20" 
              alt="Gaming tournament background" 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
