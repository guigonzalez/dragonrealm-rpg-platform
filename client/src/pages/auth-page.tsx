import { useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "react-i18next";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must not exceed 50 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  displayName: z.string().optional(),
  terms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions"
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);
  
  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      displayName: "",
      terms: false,
    },
  });
  
  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
    });
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Remove terms field before submitting
    const { terms, ...registerData } = data;
    
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.register")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <img src="./assets/logo.png" alt="DragonRealm" className="h-10 mx-auto mb-3" />
                    <h2 className="font-lora text-2xl font-bold text-primary">{t("auth.loginToYourAccount")}</h2>
                    <p className="text-secondary/80 mt-1">{t("auth.login")} {t("common.welcome")}</p>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t("auth.username")} 
                                {...field} 
                                disabled={loginMutation.isPending}
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
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder={t("auth.password")}
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full magic-button" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? t("common.loading") : t("auth.login")}
                      </Button>
                      

                    </form>
                  </Form>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <img src="./assets/logo.png" alt="DragonRealm" className="h-10 mx-auto mb-3" />
                    <h2 className="font-lora text-2xl font-bold text-primary">{t("auth.createYourAccount")}</h2>
                    <p className="text-secondary/80 mt-1">{t("landing.getStarted")}</p>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t("auth.chooseName")}
                                {...field} 
                                disabled={registerMutation.isPending}
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
                            <FormLabel>{t("auth.email")}</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder={t("auth.enterEmail")}
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.displayName")}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t("auth.displayNamePlaceholder")}
                                {...field} 
                                disabled={registerMutation.isPending}
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
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder={t("auth.createPassword")}
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-xs">
                                {t("auth.termsAgreement")}
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full magic-button" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? t("common.creating") : t("auth.createAccount")}
                      </Button>
                      

                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden md:block">
            <div className="h-full flex flex-col justify-center">
              <h1 className="font-lora font-bold text-4xl text-primary mb-6">{t("auth.beginAdventure")}</h1>
              <p className="text-lg mb-8">{t("auth.joinDescription")}</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <i className="ri-sword-fill text-xl text-primary"></i>
                  </div>
                  <div>
                    <h3 className="font-lora text-xl font-semibold text-primary">{t("auth.features.characterManagement.title")}</h3>
                    <p className="text-secondary">{t("auth.features.characterManagement.description")}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <i className="ri-map-pin-fill text-xl text-primary"></i>
                  </div>
                  <div>
                    <h3 className="font-lora text-xl font-semibold text-primary">{t("auth.features.campaignTools.title")}</h3>
                    <p className="text-secondary">{t("auth.features.campaignTools.description")}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <i className="ri-magic-fill text-xl text-primary"></i>
                  </div>
                  <div>
                    <h3 className="font-lora text-xl font-semibold text-primary">{t("auth.features.interactiveElements.title")}</h3>
                    <p className="text-secondary">{t("auth.features.interactiveElements.description")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
