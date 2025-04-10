import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Character } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Save, 
  Edit2, 
  ShieldAlert, 
  Heart, 
  Workflow, 
  Swords, 
  ScrollText, 
  Sparkles,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CharacterSheetProps {
  character: Character;
  readOnly?: boolean;
}

export default function CharacterSheet({ character, readOnly = false }: CharacterSheetProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [currentHp, setCurrentHp] = useState(character.currentHitPoints);
  
  // Mutation for updating character
  const updateMutation = useMutation({
    mutationFn: async (updatedCharacter: Partial<Character>) => {
      const res = await apiRequest("PUT", `/api/characters/${character.id}`, updatedCharacter);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/characters/${character.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({
        title: "Character updated",
        description: "Your character has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateHitPoints = () => {
    if (currentHp === character.currentHitPoints) return;
    
    updateMutation.mutate({
      currentHitPoints: currentHp
    });
  };
  
  const getModifier = (stat: number) => {
    const mod = Math.floor((stat - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  // Use useEffect para definir o estado inicial de edição
  useEffect(() => {
    setIsEditing(false);
  }, [readOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="font-lora font-bold text-3xl text-primary">{character.name}</h1>
          <p className="text-secondary text-lg">
            {character.race} {character.class} • Level {character.level}
            {character.background && ` • ${character.background}`}
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/dashboard')}
          >
            {t('dashboard.backToDashboard')}
          </Button>
          {!readOnly ? (
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "magic-button" : ""}
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('landing.demoSection.campaignManager.save')}
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" />
                  {t('landing.demoSection.characterSheet.edit')}
                </>
              )}
            </Button>
          ) : (
            <Link href={`/character-creation/${character.id}`}>
              <Button variant="outline" size="sm">
                <Edit2 className="mr-2 h-4 w-4" />
                {t('landing.demoSection.characterSheet.edit')}
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
            <div className="text-center mb-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                    <p className="font-opensans text-xs text-secondary/70">AC</p>
                    <p className="font-lora font-bold text-xl text-primary">{character.armorClass}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                    <p className="font-opensans text-xs text-secondary/70">HP</p>
                    {isEditing ? (
                      <div className="flex items-center justify-center mt-1">
                        <Input
                          type="number"
                          value={currentHp}
                          onChange={(e) => setCurrentHp(parseInt(e.target.value) || 0)}
                          onBlur={updateHitPoints}
                          className="w-14 h-8 p-1 text-center text-lg"
                        />
                        <span className="mx-1 text-lg">/</span>
                        <span className="text-lg font-lora text-primary">{character.maxHitPoints}</span>
                      </div>
                    ) : (
                      <p className="font-lora font-bold text-xl text-primary">
                        {character.currentHitPoints}/{character.maxHitPoints}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                    <p className="font-opensans text-xs text-secondary/70">Speed</p>
                    <p className="font-lora font-bold text-xl text-primary">{character.speed}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-3 mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-secondary/70">STR</p>
                          <p className="font-lora font-bold text-lg text-primary">{character.strength}</p>
                          <p className="font-opensans text-xs text-accent">{getModifier(character.strength)}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-opensans text-xs">Strength: Affects melee attacks, athletics, and carrying capacity</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-secondary/70">DEX</p>
                          <p className="font-lora font-bold text-lg text-primary">{character.dexterity}</p>
                          <p className="font-opensans text-xs text-accent">{getModifier(character.dexterity)}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-opensans text-xs">Dexterity: Affects AC, initiative, and finesse weapons</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-secondary/70">CON</p>
                          <p className="font-lora font-bold text-lg text-primary">{character.constitution}</p>
                          <p className="font-opensans text-xs text-accent">{getModifier(character.constitution)}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-opensans text-xs">Constitution: Affects hit points and concentration checks</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-secondary/70">INT</p>
                          <p className="font-lora font-bold text-lg text-primary">{character.intelligence}</p>
                          <p className="font-opensans text-xs text-accent">{getModifier(character.intelligence)}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-opensans text-xs">Intelligence: Affects knowledge skills and some spellcasting</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-secondary/70">WIS</p>
                          <p className="font-lora font-bold text-lg text-primary">{character.wisdom}</p>
                          <p className="font-opensans text-xs text-accent">{getModifier(character.wisdom)}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-opensans text-xs">Wisdom: Affects perception and some spellcasting</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-secondary/70">CHA</p>
                          <p className="font-lora font-bold text-lg text-primary">{character.charisma}</p>
                          <p className="font-opensans text-xs text-accent">{getModifier(character.charisma)}</p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-opensans text-xs">Charisma: Affects social skills and some spellcasting</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                <h4 className="font-lora font-semibold text-md text-primary mb-2">Saving Throws</h4>
                <div className="grid grid-cols-2 gap-2 font-opensans text-sm">
                  {character.savingThrows && character.savingThrows.map((save, index) => (
                    <div key={index} className="flex items-center">
                      <i className="ri-checkbox-circle-fill text-accent mr-1"></i>
                      <span>{save}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                <h4 className="font-lora font-semibold text-md text-primary mb-2">Skills</h4>
                <div className="grid grid-cols-2 gap-2 font-opensans text-sm">
                  {character.skills && character.skills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <i className="ri-checkbox-circle-fill text-accent mr-1"></i>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm">
                <h4 className="font-lora font-semibold text-md text-primary mb-2">Proficiency Bonus</h4>
                <p className="font-lora font-bold text-xl text-primary">+{character.proficiencyBonus}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="equipment" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="equipment" className="font-lora">
                <Swords className="h-4 w-4 mr-2" />
                Equipment
              </TabsTrigger>
              <TabsTrigger value="abilities" className="font-lora">
                <Sparkles className="h-4 w-4 mr-2" />
                Abilities
              </TabsTrigger>
              <TabsTrigger value="spells" className="font-lora">
                <ScrollText className="h-4 w-4 mr-2" />
                Spells
              </TabsTrigger>
              <TabsTrigger value="notes" className="font-lora">
                <Info className="h-4 w-4 mr-2" />
                Character
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="equipment" className="space-y-4">
              <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                <div className="flex justify-between mb-4">
                  <h3 className="font-lora font-semibold text-xl text-primary">Equipment & Inventory</h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Equipment
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-lora font-semibold text-md text-primary mb-2 flex items-center">
                      <i className="ri-sword-fill text-accent mr-2"></i> Weapons
                    </h4>
                    <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                      {character.equipment && character.equipment
                        .filter(item => item.includes("damage") || item.includes("attack"))
                        .map((item, index) => (
                        <li key={index} className="font-opensans text-sm flex justify-between">
                          <span>{item.split(':')[0]}</span>
                          <span className="text-primary">{item.split(':')[1]}</span>
                        </li>
                      ))}
                      {(!character.equipment || character.equipment.filter(item => 
                        item.includes("damage") || item.includes("attack")).length === 0) && (
                        <li className="font-opensans text-sm text-muted-foreground">No weapons equipped</li>
                      )}
                    </ul>
                    
                    <h4 className="font-lora font-semibold text-md text-primary mt-4 mb-2 flex items-center">
                      <i className="ri-shield-fill text-accent mr-2"></i> Armor
                    </h4>
                    <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                      {character.equipment && character.equipment
                        .filter(item => item.includes("AC") || item.includes("armor"))
                        .map((item, index) => (
                        <li key={index} className="font-opensans text-sm flex justify-between">
                          <span>{item.split(':')[0]}</span>
                          <span className="text-primary">{item.split(':')[1]}</span>
                        </li>
                      ))}
                      {(!character.equipment || character.equipment.filter(item => 
                        item.includes("AC") || item.includes("armor")).length === 0) && (
                        <li className="font-opensans text-sm text-muted-foreground">No armor equipped</li>
                      )}
                    </ul>
                    
                    <h4 className="font-lora font-semibold text-md text-primary mt-4 mb-2 flex items-center">
                      <i className="ri-treasure-map-fill text-accent mr-2"></i> Other Items
                    </h4>
                    <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                      {character.equipment && character.equipment
                        .filter(item => !item.includes("damage") && !item.includes("attack") && 
                                       !item.includes("AC") && !item.includes("armor"))
                        .map((item, index) => (
                        <li key={index} className="font-opensans text-sm">
                          {item}
                        </li>
                      ))}
                      {(!character.equipment || character.equipment.filter(item => 
                        !item.includes("damage") && !item.includes("attack") && 
                        !item.includes("AC") && !item.includes("armor")).length === 0) && (
                        <li className="font-opensans text-sm text-muted-foreground">No other items</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="abilities" className="space-y-4">
              <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                <div className="flex justify-between mb-4">
                  <h3 className="font-lora font-semibold text-xl text-primary">Features & Abilities</h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Abilities
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-lora font-semibold text-md text-primary mb-2 flex items-center">
                      <i className="ri-magic-fill text-accent mr-2"></i> Class Features
                    </h4>
                    <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-3">
                      {character.features && character.features.map((feature, index) => (
                        <li key={index} className="font-opensans text-sm">
                          <span className="font-semibold text-primary">{feature.split(':')[0]}</span>
                          <p className="text-xs text-foreground mt-1">{feature.split(':')[1] || ''}</p>
                        </li>
                      ))}
                      {(!character.features || character.features.length === 0) && (
                        <li className="font-opensans text-sm text-muted-foreground">No class features</li>
                      )}
                    </ul>
                    
                    <h4 className="font-lora font-semibold text-md text-primary mt-4 mb-2 flex items-center">
                      <i className="ri-user-star-fill text-accent mr-2"></i> Racial Traits
                    </h4>
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm">
                      {character.traits ? (
                        <p className="font-opensans text-sm">{character.traits}</p>
                      ) : (
                        <p className="font-opensans text-sm text-muted-foreground">No racial traits</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="spells" className="space-y-4">
              <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                <div className="flex justify-between mb-4">
                  <h3 className="font-lora font-semibold text-xl text-primary">Spells</h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Spells
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-lora font-semibold text-md text-primary mb-2 flex items-center">
                      <i className="ri-book-fill text-accent mr-2"></i> Spell List
                    </h4>
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm">
                      {character.spells && character.spells.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex justify-between mb-2">
                            <span className="font-opensans text-sm font-semibold">Spell Slots:</span>
                            <div className="flex space-x-1">
                              <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">✓</span>
                              <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">✓</span>
                              <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">✓</span>
                              <span className="w-5 h-5 bg-secondary/30 rounded-full flex items-center justify-center text-foreground text-xs">✓</span>
                            </div>
                          </div>
                          <ul className="space-y-1">
                            {character.spells.map((spell, index) => (
                              <li key={index} className="font-opensans text-sm">{spell}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="font-opensans text-sm text-muted-foreground">No spells prepared</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                <div className="flex justify-between mb-4">
                  <h3 className="font-lora font-semibold text-xl text-primary">Character Details</h3>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-lora font-semibold text-md text-primary mb-2">Personality</h4>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                      <h5 className="font-opensans text-sm font-semibold mb-1">Traits</h5>
                      <p className="font-opensans text-sm">{character.traits || "No personality traits specified."}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                      <h5 className="font-opensans text-sm font-semibold mb-1">Ideals</h5>
                      <p className="font-opensans text-sm">{character.ideals || "No ideals specified."}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                      <h5 className="font-opensans text-sm font-semibold mb-1">Bonds</h5>
                      <p className="font-opensans text-sm">{character.bonds || "No bonds specified."}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm">
                      <h5 className="font-opensans text-sm font-semibold mb-1">Flaws</h5>
                      <p className="font-opensans text-sm">{character.flaws || "No flaws specified."}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-lora font-semibold text-md text-primary mb-2">Other Information</h4>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                      <h5 className="font-opensans text-sm font-semibold mb-1">Background</h5>
                      <p className="font-opensans text-sm">{character.background || "No background specified."}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                      <h5 className="font-opensans text-sm font-semibold mb-1">Alignment</h5>
                      <p className="font-opensans text-sm">{character.alignment || "No alignment specified."}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm">
                      <h5 className="font-opensans text-sm font-semibold mb-1">Notes</h5>
                      <p className="font-opensans text-sm">{character.notes || "No additional notes."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
