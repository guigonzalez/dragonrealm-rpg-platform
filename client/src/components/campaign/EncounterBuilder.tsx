import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign, Encounter, Npc, insertEncounterSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  PlusCircle,
  Swords,
  AlertTriangle,
  Skull,
  Users,
  Edit,
  Trash2,
  MinusCircle,
  Plus,
  Minus,
  Check,
  Loader2
} from "lucide-react";

interface EncounterBuilderProps {
  campaign: Campaign;
}

// Encounter form schema
const encounterFormSchema = insertEncounterSchema.omit({
  campaignId: true,
  created: true,
  updated: true
}).extend({
  name: z.string().min(1, "Encounter name is required"),
});

// Monster/enemy schema
const monsterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Monster name is required"),
  cr: z.string(),
  type: z.string(),
  quantity: z.number().min(1),
  hp: z.number().min(1).optional(),
  ac: z.number().min(1).optional(),
  notes: z.string().optional(),
});

type EncounterFormValues = z.infer<typeof encounterFormSchema>;
type Monster = z.infer<typeof monsterSchema>;

// CR to XP mapping
const crToXP: Record<string, number> = {
  "0": 10,
  "1/8": 25,
  "1/4": 50,
  "1/2": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
  "6": 2300,
  "7": 2900,
  "8": 3900,
  "9": 5000,
  "10": 5900,
  "11": 7200,
  "12": 8400,
  "13": 10000,
  "14": 11500,
  "15": 13000,
  "16": 15000,
  "17": 18000,
  "18": 20000,
  "19": 22000,
  "20": 25000,
  "21": 33000,
  "22": 41000,
  "23": 50000,
  "24": 62000,
  "25": 75000,
  "26": 90000,
  "27": 105000,
  "28": 120000,
  "29": 135000,
  "30": 155000,
};

// Monster types
const monsterTypes = [
  "Aberration",
  "Beast",
  "Celestial",
  "Construct",
  "Dragon",
  "Elemental",
  "Fey",
  "Fiend",
  "Giant",
  "Humanoid",
  "Monstrosity",
  "Ooze",
  "Plant",
  "Undead"
];

// Challenge ratings
const challengeRatings = [
  "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23",
  "24", "25", "26", "27", "28", "29", "30"
];

export default function EncounterBuilder({ campaign }: EncounterBuilderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEncounterId, setEditingEncounterId] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState("basic");
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [monsterDialogOpen, setMonsterDialogOpen] = useState(false);
  const [editingMonsterIndex, setEditingMonsterIndex] = useState<number | null>(null);

  // Fetch NPCs for the campaign - can be used as potential enemies/allies
  const { 
    data: npcs = [], 
    isLoading: npcsLoading,
  } = useQuery<Npc[]>({
    queryKey: [`/api/campaigns/${campaign.id}/npcs`],
  });

  // Fetch encounters for the campaign
  const {
    data: encounters = [],
    isLoading: encountersLoading,
    refetch: refetchEncounters
  } = useQuery<Encounter[]>({
    queryKey: [`/api/campaigns/${campaign.id}/encounters`],
  });

  // Encounter form setup
  const form = useForm<EncounterFormValues>({
    resolver: zodResolver(encounterFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      difficulty: "medium",
      status: "planned",
      xpValue: 0,
      monsters: "[]",
      treasure: "",
      notes: "",
    },
  });

  // Monster form setup
  const monsterForm = useForm({
    resolver: zodResolver(monsterSchema),
    defaultValues: {
      id: "",
      name: "",
      cr: "1",
      type: "Humanoid",
      quantity: 1,
      hp: 0,
      ac: 0,
      notes: "",
    },
  });

  // Create encounter mutation
  const createEncounterMutation = useMutation({
    mutationFn: async (data: EncounterFormValues) => {
      // Convert monsters array to JSON string
      const monsterData = JSON.stringify(monsters);
      
      // Calculate total XP based on monsters
      const totalXP = calculateTotalXP();
      
      const encounterData = {
        ...data,
        monsters: monsterData,
        xpValue: totalXP,
        campaignId: campaign.id,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      
      const res = await apiRequest("POST", `/api/campaigns/${campaign.id}/encounters`, encounterData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}/encounters`] });
      toast({
        title: "Encounter created",
        description: "Your encounter has been created successfully.",
      });
      setDialogOpen(false);
      form.reset();
      setMonsters([]);
      refetchEncounters();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update encounter mutation
  const updateEncounterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: EncounterFormValues }) => {
      // Convert monsters array to JSON string
      const monsterData = JSON.stringify(monsters);
      
      // Calculate total XP based on monsters
      const totalXP = calculateTotalXP();
      
      const encounterData = {
        ...data,
        monsters: monsterData,
        xpValue: totalXP,
        updated: new Date().toISOString(),
      };
      
      const res = await apiRequest("PUT", `/api/encounters/${id}`, encounterData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}/encounters`] });
      toast({
        title: "Encounter updated",
        description: "Your encounter has been updated successfully.",
      });
      setDialogOpen(false);
      setEditingEncounterId(null);
      form.reset();
      setMonsters([]);
      refetchEncounters();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete encounter mutation
  const deleteEncounterMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/encounters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}/encounters`] });
      toast({
        title: "Encounter deleted",
        description: "The encounter has been deleted successfully.",
      });
      refetchEncounters();
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate total XP based on monsters
  const calculateTotalXP = () => {
    return monsters.reduce((total, monster) => {
      const monsterXP = crToXP[monster.cr] || 0;
      return total + (monsterXP * monster.quantity);
    }, 0);
  };

  // Get encounter difficulty based on XP and party details
  const getEncounterDifficulty = (xp: number, partyLevel: number, partySize: number) => {
    // This is a simplified approximation - in a full implementation,
    // you would use the DMG encounter difficulty thresholds based on party level
    const averageXPPerPlayer = xp / partySize;
    
    if (averageXPPerPlayer < partyLevel * 50) return "Easy";
    if (averageXPPerPlayer < partyLevel * 100) return "Medium";
    if (averageXPPerPlayer < partyLevel * 150) return "Hard";
    return "Deadly";
  };

  // Encounter form submission handler
  const onEncounterSubmit = (data: EncounterFormValues) => {
    if (editingEncounterId !== null) {
      updateEncounterMutation.mutate({ id: editingEncounterId, data });
    } else {
      createEncounterMutation.mutate(data);
    }
  };

  // Monster form submission handler
  const onMonsterSubmit = (data: any) => {
    if (editingMonsterIndex !== null) {
      // Update existing monster
      const updatedMonsters = [...monsters];
      updatedMonsters[editingMonsterIndex] = data;
      setMonsters(updatedMonsters);
    } else {
      // Add new monster with unique ID
      const newMonster = {
        ...data,
        id: Date.now().toString(),
      };
      setMonsters([...monsters, newMonster]);
    }
    monsterForm.reset();
    setMonsterDialogOpen(false);
    setEditingMonsterIndex(null);
  };

  // Remove monster
  const removeMonster = (index: number) => {
    const updatedMonsters = [...monsters];
    updatedMonsters.splice(index, 1);
    setMonsters(updatedMonsters);
  };

  // Edit monster
  const editMonster = (index: number) => {
    const monsterToEdit = monsters[index];
    monsterForm.reset(monsterToEdit);
    setEditingMonsterIndex(index);
    setMonsterDialogOpen(true);
  };

  // Edit encounter
  const handleEditEncounter = (encounterId: number) => {
    const encounterToEdit = encounters.find(e => e.id === encounterId);
    if (encounterToEdit) {
      form.reset({
        name: encounterToEdit.name,
        description: encounterToEdit.description || "",
        location: encounterToEdit.location || "",
        difficulty: encounterToEdit.difficulty,
        status: encounterToEdit.status,
        xpValue: encounterToEdit.xpValue,
        monsters: encounterToEdit.monsters,
        treasure: encounterToEdit.treasure || "",
        notes: encounterToEdit.notes || "",
      });
      
      try {
        const parsedMonsters = JSON.parse(encounterToEdit.monsters);
        setMonsters(Array.isArray(parsedMonsters) ? parsedMonsters : []);
      } catch (e) {
        setMonsters([]);
      }
      
      setEditingEncounterId(encounterId);
      setDialogOpen(true);
    }
  };

  // Delete encounter handler
  const handleDeleteEncounter = (encounterId: number) => {
    if (confirm("Are you sure you want to delete this encounter? This action cannot be undone.")) {
      deleteEncounterMutation.mutate(encounterId);
    }
  };

  // Update monster quantity
  const updateMonsterQuantity = (index: number, change: number) => {
    const updatedMonsters = [...monsters];
    const newQuantity = Math.max(1, updatedMonsters[index].quantity + change);
    updatedMonsters[index] = {
      ...updatedMonsters[index],
      quantity: newQuantity
    };
    setMonsters(updatedMonsters);
  };

  // Helper function to format XP values
  const formatXP = (xp: number) => {
    return new Intl.NumberFormat().format(xp);
  };

  // Get difficulty class for styling
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-orange-100 text-orange-800";
      case "deadly": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div>
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
            <h1 className="font-lora font-bold text-3xl text-primary">Encounter Builder</h1>
          </div>
          <p className="text-secondary">
            Campaign: <span className="font-semibold">{campaign.name}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="magic-button" onClick={() => {
                setEditingEncounterId(null);
                form.reset({
                  name: "",
                  description: "",
                  location: "",
                  difficulty: "medium",
                  status: "planned",
                  xpValue: 0,
                  monsters: "[]",
                  treasure: "",
                  notes: "",
                });
                setMonsters([]);
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Encounter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  {editingEncounterId !== null ? "Edit Encounter" : "Create New Encounter"}
                </DialogTitle>
                <DialogDescription>
                  {editingEncounterId !== null 
                    ? "Update the details of this encounter" 
                    : "Design a new encounter for your campaign"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onEncounterSubmit)} className="space-y-4">
                  <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="basic" className="font-lora">
                        <Swords className="h-4 w-4 mr-2" />
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger value="monsters" className="font-lora">
                        <Skull className="h-4 w-4 mr-2" />
                        Monsters
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="font-lora">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Details
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Encounter Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter a name for this encounter" {...field} />
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
                                <Input placeholder="Where will this encounter take place?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the encounter scenario"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                  <SelectItem value="deadly">Deadly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="planned">Planned</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="monsters" className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-lora font-semibold text-xl text-primary">Monsters & NPCs</h3>
                        <Dialog open={monsterDialogOpen} onOpenChange={setMonsterDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setEditingMonsterIndex(null);
                                monsterForm.reset({
                                  id: "",
                                  name: "",
                                  cr: "1",
                                  type: "Humanoid",
                                  quantity: 1,
                                  hp: 0,
                                  ac: 0,
                                  notes: "",
                                });
                              }}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Monster
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {editingMonsterIndex !== null ? "Edit Monster" : "Add Monster"}
                              </DialogTitle>
                              <DialogDescription>
                                {editingMonsterIndex !== null
                                  ? "Update the details of this monster"
                                  : "Add a new monster or enemy to your encounter"}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <form onSubmit={monsterForm.handleSubmit(onMonsterSubmit)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="font-opensans text-sm font-medium">Name</label>
                                  <Input 
                                    placeholder="Monster name" 
                                    {...monsterForm.register("name")}
                                  />
                                  {monsterForm.formState.errors.name && (
                                    <p className="text-red-500 text-xs">{monsterForm.formState.errors.name.message}</p>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="font-opensans text-sm font-medium">Quantity</label>
                                  <Input 
                                    type="number" 
                                    min={1}
                                    {...monsterForm.register("quantity", { valueAsNumber: true })}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <label className="font-opensans text-sm font-medium">Challenge Rating</label>
                                  <Select 
                                    onValueChange={(val) => monsterForm.setValue("cr", val)} 
                                    defaultValue={monsterForm.getValues("cr")}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select CR" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {challengeRatings.map(cr => (
                                        <SelectItem key={cr} value={cr}>{cr}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="font-opensans text-sm font-medium">AC</label>
                                  <Input 
                                    type="number"
                                    placeholder="Armor Class"
                                    {...monsterForm.register("ac", { valueAsNumber: true })}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="font-opensans text-sm font-medium">HP</label>
                                  <Input 
                                    type="number"
                                    placeholder="Hit Points"
                                    {...monsterForm.register("hp", { valueAsNumber: true })}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="font-opensans text-sm font-medium">Type</label>
                                <Select 
                                  onValueChange={(val) => monsterForm.setValue("type", val)} 
                                  defaultValue={monsterForm.getValues("type")}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select monster type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {monsterTypes.map(type => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="font-opensans text-sm font-medium">Notes</label>
                                <Textarea 
                                  placeholder="Special abilities, tactics or other notes"
                                  {...monsterForm.register("notes")}
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setMonsterDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">
                                  {editingMonsterIndex !== null ? "Update Monster" : "Add Monster"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {monsters.length > 0 ? (
                        <div className="space-y-3">
                          {monsters.map((monster, index) => (
                            <div
                              key={monster.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-secondary/5 rounded-lg border border-secondary/20"
                            >
                              <div className="space-y-1 mb-2 sm:mb-0">
                                <h4 className="font-lora font-semibold text-primary">
                                  {monster.name}
                                  <Badge variant="outline" className="ml-2 font-normal">
                                    CR {monster.cr}
                                  </Badge>
                                </h4>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="text-secondary">{monster.type}</span>
                                  {monster.ac > 0 && <span>AC: {monster.ac}</span>}
                                  {monster.hp > 0 && <span>HP: {monster.hp}</span>}
                                </div>
                                {monster.notes && (
                                  <p className="text-sm text-muted-foreground">{monster.notes}</p>
                                )}
                              </div>
                              
                              <div className="flex items-center">
                                <div className="flex items-center mr-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateMonsterQuantity(index, -1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="font-opensans font-semibold text-primary mx-2">
                                    {monster.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateMonsterQuantity(index, 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={() => editMonster(index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeMonster(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="p-3 bg-white rounded-lg border border-secondary/20">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-lora font-semibold text-primary">Total XP</h4>
                                <p className="text-secondary font-opensans">
                                  {formatXP(calculateTotalXP())} XP
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <Badge className={getDifficultyClass(form.getValues("difficulty"))}>
                                    {form.getValues("difficulty")}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-secondary/30 rounded-lg">
                          <Skull className="h-10 w-10 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-muted-foreground">No monsters added yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              setEditingMonsterIndex(null);
                              setMonsterDialogOpen(true);
                            }}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Your First Monster
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="notes" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="treasure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treasure & Rewards</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What loot or rewards will the players get?"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DM Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes for running this encounter"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Include any specific tactics, environmental effects, or roleplay notes
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
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createEncounterMutation.isPending || updateEncounterMutation.isPending}
                    >
                      {editingEncounterId !== null ? (
                        updateEncounterMutation.isPending ? "Saving..." : "Save Encounter"
                      ) : (
                        createEncounterMutation.isPending ? "Creating..." : "Create Encounter"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="font-lora text-xl">Campaign Encounters</CardTitle>
              <CardDescription>
                Manage your campaign's encounters and challenges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {encountersLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : encounters.length > 0 ? (
                encounters.map(encounter => (
                  <div 
                    key={encounter.id}
                    className="p-3 hover:bg-secondary/5 rounded-md flex justify-between items-center group cursor-pointer transition-colors"
                    onClick={() => handleEditEncounter(encounter.id)}
                  >
                    <div>
                      <h4 className="font-lora font-semibold text-primary">{encounter.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {encounter.status === "planned" ? "Planned" : 
                           encounter.status === "in_progress" ? "In Progress" : "Completed"}
                        </Badge>
                        {encounter.difficulty && (
                          <Badge className={`text-xs ${getDifficultyClass(encounter.difficulty)}`}>
                            {encounter.difficulty.charAt(0).toUpperCase() + encounter.difficulty.slice(1)}
                          </Badge>
                        )}
                      </div>
                      {encounter.location && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Location: {encounter.location}
                        </p>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEncounter(encounter.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEncounter(encounter.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-secondary/30 rounded-lg">
                  <Swords className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No encounters created yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setEditingEncounterId(null);
                      form.reset();
                      setMonsters([]);
                      setDialogOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Encounter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="font-lora text-xl">Encounter Tips</CardTitle>
              <CardDescription>
                Guidelines for creating balanced and exciting encounters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
                <h3 className="font-lora font-semibold text-primary mb-2">
                  <Users className="h-5 w-5 inline mr-2" />
                  Building for Your Party
                </h3>
                <p className="text-sm mb-2">
                  For balanced encounters, consider these factors:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Party composition and abilities</li>
                  <li>Number of players vs. number of monsters</li>
                  <li>Average party level (APL)</li>
                  <li>Rest resources available to players</li>
                </ul>
              </div>
              
              <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
                <h3 className="font-lora font-semibold text-primary mb-2">
                  <AlertTriangle className="h-5 w-5 inline mr-2" />
                  Difficulty Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-lora font-semibold text-sm mb-1">XP Thresholds per Character</h4>
                    <div className="text-xs space-y-1">
                      <p><span className="font-semibold">Level 1:</span> 25 (Easy), 50 (Medium), 75 (Hard), 100 (Deadly)</p>
                      <p><span className="font-semibold">Level 3:</span> 75 (Easy), 150 (Medium), 225 (Hard), 400 (Deadly)</p>
                      <p><span className="font-semibold">Level 5:</span> 250 (Easy), 500 (Medium), 750 (Hard), 1100 (Deadly)</p>
                      <p><span className="font-semibold">Level 10:</span> 600 (Easy), 1200 (Medium), 1900 (Hard), 2800 (Deadly)</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-lora font-semibold text-sm mb-1">Encounter Multipliers</h4>
                    <div className="text-xs space-y-1">
                      <p><span className="font-semibold">Single monster:</span> x1</p>
                      <p><span className="font-semibold">Pair (2):</span> x1.5</p>
                      <p><span className="font-semibold">Group (3-6):</span> x2</p>
                      <p><span className="font-semibold">Gang (7-10):</span> x2.5</p>
                      <p><span className="font-semibold">Mob (11-14):</span> x3</p>
                      <p><span className="font-semibold">Horde (15+):</span> x4</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/20">
                <h3 className="font-lora font-semibold text-primary mb-2">
                  <Swords className="h-5 w-5 inline mr-2" />
                  Combat Tips
                </h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Mix monster types for variety and challenge</li>
                  <li>Include terrain or environmental effects</li>
                  <li>Consider objective-based encounters besides "defeat all enemies"</li>
                  <li>Plan monster tactics and reinforcements</li>
                  <li>Use dynamic encounters that change during combat</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}