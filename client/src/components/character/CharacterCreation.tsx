import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCharacterSchema, InsertCharacter } from "@shared/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Dices, Shield, Swords, Scroll, User, HelpCircle, Check } from "lucide-react";

// Define races and classes
const races = [
  { id: "human", name: "Human", description: "Versatile and adaptable, humans are the most common race in most D&D settings." },
  { id: "elf", name: "Elf", description: "Graceful and long-lived, elves are known for their magical affinity and connection to nature." },
  { id: "dwarf", name: "Dwarf", description: "Stout and hardy, dwarves are known for their craftsmanship and resilience." },
  { id: "halfling", name: "Halfling", description: "Small but brave, halflings are known for their luck and stealth." },
  { id: "half-elf", name: "Half-Elf", description: "Combining human adaptability with elven grace, half-elves excel in social situations." },
  { id: "half-orc", name: "Half-Orc", description: "Strong and intimidating, half-orcs make formidable warriors." },
  { id: "gnome", name: "Gnome", description: "Small and inventive, gnomes are known for their curiosity and technical skills." },
  { id: "tiefling", name: "Tiefling", description: "With infernal heritage, tieflings possess unique abilities and often face prejudice." },
  { id: "dragonborn", name: "Dragonborn", description: "Draconic humanoids with breath weapons and strong clan loyalties." }
];

const classes = [
  { id: "barbarian", name: "Barbarian", description: "Fierce warriors with unmatched rage and survival skills." },
  { id: "bard", name: "Bard", description: "Versatile spellcasters who use music and performance to inspire allies." },
  { id: "cleric", name: "Cleric", description: "Divine spellcasters who serve various deities and can heal allies." },
  { id: "druid", name: "Druid", description: "Nature spellcasters who can shapeshift into animals." },
  { id: "fighter", name: "Fighter", description: "Martial experts with unrivaled weapon mastery." },
  { id: "monk", name: "Monk", description: "Disciplined martial artists who harness ki energy." },
  { id: "paladin", name: "Paladin", description: "Holy warriors who combine martial prowess with divine spellcasting." },
  { id: "ranger", name: "Ranger", description: "Skilled hunters and trackers with limited spellcasting abilities." },
  { id: "rogue", name: "Rogue", description: "Stealthy experts in stealth, traps, and precision strikes." },
  { id: "sorcerer", name: "Sorcerer", description: "Innate spellcasters with magical bloodlines." },
  { id: "warlock", name: "Warlock", description: "Spellcasters who form pacts with powerful entities." },
  { id: "wizard", name: "Wizard", description: "Scholarly spellcasters with the widest range of spells." }
];

const backgrounds = [
  { id: "acolyte", name: "Acolyte", description: "You have spent your life in service to a temple." },
  { id: "criminal", name: "Criminal", description: "You have a history of breaking the law." },
  { id: "folk-hero", name: "Folk Hero", description: "You come from a humble background but are destined for greatness." },
  { id: "noble", name: "Noble", description: "You understand wealth, power, and privilege." },
  { id: "sage", name: "Sage", description: "You have spent years learning about the world." },
  { id: "soldier", name: "Soldier", description: "You have fought in a military organization." },
  { id: "hermit", name: "Hermit", description: "You lived in seclusion, either in a community or alone." },
  { id: "outlander", name: "Outlander", description: "You grew up in the wilds, far from civilization." }
];

const alignments = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil"
];

// Modified character schema for form validation
const characterFormSchema = insertCharacterSchema.omit({
  userId: true,
  created: true,
  updated: true
}).extend({
  strength: z.number().min(3).max(20),
  dexterity: z.number().min(3).max(20),
  constitution: z.number().min(3).max(20),
  intelligence: z.number().min(3).max(20),
  wisdom: z.number().min(3).max(20),
  charisma: z.number().min(3).max(20),
  maxHitPoints: z.number().min(1),
  currentHitPoints: z.number().min(1),
  armorClass: z.number().min(1),
  speed: z.number().min(0),
  proficiencyBonus: z.number().min(0),
  savingThrows: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  spells: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

type CharacterFormValues = z.infer<typeof characterFormSchema>;

export default function CharacterCreation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = useParams();
  const characterId = params.id ? parseInt(params.id) : undefined;
  const isEditMode = !!characterId;
  const [currentTab, setCurrentTab] = useState("basics");
  const [savingThrows, setSavingThrows] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillsWithAdvantage, setSkillsWithAdvantage] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [spells, setSpells] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [hasInspiration, setHasInspiration] = useState<boolean>(false);
  
  // Fetch character data if in edit mode
  const { data: characterData, isLoading: isLoadingCharacter } = useQuery({
    queryKey: ["/api/characters", characterId],
    queryFn: async () => {
      if (!characterId) return null;
      const res = await fetch(`/api/characters/${characterId}`);
      if (!res.ok) throw new Error("Character not found");
      return res.json();
    },
    enabled: !!characterId
  });
  
  // Define the form with default values
  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: "",
      race: "",
      class: "",
      level: 1,
      background: "",
      alignment: "",
      experience: 0,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      maxHitPoints: 10,
      currentHitPoints: 10,
      armorClass: 10,
      speed: 30,
      proficiencyBonus: 2,
      savingThrows: [],
      skills: [],
      equipment: [],
      spells: [],
      features: [],
      traits: "",
      ideals: "",
      bonds: "",
      flaws: "",
      notes: ""
    }
  });
  
  // Update form values for arrays
  const updateFormArrays = () => {
    form.setValue("savingThrows", savingThrows);
    form.setValue("skills", skills);
    form.setValue("equipment", equipment);
    form.setValue("spells", spells);
    form.setValue("features", features);
  };
  
  // Mutation for creating a character
  const createMutation = useMutation({
    mutationFn: async (characterData: CharacterFormValues) => {
      if (!user) throw new Error("You must be logged in to create a character");
      
      const now = new Date().toISOString();
      const insertData: InsertCharacter = {
        ...characterData,
        userId: user.id,
        created: now,
        updated: now
      };
      
      const res = await apiRequest("POST", "/api/characters", insertData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({
        title: "Character created",
        description: "Your character has been created successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for updating a character
  const updateMutation = useMutation({
    mutationFn: async (characterData: CharacterFormValues) => {
      if (!user) throw new Error("You must be logged in to update a character");
      if (!characterId) throw new Error("Character ID is required");
      
      const now = new Date().toISOString();
      const updateData = {
        ...characterData,
        updated: now
      };
      
      const res = await apiRequest("PATCH", `/api/characters/${characterId}`, updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters", characterId] });
      toast({
        title: "Character updated",
        description: "Your character has been updated successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: CharacterFormValues) => {
    // Create a new object with the form data and the current array values
    const formDataWithArrays: CharacterFormValues = {
      ...data,
      savingThrows,
      skills,
      equipment,
      spells,
      features
    };
    
    // Submit to different mutations based on whether we're creating or editing
    if (isEditMode) {
      updateMutation.mutate(formDataWithArrays);
    } else {
      createMutation.mutate(formDataWithArrays);
    }
  };
  
  // Load character data when in edit mode
  useEffect(() => {
    if (characterData) {
      // Set form values from character data
      form.reset({
        name: characterData.name || "",
        race: characterData.race || "",
        class: characterData.class || "",
        level: characterData.level || 1,
        background: characterData.background || "",
        alignment: characterData.alignment || "",
        experience: characterData.experience || 0,
        strength: characterData.strength || 10,
        dexterity: characterData.dexterity || 10,
        constitution: characterData.constitution || 10,
        intelligence: characterData.intelligence || 10,
        wisdom: characterData.wisdom || 10,
        charisma: characterData.charisma || 10,
        maxHitPoints: characterData.maxHitPoints || 10,
        currentHitPoints: characterData.currentHitPoints || 10,
        armorClass: characterData.armorClass || 10,
        speed: characterData.speed || 30,
        proficiencyBonus: characterData.proficiencyBonus || 2,
        traits: characterData.traits || "",
        ideals: characterData.ideals || "",
        bonds: characterData.bonds || "",
        flaws: characterData.flaws || "",
        notes: characterData.notes || ""
      });
      
      // Set array values
      setSavingThrows(characterData.savingThrows || []);
      setSkills(characterData.skills || []);
      setEquipment(characterData.equipment || []);
      setSpells(characterData.spells || []);
      setFeatures(characterData.features || []);
    }
  }, [characterData, form]);
  
  // Roll dice for ability scores
  const rollAbilityScores = () => {
    // Simulate 4d6 drop lowest for each ability score
    const rollStat = () => {
      const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      rolls.sort((a, b) => a - b); // Sort ascending
      rolls.shift(); // Remove lowest die
      return rolls.reduce((sum, die) => sum + die, 0); // Sum remaining dice
    };
    
    form.setValue("strength", rollStat());
    form.setValue("dexterity", rollStat());
    form.setValue("constitution", rollStat());
    form.setValue("intelligence", rollStat());
    form.setValue("wisdom", rollStat());
    form.setValue("charisma", rollStat());
    
    toast({
      title: "Dice rolled!",
      description: "Your ability scores have been randomly generated.",
    });
  };
  
  // Helper function for handling array item toggles
  const toggleArrayItem = (
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>, 
    item: string
  ) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };
  
  // Helper function for toggling advantage on skills
  const toggleAdvantage = (skill: string) => {
    if (skillsWithAdvantage.includes(skill)) {
      setSkillsWithAdvantage(skillsWithAdvantage.filter(s => s !== skill));
    } else {
      setSkillsWithAdvantage([...skillsWithAdvantage, skill]);
    }
  };
  
  // Function to add a new item to an array
  const addItemToArray = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    newItem: string
  ) => {
    if (newItem.trim() === "") return;
    if (!array.includes(newItem)) {
      setArray([...array, newItem]);
    }
  };
  
  // Function to remove an item from an array
  const removeItemFromArray = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    itemToRemove: string
  ) => {
    setArray(array.filter(item => item !== itemToRemove));
  };
  
  // Tab navigation
  const goToNextTab = () => {
    // No need to update form arrays as they will be included when we submit
    if (currentTab === "basics") setCurrentTab("abilities");
    else if (currentTab === "abilities") setCurrentTab("equipment");
    else if (currentTab === "equipment") setCurrentTab("features");
    else if (currentTab === "features") setCurrentTab("personality");
  };
  
  const goToPreviousTab = () => {
    if (currentTab === "personality") setCurrentTab("features");
    else if (currentTab === "features") setCurrentTab("equipment");
    else if (currentTab === "equipment") setCurrentTab("abilities");
    else if (currentTab === "abilities") setCurrentTab("basics");
  };
  
  // Calculate HP based on class and constitution
  const calculateHP = () => {
    const charClass = form.getValues("class");
    const conMod = Math.floor((form.getValues("constitution") - 10) / 2);
    let baseHP = 8; // Default
    
    // Set base HP by class
    if (charClass === "barbarian") baseHP = 12;
    else if (["fighter", "paladin", "ranger"].includes(charClass)) baseHP = 10;
    else if (["sorcerer", "wizard"].includes(charClass)) baseHP = 6;
    
    const calculatedHP = baseHP + conMod;
    form.setValue("maxHitPoints", calculatedHP > 1 ? calculatedHP : 1);
    form.setValue("currentHitPoints", calculatedHP > 1 ? calculatedHP : 1);
  };
  
  // Set saving throws based on class
  const setClassSavingThrows = () => {
    // Now with open text inputs for class, we'll set some default saving throws for new characters
    // For existing characters being edited, we'll keep their current saving throws
    if (!isEditMode) {
      // Default to Strength and Constitution as common saving throws
      setSavingThrows(["Strength", "Constitution"]);
    }
  };
  
  // Helper function to calculate ability modifier
  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };
  
  // Helper function to format modifier with + or - sign
  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="font-lora font-bold text-3xl text-primary mb-2">
            {isEditMode ? "Edit Your Character" : "Create Your Character"}
          </h1>
          <p className="text-secondary">
            {isEditMode 
              ? "Update your character's details" 
              : "Fill out the details to bring your character to life"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation('/dashboard')}
          className="mt-4 md:mt-0"
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full mb-6">
              <TabsTrigger value="basics" className="font-lora">
                <User className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Basics</span>
              </TabsTrigger>
              <TabsTrigger value="abilities" className="font-lora">
                <Dices className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Abilities</span>
              </TabsTrigger>
              <TabsTrigger value="equipment" className="font-lora">
                <Shield className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Equipment</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="font-lora">
                <Swords className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Features</span>
              </TabsTrigger>
              <TabsTrigger value="personality" className="font-lora">
                <Scroll className="h-4 w-4 mr-2 md:mr-2" />
                <span className="hidden md:inline">Personality</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Basics Tab */}
            <TabsContent value="basics">
              <Card className="border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="font-lora text-2xl">Character Basics</CardTitle>
                  <CardDescription>
                    Start by entering the basic information about your character.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter character name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="race"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter character race" {...field} />
                          </FormControl>
                          <FormDescription>
                            The race of your character (Human, Elf, Dwarf, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter character class" {...field} />
                          </FormControl>
                          <FormDescription>
                            The class of your character (Fighter, Wizard, Rogue, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="background"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter character background" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your character's background (Acolyte, Noble, Soldier, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="alignment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alignment</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter character alignment" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your character's moral and ethical outlook (Lawful Good, Chaotic Neutral, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value);
                                
                                // Update proficiency bonus based on level
                                const level = value || 1;
                                const profBonus = Math.ceil(level / 4) + 1;
                                form.setValue("proficiencyBonus", profBonus);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="proficiencyBonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proficiency Bonus</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setLocation('/dashboard')}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Abilities Tab */}
            <TabsContent value="abilities">
              <Card className="border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="font-lora text-2xl">Abilities & Stats</CardTitle>
                  <CardDescription>
                    Define your character's core abilities and stats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={rollAbilityScores}
                      className="mb-4"
                    >
                      <Dices className="mr-2 h-4 w-4" />
                      Roll Ability Scores
                    </Button>
                  </div>
                  
                  {/* Bônus de Proficiência, Inspiração e Percepção Passiva */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-[#FFF8E1] rounded-lg border border-[#8D6E63]">
                    <FormField
                      control={form.control}
                      name="proficiencyBonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bônus de Proficiência</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={6}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value || 0);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Bônus adicionado às proficiências do personagem
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormLabel>Inspiração</FormLabel>
                      <div className="flex items-center mt-2 space-x-2">
                        <Checkbox 
                          id="inspiration" 
                          checked={hasInspiration}
                          onCheckedChange={(checked) => {
                            setHasInspiration(checked === true);
                          }}
                        />
                        <label
                          htmlFor="inspiration"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Possui Inspiração
                        </label>
                      </div>
                      <FormDescription>
                        Use para obter vantagem em um teste
                      </FormDescription>
                    </div>
                    
                    <div>
                      <FormLabel>Sabedoria Passiva (Percepção)</FormLabel>
                      <div className="flex items-center mt-2">
                        <div className="text-2xl font-bold border border-input rounded-md p-2 w-16 text-center">
                          {10 + getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Perception") ? form.watch("proficiencyBonus") || 2 : 0)}
                        </div>
                      </div>
                      <FormDescription>
                        10 + mod. de Sabedoria + bônus (se proficiente)
                      </FormDescription>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Strength */}
                    <div className="bg-[#8D6E63] border-2 border-[#6D5046] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#6D5046] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("strength") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#FFF8E1]">
                          {formatModifier(getAbilityModifier(form.watch("strength") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#FFF8E1]">
                          FORÇA
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="strength"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormControl>
                              <Input
                                type="range"
                                min={3}
                                max={20}
                                className="w-full accent-primary"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value || 0);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Resistência de Força: usada para resistir efeitos físicos que exigem força bruta">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="strength-save-adv"
                              checked={skillsWithAdvantage.includes("StrengthSave")}
                              onCheckedChange={() => toggleAdvantage("StrengthSave")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("strength") || 10) + (savingThrows.includes("Strength") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Atletismo: usada para escalar, nadar, saltar ou outras atividades físicas que exigem força">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="athletics-adv"
                              checked={skillsWithAdvantage.includes("Athletics")}
                              onCheckedChange={() => toggleAdvantage("Athletics")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Atletismo</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("strength") || 10) + (skills.includes("Athletics") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                      
                    {/* Dexterity */}
                    <div className="bg-[#8D6E63] border-2 border-[#6D5046] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#6D5046] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("dexterity") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#FFF8E1]">
                          {formatModifier(getAbilityModifier(form.watch("dexterity") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#FFF8E1]">
                          DESTREZA
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="dexterity"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormControl>
                              <Input
                                type="range"
                                min={3}
                                max={20}
                                className="w-full accent-primary"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value || 0);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Resistência de Destreza: usada para esquivar de ataques de área e armadilhas">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="dexterity-save-adv"
                              checked={skillsWithAdvantage.includes("DexteritySave")}
                              onCheckedChange={() => toggleAdvantage("DexteritySave")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (savingThrows.includes("Dexterity") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Acrobacia: usada para fazer acrobacias, manter o equilíbrio ou se livrar de imobilizações">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="acrobatics-adv"
                              checked={skillsWithAdvantage.includes("Acrobatics")}
                              onCheckedChange={() => toggleAdvantage("Acrobatics")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Acrobacia</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (skills.includes("Acrobatics") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Furtividade: usada para se esconder, se mover silenciosamente ou evitar ser detectado">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="stealth-adv"
                              checked={skillsWithAdvantage.includes("Stealth")}
                              onCheckedChange={() => toggleAdvantage("Stealth")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Furtividade</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (skills.includes("Stealth") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Prestidigitação: usada para manipulações manuais delicadas como bater carteiras, truques de mãos ou desarmar armadilhas">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="sleight-of-hand-adv"
                              checked={skillsWithAdvantage.includes("SleightOfHand")}
                              onCheckedChange={() => toggleAdvantage("SleightOfHand")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Prestidigitação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (skills.includes("SleightOfHand") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Constitution */}
                    <div className="bg-[#8D6E63] border-2 border-[#6D5046] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#6D5046] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("constitution") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#FFF8E1]">
                          {formatModifier(getAbilityModifier(form.watch("constitution") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#FFF8E1]">
                          CONSTITUIÇÃO
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="constitution"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormControl>
                              <Input
                                type="range"
                                min={3}
                                max={20}
                                className="w-full accent-primary"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value || 0);
                                  // Recalculate HP when constitution changes
                                  setTimeout(calculateHP, 0);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Resistência de Constituição: usada para resistir a venenos, doenças e manter a concentração em magias quando sofre dano">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="constitution-save-adv"
                              checked={skillsWithAdvantage.includes("ConstitutionSave")}
                              onCheckedChange={() => toggleAdvantage("ConstitutionSave")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("constitution") || 10) + (savingThrows.includes("Constitution") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Intelligence */}
                    <div className="bg-[#8D6E63] border-2 border-[#6D5046] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#6D5046] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("intelligence") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#FFF8E1]">
                          {formatModifier(getAbilityModifier(form.watch("intelligence") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#FFF8E1]">
                          INTELIGÊNCIA
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="intelligence"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormControl>
                              <Input
                                type="range"
                                min={3}
                                max={20}
                                className="w-full accent-primary"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value || 0);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Resistência de Inteligência: usada para resistir a magias e efeitos que afetam a mente">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="intelligence-save-adv"
                              checked={skillsWithAdvantage.includes("IntelligenceSave")}
                              onCheckedChange={() => toggleAdvantage("IntelligenceSave")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (savingThrows.includes("Intelligence") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Arcana: usada para recordar conhecimento sobre magias, itens mágicos, símbolos arcanos e tradições místicas">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="arcana-adv"
                              checked={skillsWithAdvantage.includes("Arcana")}
                              onCheckedChange={() => toggleAdvantage("Arcana")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Arcana</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Arcana") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="História: usada para recordar conhecimento sobre eventos históricos, pessoas lendárias, reinos antigos, disputas passadas e guerras">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="history-adv"
                              checked={skillsWithAdvantage.includes("History")}
                              onCheckedChange={() => toggleAdvantage("History")}
                              className="border-[#FFF8E1]"
                            />
                            <span>História</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("History") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Investigação: usada para procurar pistas e fazer deduções baseadas nelas, como encontrar um item escondido ou determinar o ponto fraco de algo">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="investigation-adv"
                              checked={skillsWithAdvantage.includes("Investigation")}
                              onCheckedChange={() => toggleAdvantage("Investigation")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Investigação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Investigation") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Natureza: usada para recordar conhecimento sobre terrenos, plantas e animais, clima e ciclos naturais">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="nature-adv"
                              checked={skillsWithAdvantage.includes("Nature")}
                              onCheckedChange={() => toggleAdvantage("Nature")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Natureza</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Nature") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Religião: usada para recordar conhecimento sobre divindades, rituais, simbolismos religiosos, estruturas clericais, e o funcionamento de cultos">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="religion-adv"
                              checked={skillsWithAdvantage.includes("Religion")}
                              onCheckedChange={() => toggleAdvantage("Religion")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Religião</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Religion") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wisdom */}
                    <div className="bg-[#8D6E63] border-2 border-[#6D5046] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#6D5046] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("wisdom") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#FFF8E1]">
                          {formatModifier(getAbilityModifier(form.watch("wisdom") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#FFF8E1]">
                          SABEDORIA
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="wisdom"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormControl>
                              <Input
                                type="range"
                                min={3}
                                max={20}
                                className="w-full accent-primary"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value || 0);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Resistência de Sabedoria: usada para resistir a efeitos de encantamento e controle mental">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="wisdom-save-adv"
                              checked={skillsWithAdvantage.includes("WisdomSave")}
                              onCheckedChange={() => toggleAdvantage("WisdomSave")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (savingThrows.includes("Wisdom") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Adestrar Animais: usada para acalmar, treinar ou controlar animais">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="animal-handling-adv"
                              checked={skillsWithAdvantage.includes("AnimalHandling")}
                              onCheckedChange={() => toggleAdvantage("AnimalHandling")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Adestrar Animais</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("AnimalHandling") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Intuição: usada para determinar as intenções verdadeiras de uma criatura, detectar mentiras ou prever as ações de alguém">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="insight-adv"
                              checked={skillsWithAdvantage.includes("Insight")}
                              onCheckedChange={() => toggleAdvantage("Insight")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Intuição</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Insight") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Medicina: usada para estabilizar uma criatura que está morrendo ou diagnosticar uma doença">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="medicine-adv"
                              checked={skillsWithAdvantage.includes("Medicine")}
                              onCheckedChange={() => toggleAdvantage("Medicine")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Medicina</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Medicine") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Percepção: usada para observar seu entorno, detectar a presença de criaturas escondidas ou notar detalhes importantes">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perception-adv"
                              checked={skillsWithAdvantage.includes("Perception")}
                              onCheckedChange={() => toggleAdvantage("Perception")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Percepção</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Perception") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Sobrevivência: usada para rastrear, caçar, navegar por terrenos selvagens ou prever o clima">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="survival-adv"
                              checked={skillsWithAdvantage.includes("Survival")}
                              onCheckedChange={() => toggleAdvantage("Survival")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Sobrevivência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Survival") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Charisma */}
                    <div className="bg-[#8D6E63] border-2 border-[#6D5046] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#6D5046] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("charisma") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#FFF8E1]">
                          {formatModifier(getAbilityModifier(form.watch("charisma") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#FFF8E1]">
                          CARISMA
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="charisma"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormControl>
                              <Input
                                type="range"
                                min={3}
                                max={20}
                                className="w-full accent-primary"
                                {...field}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value || 0);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-1 mt-1 text-sm">
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Resistência de Carisma: usada para resistir a efeitos que afetam a personalidade ou tentam possuir você">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="charisma-save-adv"
                              checked={skillsWithAdvantage.includes("CharismaSave")}
                              onCheckedChange={() => toggleAdvantage("CharismaSave")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (savingThrows.includes("Charisma") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Atuação: usada para entreter um público com música, dança, atuação, histórias ou outro tipo de apresentação">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="performance-adv"
                              checked={skillsWithAdvantage.includes("Performance")}
                              onCheckedChange={() => toggleAdvantage("Performance")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Atuação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (skills.includes("Performance") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Enganação: usada para mentir convincentemente, disfarçar intenções, blefar ou manipular alguém">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="deception-adv"
                              checked={skillsWithAdvantage.includes("Deception")}
                              onCheckedChange={() => toggleAdvantage("Deception")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Enganação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (skills.includes("Deception") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Intimidação: usada para influenciar alguém através de ameaças, demonstrações de força ou violência">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="intimidation-adv"
                              checked={skillsWithAdvantage.includes("Intimidation")}
                              onCheckedChange={() => toggleAdvantage("Intimidation")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Intimidação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (skills.includes("Intimidation") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#6D5046] rounded px-2 py-1 text-[#FFF8E1]" title="Persuasão: usada para influenciar alguém através de argumentos lógicos, diplomacia, charme ou boa vontade">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="persuasion-adv"
                              checked={skillsWithAdvantage.includes("Persuasion")}
                              onCheckedChange={() => toggleAdvantage("Persuasion")}
                              className="border-[#FFF8E1]"
                            />
                            <span>Persuasão</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (skills.includes("Persuasion") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="armorClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Armor Class</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxHitPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Hit Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value || 0);
                                
                                // Update current HP if max changes
                                const currentHP = form.getValues("currentHitPoints");
                                if (value < currentHP) {
                                  form.setValue("currentHitPoints", value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currentHitPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Hit Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={form.getValues("maxHitPoints")}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const maxHP = form.getValues("maxHitPoints");
                                field.onChange(Math.min(value || 0, maxHP));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="speed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Speed</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(value || 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-lora text-lg font-semibold mb-2">Saving Throws</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"].map((save) => (
                          <Badge
                            key={save}
                            variant={savingThrows.includes(save) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleArrayItem(savingThrows, setSavingThrows, save)}
                          >
                            {savingThrows.includes(save) && (
                              <Check className="mr-1 h-3 w-3" />
                            )}
                            {save}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        These are automatically set based on your class, but you can customize them.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-lora text-lg font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception",
                          "History", "Insight", "Intimidation", "Investigation", "Medicine",
                          "Nature", "Perception", "Performance", "Persuasion", "Religion",
                          "Sleight of Hand", "Stealth", "Survival"
                        ].map((skill) => (
                          <Badge
                            key={skill}
                            variant={skills.includes(skill) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleArrayItem(skills, setSkills, skill)}
                          >
                            {skills.includes(skill) && (
                              <Check className="mr-1 h-3 w-3" />
                            )}
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select the skills your character is proficient in.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={goToPreviousTab}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Equipment Tab */}
            <TabsContent value="equipment">
              <Card className="border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="font-lora text-2xl">Equipment & Items</CardTitle>
                  <CardDescription>
                    Add weapons, armor, and other items to your character.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-lora text-lg font-semibold">Equipment List</h3>
                    
                    <div className="flex flex-col space-y-2">
                      {equipment.map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-1">
                          <span className="font-opensans text-sm">{item}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeItemFromArray(equipment, setEquipment, item)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Add Equipment</label>
                        <Input
                          id="new-equipment"
                          placeholder="e.g., Longsword: 1d8 slashing"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-equipment') as HTMLInputElement;
                          if (input) {
                            addItemToArray(equipment, setEquipment, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add Item
                      </Button>
                    </div>
                    
                    <h3 className="font-lora text-lg font-semibold mt-6">Common Equipment</h3>
                    
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="weapons">
                        <AccordionTrigger className="font-lora">Weapons</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              "Longsword: 1d8 slashing",
                              "Shortsword: 1d6 piercing",
                              "Longbow: 1d8 piercing",
                              "Dagger: 1d4 piercing",
                              "Greataxe: 1d12 slashing",
                              "Warhammer: 1d8 bludgeoning",
                              "Light Crossbow: 1d8 piercing",
                              "Quarterstaff: 1d6 bludgeoning"
                            ].map((weapon) => (
                              <Button
                                key={weapon}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(equipment, setEquipment, weapon)}
                              >
                                {weapon}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="armor">
                        <AccordionTrigger className="font-lora">Armor</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              "Leather Armor: AC 11",
                              "Chain Shirt: AC 13",
                              "Chain Mail: AC 16",
                              "Plate: AC 18",
                              "Shield: AC +2",
                              "Studded Leather: AC 12",
                              "Scale Mail: AC 14",
                              "Half Plate: AC 15"
                            ].map((armor) => (
                              <Button
                                key={armor}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(equipment, setEquipment, armor)}
                              >
                                {armor}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="adventuring-gear">
                        <AccordionTrigger className="font-lora">Adventuring Gear</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              "Backpack",
                              "Bedroll",
                              "Mess kit",
                              "Tinderbox",
                              "Torch (10)",
                              "Rations (10 days)",
                              "Waterskin",
                              "Rope, hempen (50 feet)",
                              "Healer's kit",
                              "Potion of healing",
                              "Spellbook",
                              "Component pouch",
                              "Holy symbol",
                              "Thieves' tools"
                            ].map((gear) => (
                              <Button
                                key={gear}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(equipment, setEquipment, gear)}
                              >
                                {gear}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={goToPreviousTab}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Features Tab */}
            <TabsContent value="features">
              <Card className="border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="font-lora text-2xl">Features & Spells</CardTitle>
                  <CardDescription>
                    Add class features, abilities, and spells your character knows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-lora text-lg font-semibold">Class Features</h3>
                    
                    <div className="flex flex-col space-y-2">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-1">
                          <span className="font-opensans text-sm">{feature}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeItemFromArray(features, setFeatures, feature)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Add Feature</label>
                        <Input
                          id="new-feature"
                          placeholder="e.g., Rage: Enter a rage as a bonus action"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-feature') as HTMLInputElement;
                          if (input) {
                            addItemToArray(features, setFeatures, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add Feature
                      </Button>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="font-lora text-lg font-semibold">Spells</h3>
                    
                    <div className="flex flex-col space-y-2">
                      {spells.map((spell, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-1">
                          <span className="font-opensans text-sm">{spell}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeItemFromArray(spells, setSpells, spell)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Add Spell</label>
                        <Input
                          id="new-spell"
                          placeholder="e.g., Fireball"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-spell') as HTMLInputElement;
                          if (input) {
                            addItemToArray(spells, setSpells, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add Spell
                      </Button>
                    </div>
                    
                    <h3 className="font-lora text-lg font-semibold mt-6">Common Class Features</h3>
                    
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="barbarian">
                        <AccordionTrigger className="font-lora">Barbarian</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              "Rage: Enter a rage as a bonus action",
                              "Unarmored Defense: AC = 10 + Dex mod + Con mod",
                              "Reckless Attack: Advantage on attacks, but attacks against you have advantage",
                              "Danger Sense: Advantage on Dex saves against effects you can see"
                            ].map((feature) => (
                              <Button
                                key={feature}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(features, setFeatures, feature)}
                              >
                                {feature}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="fighter">
                        <AccordionTrigger className="font-lora">Fighter</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              "Second Wind: Bonus action to regain 1d10 + level HP",
                              "Action Surge: Take an additional action on your turn",
                              "Improved Critical: Critical hit on 19-20",
                              "Fighting Style: Choose a fighting style"
                            ].map((feature) => (
                              <Button
                                key={feature}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(features, setFeatures, feature)}
                              >
                                {feature}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="wizard">
                        <AccordionTrigger className="font-lora">Wizard</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              "Arcane Recovery: Recover spell slots during a short rest",
                              "Spell Mastery: Cast 1st and 2nd level spells without spell slots",
                              "Arcane Tradition: Choose a wizard school specialization",
                              "Ritual Casting: Cast wizard spells as rituals"
                            ].map((feature) => (
                              <Button
                                key={feature}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(features, setFeatures, feature)}
                              >
                                {feature}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <h3 className="font-lora text-lg font-semibold mt-6">Common Spells</h3>
                    
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="cantrips">
                        <AccordionTrigger className="font-lora">Cantrips</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              "Fire Bolt",
                              "Mage Hand",
                              "Prestidigitation",
                              "Minor Illusion",
                              "Eldritch Blast",
                              "Sacred Flame",
                              "Guidance",
                              "Dancing Lights"
                            ].map((spell) => (
                              <Button
                                key={spell}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(spells, setSpells, spell)}
                              >
                                {spell}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="level-1">
                        <AccordionTrigger className="font-lora">Level 1 Spells</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              "Magic Missile",
                              "Shield",
                              "Cure Wounds",
                              "Detect Magic",
                              "Burning Hands",
                              "Charm Person",
                              "Sleep",
                              "Thunderwave"
                            ].map((spell) => (
                              <Button
                                key={spell}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(spells, setSpells, spell)}
                              >
                                {spell}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="level-2">
                        <AccordionTrigger className="font-lora">Level 2 Spells</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              "Misty Step",
                              "Scorching Ray",
                              "Invisibility",
                              "Hold Person",
                              "Spiritual Weapon",
                              "Lesser Restoration",
                              "Mirror Image",
                              "Darkness"
                            ].map((spell) => (
                              <Button
                                key={spell}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => addItemToArray(spells, setSpells, spell)}
                              >
                                {spell}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={goToPreviousTab}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Personality Tab */}
            <TabsContent value="personality">
              <Card className="border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="font-lora text-2xl">Personality & Backstory</CardTitle>
                  <CardDescription>
                    Flesh out your character's personality and story.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="traits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personality Traits</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your character's notable personality traits"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            How does your character act? What mannerisms do they have?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ideals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ideals</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What principles does your character believe in?"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            What drives your character? What principles do they hold dear?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bonds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonds</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What connections tie your character to the world?"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            What people, places, or things are important to your character?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="flaws"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flaws</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What weaknesses or vulnerabilities does your character have?"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            What imperfections make your character more interesting?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backstory & Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write additional details about your character's history and any other notes"
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Share your character's history, motivations, and any other important details.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={goToPreviousTab}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    className="magic-button"
                    disabled={isEditMode ? updateMutation.isPending : createMutation.isPending}
                  >
                    {isEditMode 
                      ? (updateMutation.isPending ? "Updating..." : "Update Character") 
                      : (createMutation.isPending ? "Creating..." : "Create Character")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
