import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign, Npc, insertNpcSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ChevronLeft,
  User, 
  Book,
  Scroll
} from "lucide-react";

interface NPCCreatorProps {
  campaign: Campaign;
}

// NPC form schema
const npcFormSchema = insertNpcSchema.pick({
  name: true,
  race: true,
  occupation: true,
  location: true,
  appearance: true,
  personality: true,
  abilities: true,
  notes: true,
}).extend({
  name: z.string().min(1, "NPC name is required"),
});

type NPCFormValues = z.infer<typeof npcFormSchema>;

export default function NPCCreator({ campaign }: NPCCreatorProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingNpcId, setEditingNpcId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch NPCs for the campaign
  const { 
    data: npcs = [], 
    isLoading: npcsLoading,
    refetch: refetchNpcs
  } = useQuery<Npc[]>({
    queryKey: [`/api/campaigns/${campaign.id}/npcs`],
  });
  
  // NPC form setup
  const form = useForm<NPCFormValues>({
    resolver: zodResolver(npcFormSchema),
    defaultValues: {
      name: "",
      race: "",
      occupation: "",
      location: "",
      appearance: "",
      personality: "",
      abilities: "",
      notes: "",
    },
  });
  
  // Create NPC mutation
  const createNpcMutation = useMutation({
    mutationFn: async (data: NPCFormValues) => {
      const res = await apiRequest("POST", `/api/campaigns/${campaign.id}/npcs`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}/npcs`] });
      toast({
        title: "NPC created",
        description: "The NPC has been created successfully.",
      });
      setDialogOpen(false);
      form.reset();
      refetchNpcs();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update NPC mutation
  const updateNpcMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: NPCFormValues }) => {
      const res = await apiRequest("PUT", `/api/npcs/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}/npcs`] });
      toast({
        title: "NPC updated",
        description: "The NPC has been updated successfully.",
      });
      setDialogOpen(false);
      setEditingNpcId(null);
      form.reset();
      refetchNpcs();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete NPC mutation
  const deleteNpcMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/npcs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}/npcs`] });
      toast({
        title: "NPC deleted",
        description: "The NPC has been deleted successfully.",
      });
      refetchNpcs();
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: NPCFormValues) => {
    if (editingNpcId !== null) {
      updateNpcMutation.mutate({ id: editingNpcId, data });
    } else {
      createNpcMutation.mutate(data);
    }
  };
  
  // Edit NPC handler
  const handleEditNpc = (npcId: number) => {
    const npcToEdit = npcs.find(npc => npc.id === npcId);
    if (npcToEdit) {
      form.reset({
        name: npcToEdit.name,
        race: npcToEdit.race || "",
        occupation: npcToEdit.occupation || "",
        location: npcToEdit.location || "",
        appearance: npcToEdit.appearance || "",
        personality: npcToEdit.personality || "",
        abilities: npcToEdit.abilities || "",
        notes: npcToEdit.notes || "",
      });
      setEditingNpcId(npcId);
      setDialogOpen(true);
    }
  };
  
  // Delete NPC handler
  const handleDeleteNpc = (npcId: number) => {
    if (confirm("Are you sure you want to delete this NPC? This action cannot be undone.")) {
      deleteNpcMutation.mutate(npcId);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation(`/campaign-management/${campaign.id}`)}
                  className="mr-2 -ml-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h1 className="font-lora font-bold text-3xl text-primary">NPC Creator</h1>
              </div>
              <p className="text-secondary">
                Campaign: <span className="font-semibold">{campaign.name}</span>
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="magic-button" onClick={() => {
                    setEditingNpcId(null);
                    form.reset({
                      name: "",
                      race: "",
                      occupation: "",
                      location: "",
                      appearance: "",
                      personality: "",
                      abilities: "",
                      notes: "",
                    });
                  }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New NPC
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNpcId !== null ? "Edit NPC" : "Create New NPC"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingNpcId !== null 
                        ? "Update the details of this non-player character" 
                        : "Add a new non-player character to your campaign"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <Tabs defaultValue="basic">
                        <TabsList className="grid grid-cols-3 mb-4">
                          <TabsTrigger value="basic" className="font-lora">
                            <User className="h-4 w-4 mr-2" />
                            Basic Info
                          </TabsTrigger>
                          <TabsTrigger value="personality" className="font-lora">
                            <Book className="h-4 w-4 mr-2" />
                            Personality
                          </TabsTrigger>
                          <TabsTrigger value="campaign" className="font-lora">
                            <Scroll className="h-4 w-4 mr-2" />
                            Campaign Role
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="NPC name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="race"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Race</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Human, Elf, Dwarf" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="occupation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Occupation</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Blacksmith, Mage, Guard" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Where they can be found" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="appearance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Appearance</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe what the NPC looks like" 
                                    className="min-h-[120px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Include distinctive features, clothing, and mannerisms
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                        
                        <TabsContent value="personality" className="space-y-4">
                          <FormField
                            control={form.control}
                            name="personality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Personality Traits</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe the NPC's personality" 
                                    className="min-h-[150px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Include motivations, quirks, fears, and desires
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="bg-secondary/5 p-4 rounded-md space-y-2">
                            <h4 className="font-lora text-sm font-semibold">Personality Prompts:</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• What motivates this NPC? What do they fear?</li>
                              <li>• How do they speak? Do they have any verbal quirks?</li>
                              <li>• What are their beliefs and values?</li>
                              <li>• How do they react under stress?</li>
                              <li>• What's their general disposition toward strangers?</li>
                            </ul>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="campaign" className="space-y-4">
                          <FormField
                            control={form.control}
                            name="abilities"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Knowledge & Abilities</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="What special skills or knowledge does this NPC have?" 
                                    className="min-h-[100px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Include special abilities, skills, or knowledge this NPC possesses
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plot Hooks & Campaign Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="How does this NPC fit into your campaign?" 
                                    className="min-h-[150px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Include their role in the story, connections to players, and potential quest hooks
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="magic-button"
                          disabled={createNpcMutation.isPending || updateNpcMutation.isPending}
                        >
                          {createNpcMutation.isPending || updateNpcMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {editingNpcId !== null ? "Updating..." : "Creating..."}
                            </>
                          ) : (
                            <>{editingNpcId !== null ? "Update NPC" : "Create NPC"}</>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {npcsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : npcs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {npcs.map((npc) => (
                <Card key={npc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-lora text-xl text-primary">
                          {npc.name}
                        </CardTitle>
                        <CardDescription>
                          {npc.race && npc.occupation 
                            ? `${npc.race} · ${npc.occupation}`
                            : npc.race || npc.occupation || "Unknown"}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditNpc(npc.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteNpc(npc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {npc.location && (
                      <div className="mb-3">
                        <span className="font-semibold text-sm">Location:</span> <span className="text-sm">{npc.location}</span>
                      </div>
                    )}
                    
                    {npc.appearance && (
                      <div className="mb-3">
                        <span className="font-semibold text-sm">Appearance:</span>
                        <p className="text-sm line-clamp-2">{npc.appearance}</p>
                      </div>
                    )}
                    
                    {npc.personality && (
                      <div className="mb-3">
                        <span className="font-semibold text-sm">Personality:</span>
                        <p className="text-sm line-clamp-2">{npc.personality}</p>
                      </div>
                    )}
                    
                    {npc.abilities && (
                      <div className="mb-3">
                        <span className="font-semibold text-sm">Abilities:</span>
                        <p className="text-sm line-clamp-2">{npc.abilities}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEditNpc(npc.id)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <User className="h-12 w-12 text-primary/40 mb-4" />
                <h3 className="font-lora text-xl font-semibold mb-2">No NPCs Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start populating your world by creating non-player characters for your campaign.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="magic-button" onClick={() => {
                      setEditingNpcId(null);
                      form.reset();
                      setDialogOpen(true);
                    }}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First NPC
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
