import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCharacterSchema, InsertCharacter, Character } from "@shared/schema";
import { Edit2 } from "lucide-react";
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
import { 
  ArrowLeft, 
  ArrowRight, 
  Dices, 
  Shield, 
  Swords, 
  Scroll, 
  User, 
  HelpCircle, 
  Check, 
  Sword, 
  Trash, 
  PlusCircle 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

interface CharacterCreationProps {
  readOnly?: boolean;
  predefinedCharacter?: Character;
}

export default function CharacterCreation({ readOnly = false, predefinedCharacter }: CharacterCreationProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = useParams();
  const characterId = predefinedCharacter?.id || (params.id ? parseInt(params.id) : undefined);
  const isEditMode = !!characterId;
  const [currentTab, setCurrentTab] = useState("basics");
  const [savingThrows, setSavingThrows] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillsWithAdvantage, setSkillsWithAdvantage] = useState<string[]>([]);
  // Definição dos tipos para o novo sistema de equipamentos
  type Weapon = {
    id: string;
    name: string;
    properties: string[];
    range: string;
    attackBonus: string;
    damage: string;
    damageTypes: string[];
    ammunition: string;
  };

  type Armor = {
    id: string;
    name: string;
    weight: string;
    type: string;
    acBonus: string;
    hasPenalty: boolean;
    properties: string[];
  };

  type OtherEquipment = {
    notes: string;
    copper: number;
    silver: number;
    electrum: number;
    gold: number;
    platinum: number;
  };

  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [armors, setArmors] = useState<Armor[]>([]);
  const [otherEquipment, setOtherEquipment] = useState<OtherEquipment>({
    notes: '',
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 0,
    platinum: 0
  });
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
    // Converter o novo formato de equipamentos para o formato string[] antes de salvar
    const equipmentStringArray = convertEquipmentToStringArray();
    
    // Create a new object with the form data and the current array values
    const formDataWithArrays: CharacterFormValues = {
      ...data,
      savingThrows,
      skills,
      equipment: equipmentStringArray, // Usa o formato convertido
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
  
  // Helper functions para gerenciar armas, armaduras e equipamentos
  const addWeapon = (newWeapon: Omit<Weapon, 'id'>) => {
    const id = crypto.randomUUID();
    setWeapons([...weapons, { ...newWeapon, id }]);
  };

  const updateWeapon = (id: string, updatedWeapon: Partial<Weapon>) => {
    setWeapons(weapons.map(weapon => 
      weapon.id === id ? { ...weapon, ...updatedWeapon } : weapon
    ));
  };

  const removeWeapon = (id: string) => {
    setWeapons(weapons.filter(weapon => weapon.id !== id));
  };

  const addArmor = (newArmor: Omit<Armor, 'id'>) => {
    const id = crypto.randomUUID();
    setArmors([...armors, { ...newArmor, id }]);
  };

  const updateArmor = (id: string, updatedArmor: Partial<Armor>) => {
    setArmors(armors.map(armor => 
      armor.id === id ? { ...armor, ...updatedArmor } : armor
    ));
  };

  const removeArmor = (id: string) => {
    setArmors(armors.filter(armor => armor.id !== id));
  };

  const updateOtherEquipment = (updatedEquipment: Partial<OtherEquipment>) => {
    setOtherEquipment({ ...otherEquipment, ...updatedEquipment });
  };

  // Converter entre o novo formato de equipamento e o formato antigo (array de strings)
  const convertEquipmentToStringArray = (): string[] => {
    let equipmentArray: string[] = [];
    
    // Adiciona armas ao array
    weapons.forEach(weapon => {
      const weaponStr = `Arma: ${weapon.name} | Acerto: ${weapon.attackBonus} | Dano: ${weapon.damage} ${weapon.damageTypes.join('/')} | Alcance: ${weapon.range}`;
      equipmentArray.push(weaponStr);
    });
    
    // Adiciona armaduras ao array
    armors.forEach(armor => {
      const armorStr = `Armadura: ${armor.name} | Tipo: ${armor.type} | CA: ${armor.acBonus} | Peso: ${armor.weight}`;
      equipmentArray.push(armorStr);
    });
    
    // Adiciona equipamento geral e moedas
    if (otherEquipment.notes.trim()) {
      equipmentArray.push(`Equipamento: ${otherEquipment.notes}`);
    }
    
    const coins = [
      `PC: ${otherEquipment.copper}`,
      `PP: ${otherEquipment.silver}`,
      `PE: ${otherEquipment.electrum}`,
      `PO: ${otherEquipment.gold}`,
      `PL: ${otherEquipment.platinum}`
    ].join(', ');
    
    equipmentArray.push(`Moedas: ${coins}`);
    
    return equipmentArray;
  };

  // Load character data when in edit mode
  useEffect(() => {
    if (characterData) {
      // Set form values from character data
      const characterLevel = characterData.level || 1;
      
      // Calculate the correct proficiency bonus based on the character's level
      const calculatedProfBonus = calculateProficiencyBonus(characterLevel);
      
      form.reset({
        name: characterData.name || "",
        race: characterData.race || "",
        class: characterData.class || "",
        level: characterLevel,
        background: characterData.background || "",
        alignment: characterData.alignment || "",
        experience: characterData.experience || 0,
        proficiencyBonus: calculatedProfBonus, // Usando o bônus calculado baseado no nível
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
      
      // Tentar extrair informações de equipamento do formato atual string[]
      try {
        // Analisar strings de equipment para extrair armas, armaduras e outros itens
        // Este é um processo imperfeito, mas faz o melhor possível para migrar dados existentes
        const weaponsFromEquipment = characterData.equipment?.filter(e => e.startsWith('Arma:')) || [];
        const armorsFromEquipment = characterData.equipment?.filter(e => e.startsWith('Armadura:')) || [];
        const otherEquipmentFromEquipment = characterData.equipment?.filter(e => e.startsWith('Equipamento:')) || [];
        const coinsFromEquipment = characterData.equipment?.find(e => e.startsWith('Moedas:')) || '';
        
        // Inicializa equipamentos com dados existentes ou padrões
        setOtherEquipment({
          notes: otherEquipmentFromEquipment.length > 0 ? 
                 otherEquipmentFromEquipment.map(e => e.replace('Equipamento:', '').trim()).join('\n') : 
                 '',
          copper: 0,
          silver: 0,
          electrum: 0,
          gold: 0,
          platinum: 0
        });
      } catch (error) {
        console.error("Erro ao converter equipamento:", error);
      }
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
  // Função para calcular o bônus de proficiência baseado no nível do personagem
  const calculateProficiencyBonus = (level: number): number => {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    if (level >= 5) return 3;
    return 2; // Níveis 1-4
  };
  
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
            {readOnly 
              ? `${predefinedCharacter?.name || form.getValues().name || "Character"}`
              : isEditMode 
                ? "Edit Your Character" 
                : "Create Your Character"}
          </h1>
          <p className="text-secondary">
            {readOnly
              ? `${predefinedCharacter?.race || form.getValues().race || ""} ${predefinedCharacter?.class || form.getValues().class || ""} • Level ${predefinedCharacter?.level || form.getValues().level || 1}`
              : isEditMode 
                ? "Update your character's details" 
                : "Fill out the details to bring your character to life"}
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard')}
          >
            Back to Dashboard
          </Button>
          {readOnly && (
            <Link href={`/character-creation/${predefinedCharacter?.id || characterId}`}>
              <Button variant="outline">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Character
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <Form {...form}>
        <form 
          onSubmit={readOnly ? (e) => e.preventDefault() : form.handleSubmit(onSubmit)}
          className={`${readOnly ? "read-only-form" : ""}`}
        >
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
                          <Input 
                            placeholder="Enter character name" 
                            {...field} 
                            disabled={readOnly}
                            className={readOnly ? "opacity-100 cursor-default" : ""}
                          />
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                const profBonus = calculateProficiencyBonus(level);
                                form.setValue("proficiencyBonus", profBonus);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Determina o bônus de proficiência e progressão do personagem
                          </FormDescription>
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
                          <FormDescription>
                            Pontos de experiência acumulados pelo personagem
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {!readOnly && (
                    <>
                      <Button variant="outline" type="button" onClick={() => setLocation('/dashboard')}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={goToNextTab}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {readOnly && (
                    <Button variant="outline" type="button" onClick={() => setLocation('/dashboard')} className="ml-auto">
                      Back to Dashboard
                    </Button>
                  )}
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
                      disabled={readOnly}
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
                              disabled={readOnly}
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
                          disabled={readOnly}
                          onCheckedChange={readOnly ? undefined : (checked) => {
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
                  
                  {/* Saving Throws */}
                  <div className="mb-6 p-4 bg-[#FFF8E1] rounded-lg border border-[#8D6E63]">
                    <h3 className="font-lora text-lg font-semibold mb-2">Saving Throws</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"].map((save) => (
                        <Badge
                          key={save}
                          variant={savingThrows.includes(save) ? "default" : "outline"}
                          className={readOnly ? "" : "cursor-pointer"}
                          onClick={readOnly ? undefined : () => toggleArrayItem(savingThrows, setSavingThrows, save)}
                        >
                          {savingThrows.includes(save) && (
                            <Check className="mr-1 h-3 w-3" />
                          )}
                          {save}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Strength */}
                    <div className="bg-[#FFF8E1] border border-[#8D6E63] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#7B1FA2] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("strength") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#2C1810]">
                          {formatModifier(getAbilityModifier(form.watch("strength") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#2C1810]">
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
                                disabled={readOnly}
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
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Resistência de Força: usada para resistir efeitos físicos que exigem força bruta">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="strength-save-adv"
                              checked={skillsWithAdvantage.includes("StrengthSave")}
                              disabled={readOnly}
                              onCheckedChange={readOnly ? undefined : () => toggleAdvantage("StrengthSave")}
                              className="border-[#2C1810]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("strength") || 10) + (savingThrows.includes("Strength") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Atletismo: usada para escalar, nadar, saltar ou outras atividades físicas que exigem força">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="athletics-prof"
                              checked={skills.includes("Athletics")}
                              disabled={readOnly}
                              onCheckedChange={readOnly ? undefined : () => toggleArrayItem(skills, setSkills, "Athletics")}
                              className="border-[#2C1810]"
                            />
                            <span>Atletismo</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("strength") || 10) + (skills.includes("Athletics") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                      
                    {/* Dexterity */}
                    <div className="bg-[#FFF8E1] border border-[#8D6E63] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#7B1FA2] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("dexterity") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#2C1810]">
                          {formatModifier(getAbilityModifier(form.watch("dexterity") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#2C1810]">
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
                                disabled={readOnly}
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
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Resistência de Destreza: usada para esquivar de ataques de área e armadilhas">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="dexterity-save-adv"
                              checked={skillsWithAdvantage.includes("DexteritySave")}
                              onCheckedChange={() => toggleAdvantage("DexteritySave")}
                              className="border-[#2C1810]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (savingThrows.includes("Dexterity") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Acrobacia: usada para fazer acrobacias, manter o equilíbrio ou se livrar de imobilizações">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="acrobatics-prof"
                              checked={skills.includes("Acrobatics")}
                              disabled={readOnly}
                              onCheckedChange={readOnly ? undefined : () => toggleArrayItem(skills, setSkills, "Acrobatics")}
                              className="border-[#2C1810]"
                            />
                            <span>Acrobacia</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (skills.includes("Acrobatics") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Furtividade: usada para se esconder, se mover silenciosamente ou evitar ser detectado">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="stealth-prof"
                              checked={skills.includes("Stealth")}
                              disabled={readOnly}
                              onCheckedChange={readOnly ? undefined : () => toggleArrayItem(skills, setSkills, "Stealth")}
                              className="border-[#2C1810]"
                            />
                            <span>Furtividade</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (skills.includes("Stealth") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Prestidigitação: usada para manipulações manuais delicadas como bater carteiras, truques de mãos ou desarmar armadilhas">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="sleight-of-hand-prof"
                              checked={skills.includes("SleightOfHand")}
                              disabled={readOnly}
                              onCheckedChange={readOnly ? undefined : () => toggleArrayItem(skills, setSkills, "SleightOfHand")}
                              className="border-[#2C1810]"
                            />
                            <span>Prestidigitação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("dexterity") || 10) + (skills.includes("SleightOfHand") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Constitution */}
                    <div className="bg-[#FFF8E1] border border-[#8D6E63] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#7B1FA2] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("constitution") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#2C1810]">
                          {formatModifier(getAbilityModifier(form.watch("constitution") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#2C1810]">
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
                                disabled={readOnly}
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
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Resistência de Constituição: usada para resistir a venenos, doenças e manter a concentração em magias quando sofre dano">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="constitution-save-adv"
                              checked={skillsWithAdvantage.includes("ConstitutionSave")}
                              onCheckedChange={() => toggleAdvantage("ConstitutionSave")}
                              className="border-[#2C1810]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("constitution") || 10) + (savingThrows.includes("Constitution") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Intelligence */}
                    <div className="bg-[#FFF8E1] border border-[#8D6E63] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#7B1FA2] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("intelligence") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#2C1810]">
                          {formatModifier(getAbilityModifier(form.watch("intelligence") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#2C1810]">
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
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Resistência de Inteligência: usada para resistir a magias e efeitos que afetam a mente">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="intelligence-save-adv"
                              checked={skillsWithAdvantage.includes("IntelligenceSave")}
                              onCheckedChange={() => toggleAdvantage("IntelligenceSave")}
                              className="border-[#2C1810]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (savingThrows.includes("Intelligence") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Arcana: usada para recordar conhecimento sobre magias, itens mágicos, símbolos arcanos e tradições místicas">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="arcana-prof"
                              checked={skills.includes("Arcana")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Arcana")}
                              className="border-[#2C1810]"
                            />
                            <span>Arcana</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Arcana") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="História: usada para recordar conhecimento sobre eventos históricos, pessoas lendárias, reinos antigos, disputas passadas e guerras">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="history-prof"
                              checked={skills.includes("History")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "History")}
                              className="border-[#2C1810]"
                            />
                            <span>História</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("History") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Investigação: usada para procurar pistas e fazer deduções baseadas nelas, como encontrar um item escondido ou determinar o ponto fraco de algo">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="investigation-prof"
                              checked={skills.includes("Investigation")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Investigation")}
                              className="border-[#2C1810]"
                            />
                            <span>Investigação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Investigation") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Natureza: usada para recordar conhecimento sobre terrenos, plantas e animais, clima e ciclos naturais">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="nature-prof"
                              checked={skills.includes("Nature")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Nature")}
                              className="border-[#2C1810]"
                            />
                            <span>Natureza</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Nature") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Religião: usada para recordar conhecimento sobre divindades, rituais, simbolismos religiosos, estruturas clericais, e o funcionamento de cultos">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="religion-prof"
                              checked={skills.includes("Religion")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Religion")}
                              className="border-[#2C1810]"
                            />
                            <span>Religião</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("intelligence") || 10) + (skills.includes("Religion") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wisdom */}
                    <div className="bg-[#FFF8E1] border border-[#8D6E63] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#7B1FA2] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("wisdom") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#2C1810]">
                          {formatModifier(getAbilityModifier(form.watch("wisdom") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#2C1810]">
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
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Resistência de Sabedoria: usada para resistir a efeitos de encantamento e controle mental">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="wisdom-save-adv"
                              checked={skillsWithAdvantage.includes("WisdomSave")}
                              onCheckedChange={() => toggleAdvantage("WisdomSave")}
                              className="border-[#2C1810]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (savingThrows.includes("Wisdom") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Adestrar Animais: usada para acalmar, treinar ou controlar animais">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="animal-handling-prof"
                              checked={skills.includes("AnimalHandling")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "AnimalHandling")}
                              className="border-[#2C1810]"
                            />
                            <span>Adestrar Animais</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("AnimalHandling") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Intuição: usada para determinar as intenções verdadeiras de uma criatura, detectar mentiras ou prever as ações de alguém">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="insight-prof"
                              checked={skills.includes("Insight")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Insight")}
                              className="border-[#2C1810]"
                            />
                            <span>Intuição</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Insight") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Medicina: usada para estabilizar uma criatura que está morrendo ou diagnosticar uma doença">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="medicine-prof"
                              checked={skills.includes("Medicine")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Medicine")}
                              className="border-[#2C1810]"
                            />
                            <span>Medicina</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Medicine") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Percepção: usada para observar seu entorno, detectar a presença de criaturas escondidas ou notar detalhes importantes">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="perception-prof"
                              checked={skills.includes("Perception")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Perception")}
                              className="border-[#2C1810]"
                            />
                            <span>Percepção</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Perception") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Sobrevivência: usada para rastrear, caçar, navegar por terrenos selvagens ou prever o clima">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="survival-prof"
                              checked={skills.includes("Survival")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Survival")}
                              className="border-[#2C1810]"
                            />
                            <span>Sobrevivência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("wisdom") || 10) + (skills.includes("Survival") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Charisma */}
                    <div className="bg-[#FFF8E1] border border-[#8D6E63] rounded-lg p-4 pb-2 relative shadow-lg">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                        <div className="bg-[#7B1FA2] text-center px-2 py-1 rounded-md text-xs font-semibold text-[#FFF8E1]">
                          {form.watch("charisma") || 10}
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="text-4xl font-bold mb-1 text-[#2C1810]">
                          {formatModifier(getAbilityModifier(form.watch("charisma") || 10))}
                        </div>
                        <div className="uppercase text-xs font-semibold tracking-wider mb-3 text-[#2C1810]">
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
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Resistência de Carisma: usada para resistir a efeitos que afetam a personalidade ou tentam possuir você">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="charisma-save-adv"
                              checked={skillsWithAdvantage.includes("CharismaSave")}
                              onCheckedChange={() => toggleAdvantage("CharismaSave")}
                              className="border-[#2C1810]"
                            />
                            <span>Resistência</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (savingThrows.includes("Charisma") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Atuação: usada para entreter um público com música, dança, atuação, histórias ou outro tipo de apresentação">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="performance-prof"
                              checked={skills.includes("Performance")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Performance")}
                              className="border-[#2C1810]"
                            />
                            <span>Atuação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (skills.includes("Performance") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Enganação: usada para mentir convincentemente, disfarçar intenções, blefar ou manipular alguém">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="deception-prof"
                              checked={skills.includes("Deception")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Deception")}
                              className="border-[#2C1810]"
                            />
                            <span>Enganação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (skills.includes("Deception") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Intimidação: usada para influenciar alguém através de ameaças, demonstrações de força ou violência">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="intimidation-prof"
                              checked={skills.includes("Intimidation")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Intimidation")}
                              className="border-[#2C1810]"
                            />
                            <span>Intimidação</span>
                          </div>
                          <span>{formatModifier(getAbilityModifier(form.watch("charisma") || 10) + (skills.includes("Intimidation") ? form.watch("proficiencyBonus") || 2 : 0))}</span>
                        </div>
                        <div className="flex items-center justify-between flex items-center justify-between py-1 text-[#2C1810]" title="Persuasão: usada para influenciar alguém através de argumentos lógicos, diplomacia, charme ou boa vontade">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="persuasion-prof"
                              checked={skills.includes("Persuasion")}
                              onCheckedChange={() => toggleArrayItem(skills, setSkills, "Persuasion")}
                              className="border-[#2C1810]"
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
                <CardContent className="space-y-8">
                  {/* Área de Armas */}
                  <div className="space-y-4">
                    <h3 className="font-lora text-xl font-semibold text-primary">Armas</h3>
                    
                    {/* Lista de Armas */}
                    <div className="flex flex-col space-y-2">
                      {weapons.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-[180px]">Nome</TableHead>
                                <TableHead>Propriedades</TableHead>
                                <TableHead className="w-[100px]">Alcance</TableHead>
                                <TableHead className="w-[80px]">Acerto</TableHead>
                                <TableHead className="w-[120px]">Dano / Tipo</TableHead>
                                <TableHead className="w-[100px]">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {weapons.map((weapon) => (
                                <TableRow key={weapon.id}>
                                  <TableCell className="font-medium">{weapon.name}</TableCell>
                                  <TableCell>{weapon.properties.join(", ")}</TableCell>
                                  <TableCell>{weapon.range}</TableCell>
                                  <TableCell>{weapon.attackBonus}</TableCell>
                                  <TableCell>{`${weapon.damage} ${weapon.damageTypes.join("/")}`} {weapon.ammunition ? `(${weapon.ammunition})` : ''}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => setWeapons(weapons.filter(w => w.id !== weapon.id))}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                          <div className="flex flex-col items-center space-y-2 text-center">
                            <Sword className="h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Nenhuma arma adicionada</h3>
                            <p className="text-sm text-muted-foreground">
                              Adicione armas usando o formulário abaixo
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Formulário para adicionar arma */}
                    <Collapsible className="w-full border rounded-md p-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between mb-2">
                          <span>Adicionar Nova Arma</span>
                          <PlusCircle className="h-4 w-4 ml-2" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nome da Arma</label>
                            <Input 
                              id="weapon-name" 
                              placeholder="ex: Espada Longa" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Propriedades</label>
                            <div className="flex flex-wrap gap-2">
                              {["Acuidade", "Duas Mãos", "Leve", "Pesada", "Alcance", "Arremesso", "Munição", "Recarga", "Especial", "Versátil"].map((prop) => (
                                <Badge 
                                  key={prop} 
                                  variant="outline" 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    target.classList.toggle("bg-primary");
                                    target.classList.toggle("text-primary-foreground");
                                  }}
                                >
                                  {prop}
                                </Badge>
                              ))}
                              <div className="w-full mt-2">
                                <label className="text-xs text-muted-foreground">Outra propriedade:</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Input 
                                    id="custom-weapon-property" 
                                    placeholder="Digite propriedade personalizada" 
                                    className="h-8"
                                  />
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const input = document.getElementById('custom-weapon-property') as HTMLInputElement;
                                      if (input && input.value.trim()) {
                                        // Criar um Badge temporário e adicioná-lo à página
                                        const container = document.querySelector('.flex.flex-wrap.gap-2');
                                        if (container) {
                                          const badge = document.createElement('span');
                                          badge.className = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer bg-primary text-primary-foreground';
                                          badge.textContent = input.value.trim();
                                          badge.onclick = (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.classList.contains('bg-primary')) {
                                              target.classList.remove('bg-primary');
                                              target.classList.remove('text-primary-foreground');
                                            } else {
                                              target.classList.add('bg-primary');
                                              target.classList.add('text-primary-foreground');
                                            }
                                          };
                                          container.insertBefore(badge, document.getElementById('custom-weapon-property')?.parentElement?.parentElement);
                                          input.value = '';
                                        }
                                      }
                                    }}
                                  >
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Alcance</label>
                            <Input 
                              id="weapon-range" 
                              placeholder="ex: 1,5m ou 25/100"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Bônus de Acerto</label>
                            <Input 
                              id="weapon-attack-bonus" 
                              placeholder="+5" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Dano</label>
                            <Input 
                              id="weapon-damage" 
                              placeholder="ex: 1d8+3" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo de Dano</label>
                            <div className="flex flex-wrap gap-2">
                              {["Cortante", "Perfurante", "Concussão", "Ácido", "Frio", "Fogo", "Elétrico", "Necrótico", "Venenoso", "Psíquico", "Radiante", "Trovão"].map((type) => (
                                <Badge 
                                  key={type} 
                                  variant="outline" 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    target.classList.toggle("bg-primary");
                                    target.classList.toggle("text-primary-foreground");
                                  }}
                                >
                                  {type}
                                </Badge>
                              ))}
                              <div className="w-full mt-2">
                                <label className="text-xs text-muted-foreground">Outro tipo de dano:</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Input 
                                    id="custom-damage-type" 
                                    placeholder="Digite tipo personalizado" 
                                    className="h-8"
                                  />
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const input = document.getElementById('custom-damage-type') as HTMLInputElement;
                                      if (input && input.value.trim()) {
                                        // Criar um Badge temporário e adicioná-lo à página
                                        const container = document.querySelector('.flex.flex-wrap.gap-2:nth-of-type(2)');
                                        if (container) {
                                          const badge = document.createElement('span');
                                          badge.className = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer bg-primary text-primary-foreground';
                                          badge.textContent = input.value.trim();
                                          badge.onclick = (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.classList.contains('bg-primary')) {
                                              target.classList.remove('bg-primary');
                                              target.classList.remove('text-primary-foreground');
                                            } else {
                                              target.classList.add('bg-primary');
                                              target.classList.add('text-primary-foreground');
                                            }
                                          };
                                          container.insertBefore(badge, document.getElementById('custom-damage-type')?.parentElement?.parentElement);
                                          input.value = '';
                                        }
                                      }
                                    }}
                                  >
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Munição</label>
                            <Input 
                              id="weapon-ammo" 
                              placeholder="ex: 20 flechas" 
                            />
                          </div>
                          
                          <div className="col-span-full flex justify-end mt-4">
                            <Button
                              onClick={() => {
                                // Obter valores dos inputs
                                const nameInput = document.getElementById('weapon-name') as HTMLInputElement;
                                const rangeInput = document.getElementById('weapon-range') as HTMLInputElement;
                                const attackInput = document.getElementById('weapon-attack-bonus') as HTMLInputElement;
                                const damageInput = document.getElementById('weapon-damage') as HTMLInputElement;
                                const ammoInput = document.getElementById('weapon-ammo') as HTMLInputElement;
                                
                                // Obter propriedades e tipos selecionados
                                const selectedProps: string[] = [];
                                const selectedTypes: string[] = [];
                                
                                document.querySelectorAll('.bg-primary').forEach(el => {
                                  if ((el as HTMLElement).innerText) {
                                    // Verificar se é propriedade ou tipo de dano
                                    const text = (el as HTMLElement).innerText;
                                    if (["Acuidade", "Duas Mãos", "Leve", "Pesada", "Alcance", "Arremesso", "Munição", "Recarga", "Especial", "Versátil"].includes(text)) {
                                      selectedProps.push(text);
                                    } else {
                                      selectedTypes.push(text);
                                    }
                                  }
                                });
                                
                                // Criar nova arma
                                if (nameInput.value) {
                                  const newWeapon: Weapon = {
                                    id: Date.now().toString(),
                                    name: nameInput.value,
                                    properties: selectedProps,
                                    range: rangeInput.value || '-',
                                    attackBonus: attackInput.value || '-',
                                    damage: damageInput.value || '-',
                                    damageTypes: selectedTypes.length > 0 ? selectedTypes : ['N/A'],
                                    ammunition: ammoInput.value || ''
                                  };
                                  
                                  setWeapons([...weapons, newWeapon]);
                                  
                                  // Limpar campos
                                  nameInput.value = '';
                                  rangeInput.value = '';
                                  attackInput.value = '';
                                  damageInput.value = '';
                                  ammoInput.value = '';
                                  document.querySelectorAll('.bg-primary').forEach(el => {
                                    el.classList.remove('bg-primary');
                                    el.classList.remove('text-primary-foreground');
                                  });
                                } else {
                                  toast({
                                    title: "Nome obrigatório",
                                    description: "Você deve informar um nome para a arma",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              Adicionar Arma
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  
                  {/* Separador entre seções */}
                  <Separator className="my-4" />
                  
                  {/* Área de Armaduras */}
                  <div className="space-y-4">
                    <h3 className="font-lora text-xl font-semibold text-primary">Armaduras</h3>
                    
                    {/* Lista de Armaduras */}
                    <div className="flex flex-col space-y-2">
                      {armors.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-[180px]">Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="w-[100px]">Peso</TableHead>
                                <TableHead className="w-[100px]">Bônus CA</TableHead>
                                <TableHead className="w-[100px]">Penalidade</TableHead>
                                <TableHead className="w-[200px]">Propriedades</TableHead>
                                <TableHead className="w-[80px]">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {armors.map((armor) => (
                                <TableRow key={armor.id}>
                                  <TableCell className="font-medium">{armor.name}</TableCell>
                                  <TableCell>{armor.type}</TableCell>
                                  <TableCell>{armor.weight}</TableCell>
                                  <TableCell>{armor.acBonus}</TableCell>
                                  <TableCell>{armor.hasPenalty ? "Sim" : "Não"}</TableCell>
                                  <TableCell>{armor.properties.join(", ")}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => setArmors(armors.filter(a => a.id !== armor.id))}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                          <div className="flex flex-col items-center space-y-2 text-center">
                            <Shield className="h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Nenhuma armadura adicionada</h3>
                            <p className="text-sm text-muted-foreground">
                              Adicione armaduras usando o formulário abaixo
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Formulário para adicionar armadura */}
                    <Collapsible className="w-full border rounded-md p-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between mb-2">
                          <span>Adicionar Nova Armadura</span>
                          <PlusCircle className="h-4 w-4 ml-2" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nome da Armadura</label>
                            <Input 
                              id="armor-name" 
                              placeholder="ex: Cota de Malha" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Peso</label>
                            <Input 
                              id="armor-weight" 
                              placeholder="ex: 20 kg" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <Select id="armor-type">
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="light">Armadura Leve</SelectItem>
                                <SelectItem value="medium">Armadura Média</SelectItem>
                                <SelectItem value="heavy">Armadura Pesada</SelectItem>
                                <SelectItem value="shield">Escudo</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Bônus de Classe de Armadura</label>
                            <Input 
                              id="armor-ac-bonus" 
                              placeholder="ex: +2" 
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox id="armor-penalty" />
                            <label
                              htmlFor="armor-penalty"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Possui Penalidade
                            </label>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Propriedades</label>
                            <div className="flex flex-wrap gap-2">
                              {["Furtividade Desvantagem", "Força Mínima", "Resistente", "Flexível", "Metálica", "Reforçada", "Mágica"].map((prop) => (
                                <Badge 
                                  key={prop} 
                                  variant="outline" 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    target.classList.toggle("bg-primary");
                                    target.classList.toggle("text-primary-foreground");
                                  }}
                                >
                                  {prop}
                                </Badge>
                              ))}
                              <div className="w-full mt-2">
                                <label className="text-xs text-muted-foreground">Outra propriedade:</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Input 
                                    id="custom-armor-property" 
                                    placeholder="Digite propriedade personalizada" 
                                    className="h-8"
                                  />
                                  <Button 
                                    type="button" 
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const input = document.getElementById('custom-armor-property') as HTMLInputElement;
                                      if (input && input.value.trim()) {
                                        // Criar um Badge temporário e adicioná-lo à página
                                        const container = document.querySelector('.flex.flex-wrap.gap-2:nth-of-type(3)');
                                        if (container) {
                                          const badge = document.createElement('span');
                                          badge.className = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer bg-primary text-primary-foreground';
                                          badge.textContent = input.value.trim();
                                          badge.onclick = (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.classList.contains('bg-primary')) {
                                              target.classList.remove('bg-primary');
                                              target.classList.remove('text-primary-foreground');
                                            } else {
                                              target.classList.add('bg-primary');
                                              target.classList.add('text-primary-foreground');
                                            }
                                          };
                                          container.insertBefore(badge, document.getElementById('custom-armor-property')?.parentElement?.parentElement);
                                          input.value = '';
                                        }
                                      }
                                    }}
                                  >
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-full flex justify-end mt-4">
                            <Button
                              onClick={() => {
                                // Obter valores dos inputs
                                const nameInput = document.getElementById('armor-name') as HTMLInputElement;
                                const weightInput = document.getElementById('armor-weight') as HTMLInputElement;
                                const typeSelect = document.getElementById('armor-type') as HTMLSelectElement;
                                const acBonusInput = document.getElementById('armor-ac-bonus') as HTMLInputElement;
                                const penaltyCheckbox = document.getElementById('armor-penalty') as HTMLInputElement;
                                
                                // Obter propriedades selecionadas
                                const selectedProps: string[] = [];
                                document.querySelectorAll('.bg-primary').forEach(el => {
                                  if ((el as HTMLElement).innerText) {
                                    selectedProps.push((el as HTMLElement).innerText);
                                  }
                                });
                                
                                // Criar nova armadura
                                if (nameInput.value) {
                                  let armorType = "Desconhecido";
                                  if (typeSelect.value === "light") armorType = "Armadura Leve";
                                  else if (typeSelect.value === "medium") armorType = "Armadura Média";
                                  else if (typeSelect.value === "heavy") armorType = "Armadura Pesada";
                                  else if (typeSelect.value === "shield") armorType = "Escudo";
                                  else if (typeSelect.value === "other") armorType = "Outro";
                                  
                                  const newArmor: Armor = {
                                    id: Date.now().toString(),
                                    name: nameInput.value,
                                    weight: weightInput.value || '-',
                                    type: armorType,
                                    acBonus: acBonusInput.value || '-',
                                    hasPenalty: penaltyCheckbox.checked,
                                    properties: selectedProps
                                  };
                                  
                                  setArmors([...armors, newArmor]);
                                  
                                  // Limpar campos
                                  nameInput.value = '';
                                  weightInput.value = '';
                                  typeSelect.value = '';
                                  acBonusInput.value = '';
                                  penaltyCheckbox.checked = false;
                                  document.querySelectorAll('.bg-primary').forEach(el => {
                                    el.classList.remove('bg-primary');
                                    el.classList.remove('text-primary-foreground');
                                  });
                                } else {
                                  toast({
                                    title: "Nome obrigatório",
                                    description: "Você deve informar um nome para a armadura",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              Adicionar Armadura
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  
                  {/* Separador entre seções */}
                  <Separator className="my-4" />
                  
                  {/* Área de Outros Equipamentos & Moedas */}
                  <div className="space-y-4">
                    <h3 className="font-lora text-xl font-semibold text-primary">Outros Equipamentos & Moedas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Equipamentos Diversos</label>
                        <Textarea 
                          id="other-equipment-notes" 
                          placeholder="Anote seus equipamentos gerais aqui..." 
                          className="min-h-[200px]"
                          value={otherEquipment.notes}
                          onChange={(e) => setOtherEquipment({...otherEquipment, notes: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-lora text-lg font-semibold">Moedas</h4>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium">
                              <div className="mr-2 h-4 w-4 rounded-full bg-amber-300"></div>
                              Peças de Ouro (PO)
                            </label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={otherEquipment.gold}
                              onChange={(e) => setOtherEquipment({...otherEquipment, gold: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium">
                              <div className="mr-2 h-4 w-4 rounded-full bg-zinc-300"></div>
                              Peças de Prata (PP)
                            </label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={otherEquipment.silver}
                              onChange={(e) => setOtherEquipment({...otherEquipment, silver: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium">
                              <div className="mr-2 h-4 w-4 rounded-full bg-amber-600"></div>
                              Peças de Cobre (PC)
                            </label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={otherEquipment.copper}
                              onChange={(e) => setOtherEquipment({...otherEquipment, copper: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium">
                              <div className="mr-2 h-4 w-4 rounded-full bg-cyan-200"></div>
                              Peças de Electrum (PE)
                            </label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={otherEquipment.electrum}
                              onChange={(e) => setOtherEquipment({...otherEquipment, electrum: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium">
                              <div className="mr-2 h-4 w-4 rounded-full bg-zinc-400"></div>
                              Peças de Platina (PL)
                            </label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={otherEquipment.platinum}
                              onChange={(e) => setOtherEquipment({...otherEquipment, platinum: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={goToPreviousTab}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Próximo
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
