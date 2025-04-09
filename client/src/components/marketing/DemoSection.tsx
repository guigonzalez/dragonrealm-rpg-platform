import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

export default function DemoSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("character-sheet");

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="font-lora font-bold text-3xl md:text-4xl text-center text-primary mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t('landing.demoSection.title')}
        </motion.h2>
        <motion.p 
          className="font-opensans text-center text-foreground max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t('landing.demoSection.subtitle')}
        </motion.p>
        
        <motion.div 
          className="bg-background rounded-xl border border-secondary/20 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-primary px-6 py-4">
              <TabsList className="bg-transparent w-full flex space-x-4 overflow-x-auto whitespace-nowrap border-b border-transparent px-0">
                <TabsTrigger 
                  value="character-sheet" 
                  className={`text-white font-opensans font-medium px-4 py-2 rounded-t-lg focus:outline-none transition-colors hover:bg-primary/80 data-[state=active]:bg-primary/90 data-[state=active]:text-white data-[state=inactive]:text-white/70`}
                >
                  {t('landing.demoSection.tabs.characterSheet')}
                </TabsTrigger>
                <TabsTrigger 
                  value="campaign-manager" 
                  className={`text-white font-opensans font-medium px-4 py-2 rounded-t-lg focus:outline-none transition-colors hover:bg-primary/80 data-[state=active]:bg-primary/90 data-[state=active]:text-white data-[state=inactive]:text-white/70`}
                >
                  {t('landing.demoSection.tabs.campaignManager')}
                </TabsTrigger>
                <TabsTrigger 
                  value="npc-creator" 
                  className={`text-white font-opensans font-medium px-4 py-2 rounded-t-lg focus:outline-none transition-colors hover:bg-primary/80 data-[state=active]:bg-primary/90 data-[state=active]:text-white data-[state=inactive]:text-white/70`}
                >
                  {t('landing.demoSection.tabs.npcCreator')}
                </TabsTrigger>
                <TabsTrigger 
                  value="encounter-builder" 
                  className={`text-white font-opensans font-medium px-4 py-2 rounded-t-lg focus:outline-none transition-colors hover:bg-primary/80 data-[state=active]:bg-primary/90 data-[state=active]:text-white data-[state=inactive]:text-white/70`}
                >
                  {t('landing.demoSection.tabs.encounterBuilder')}
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Character Sheet Tab */}
            <TabsContent value="character-sheet" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="text-center mb-4">
                      <h3 className="font-lora font-bold text-2xl text-primary">Thordak Ironfist</h3>
                      <p className="font-opensans text-sm text-foreground/70">Mountain Dwarf - Paladin Lv.5</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-foreground/70">AC</p>
                          <p className="font-lora font-bold text-xl text-primary">18</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-foreground/70">HP</p>
                          <p className="font-lora font-bold text-xl text-primary">45/45</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-foreground/70">Speed</p>
                          <p className="font-lora font-bold text-xl text-primary">25</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-3 mb-6">
                      {[
                        { stat: "STR", value: "16", mod: "+3", tooltip: "Strength: Affects melee attacks, athletics, and carrying capacity" },
                        { stat: "DEX", value: "12", mod: "+1", tooltip: "Dexterity: Affects AC, initiative, and finesse weapons" },
                        { stat: "CON", value: "14", mod: "+2", tooltip: "Constitution: Affects hit points and concentration checks" },
                        { stat: "INT", value: "10", mod: "+0", tooltip: "Intelligence: Affects knowledge skills and some spellcasting" },
                        { stat: "WIS", value: "13", mod: "+1", tooltip: "Wisdom: Affects perception and some spellcasting" },
                        { stat: "CHA", value: "15", mod: "+2", tooltip: "Charisma: Affects social skills and paladin spellcasting" }
                      ].map((item, index) => (
                        <div key={index} className="text-center group relative">
                          <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                            <p className="font-opensans text-xs text-foreground/70">{item.stat}</p>
                            <p className="font-lora font-bold text-lg text-primary">{item.value}</p>
                            <p className="font-opensans text-xs text-accent">{item.mod}</p>
                          </div>
                          <div className="absolute z-10 invisible group-hover:visible bg-foreground text-white text-xs rounded p-2 w-40 top-full left-1/2 transform -translate-x-1/2 mt-1">
                            {item.tooltip}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm mb-4">
                      <h4 className="font-lora font-semibold text-md text-primary mb-2">Saving Throws</h4>
                      <div className="grid grid-cols-2 gap-2 font-opensans text-sm">
                        <div className="flex items-center">
                          <i className="ri-checkbox-circle-fill text-accent mr-1"></i>
                          <span>Wisdom +4</span>
                        </div>
                        <div className="flex items-center">
                          <i className="ri-checkbox-circle-fill text-accent mr-1"></i>
                          <span>Charisma +5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-lora font-semibold text-xl text-primary">Equipment & Abilities</h3>
                      <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                        <i className="ri-edit-line mr-1"></i> Edit
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2 flex items-center">
                          <i className="ri-sword-fill text-accent mr-2"></i> Weapons
                        </h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm flex justify-between">
                            <span>Warhammer</span>
                            <span className="text-primary">1d8+3 bludgeoning</span>
                          </li>
                          <li className="font-opensans text-sm flex justify-between">
                            <span>Handaxe</span>
                            <span className="text-primary">1d6+3 slashing</span>
                          </li>
                          <li className="font-opensans text-sm flex justify-between">
                            <span>Light Crossbow</span>
                            <span className="text-primary">1d8+1 piercing</span>
                          </li>
                        </ul>
                        
                        <h4 className="font-lora font-semibold text-md text-primary mt-4 mb-2 flex items-center">
                          <i className="ri-shield-fill text-accent mr-2"></i> Armor
                        </h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm flex justify-between">
                            <span>Chain Mail</span>
                            <span className="text-primary">AC 16</span>
                          </li>
                          <li className="font-opensans text-sm flex justify-between">
                            <span>Shield</span>
                            <span className="text-primary">AC +2</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2 flex items-center">
                          <i className="ri-magic-fill text-accent mr-2"></i> Abilities
                        </h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">Divine Sense</span>
                            <p className="text-xs text-foreground">Detect celestials, fiends, or undead within 60 feet.</p>
                          </li>
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">Lay on Hands</span>
                            <p className="text-xs text-foreground">Heal 25 points of damage per day.</p>
                          </li>
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">Divine Smite</span>
                            <p className="text-xs text-foreground">Expend spell slot to deal extra radiant damage.</p>
                          </li>
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">Oath of Devotion</span>
                            <p className="text-xs text-foreground">Channel Divinity: Sacred Weapon, Turn the Unholy</p>
                          </li>
                        </ul>
                        
                        <h4 className="font-lora font-semibold text-md text-primary mt-4 mb-2 flex items-center">
                          <i className="ri-book-fill text-accent mr-2"></i> Spells
                        </h4>
                        <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm">
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
                            <li className="font-opensans text-sm">Cure Wounds</li>
                            <li className="font-opensans text-sm">Shield of Faith</li>
                            <li className="font-opensans text-sm">Thunderous Smite</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Campaign Manager Tab */}
            <TabsContent value="campaign-manager" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <h3 className="font-lora font-semibold text-xl text-primary mb-4">Campaign: Frost Spire Saga</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2">Players</h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm flex items-center">
                            <div className="w-6 h-6 bg-primary rounded-full mr-2"></div>
                            <span>Jessica - Elven Ranger</span>
                          </li>
                          <li className="font-opensans text-sm flex items-center">
                            <div className="w-6 h-6 bg-accent rounded-full mr-2"></div>
                            <span>Michael - Human Wizard</span>
                          </li>
                          <li className="font-opensans text-sm flex items-center">
                            <div className="w-6 h-6 bg-green-600 rounded-full mr-2"></div>
                            <span>Thordak - Dwarven Paladin</span>
                          </li>
                          <li className="font-opensans text-sm flex items-center opacity-50">
                            <div className="w-6 h-6 bg-gray-400 rounded-full mr-2 flex items-center justify-center text-white text-xs">+</div>
                            <span>Invite Player</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2">Campaign Links</h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-map-fill mr-1"></i> World Map
                            </a>
                          </li>
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-user-star-fill mr-1"></i> NPCs
                            </a>
                          </li>
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-sword-fill mr-1"></i> Encounters
                            </a>
                          </li>
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-book-fill mr-1"></i> Session Notes
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-3">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-lora font-semibold text-xl text-primary">World Building</h3>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-white text-primary border border-primary px-3 py-1 rounded">
                          <i className="ri-save-line mr-1"></i> Save
                        </button>
                        <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                          <i className="ri-add-line mr-1"></i> Add Location
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <img src="https://images.unsplash.com/photo-1596825205280-5d1bec35f0a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Frost Spire Mountain" className="w-full h-40 object-cover rounded-md mb-3" />
                        <h4 className="font-lora font-semibold text-lg text-primary mb-1">Frost Spire Mountain</h4>
                        <p className="font-opensans text-sm text-foreground mb-3">
                          A treacherous mountain peak shrouded in eternal winter, home to the ancient white dragon Rimefang.
                        </p>
                        <div className="flex justify-between text-xs text-foreground/70">
                          <span>Created: 05/15/2023</span>
                          <button className="text-primary hover:underline">Edit</button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <img src="https://images.unsplash.com/photo-1486825586573-7131f7991bdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Evernight Forest" className="w-full h-40 object-cover rounded-md mb-3" />
                        <h4 className="font-lora font-semibold text-lg text-primary mb-1">Evernight Forest</h4>
                        <p className="font-opensans text-sm text-foreground mb-3">
                          A dense forest where sunlight never penetrates the canopy, inhabited by fey creatures and ancient treants.
                        </p>
                        <div className="flex justify-between text-xs text-foreground/70">
                          <span>Created: 05/10/2023</span>
                          <button className="text-primary hover:underline">Edit</button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <img src="https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Haven Village" className="w-full h-40 object-cover rounded-md mb-3" />
                        <h4 className="font-lora font-semibold text-lg text-primary mb-1">Haven Village</h4>
                        <p className="font-opensans text-sm text-foreground mb-3">
                          A small settlement at the base of Frost Spire, where villagers live in fear of the dragon's occasional raids.
                        </p>
                        <div className="flex justify-between text-xs text-foreground/70">
                          <span>Created: 05/05/2023</span>
                          <button className="text-primary hover:underline">Edit</button>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 rounded-lg p-4 border border-dashed border-secondary/50 shadow-sm flex flex-col items-center justify-center h-full">
                        <i className="ri-add-circle-line text-4xl text-secondary/50 mb-2"></i>
                        <p className="font-opensans text-sm text-foreground/70 text-center">
                          Add a new location to your campaign world
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* NPC Creator Tab */}
            <TabsContent value="npc-creator" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow h-full">
                    <h3 className="font-lora font-semibold text-xl text-primary mb-4">NPC Creator</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">Basic Information</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Name</label>
                            <input type="text" value="Grimwald the Sage" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Race</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>Human</option>
                              <option>Elf</option>
                              <option>Dwarf</option>
                              <option>Halfling</option>
                              <option selected>Gnome</option>
                              <option>Half-Elf</option>
                              <option>Half-Orc</option>
                              <option>Tiefling</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Occupation</label>
                            <input type="text" value="Wizard Librarian" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Location</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option selected>Haven Village</option>
                              <option>Frost Spire Mountain</option>
                              <option>Evernight Forest</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">Appearance</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Age</label>
                            <input type="text" value="237" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Distinctive Features</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">White beard that reaches his knees, spectacles with crystal lenses that magnify his eyes, and a slight hunch from decades of reading ancient tomes.</textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-lora font-semibold text-xl text-primary">NPC Details</h3>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-white text-primary border border-primary px-3 py-1 rounded">
                          <i className="ri-save-line mr-1"></i> Save Draft
                        </button>
                        <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                          <i className="ri-check-line mr-1"></i> Create NPC
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">Personality</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Traits</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">Absent-minded but brilliant. Often speaks in riddles and ancient proverbs. Becomes extremely focused when discussing magical theory.</textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Ideals</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">Knowledge should be preserved and shared with those worthy of it. The greatest power comes from understanding, not brute force.</textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Voice</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">High-pitched and slightly raspy. Tends to clear his throat before making important points. Occasionally breaks into ancient languages mid-sentence.</textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">Role in Campaign</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Knowledge & Abilities</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">Expert in ancient history and magical artifacts. Can identify most magical items. Knows spells up to 5th level, specializing in divination.</textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Plot Hooks</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">Recently discovered references to a magical artifact that could weaken Rimefang the dragon. Has been receiving threatening messages from an unknown source warning him to stop his research.</textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Relationship to Players</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">Potential mentor to any arcane spellcasters in the party. Will offer information and guidance in exchange for rare books or magical components.</textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Encounter Builder Tab */}
            <TabsContent value="encounter-builder" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <h3 className="font-lora font-semibold text-xl text-primary mb-4">Encounter Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">Basic Setup</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Encounter Name</label>
                            <input type="text" value="Frost Wolf Ambush" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Location</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>Haven Village</option>
                              <option selected>Frost Spire Mountain</option>
                              <option>Evernight Forest</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Difficulty</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>Easy</option>
                              <option selected>Medium</option>
                              <option>Hard</option>
                              <option>Deadly</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Party Level (Average)</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>3</option>
                              <option>4</option>
                              <option selected>5</option>
                              <option>6</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">Party Size</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>2</option>
                              <option selected>3</option>
                              <option>4</option>
                              <option>5</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">Encounter Type</h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="radio" id="combat" name="encounter-type" checked className="text-primary focus:ring-primary" />
                            <label htmlFor="combat" className="font-opensans text-sm text-foreground ml-2">Combat</label>
                          </div>
                          <div className="flex items-center">
                            <input type="radio" id="social" name="encounter-type" className="text-primary focus:ring-primary" />
                            <label htmlFor="social" className="font-opensans text-sm text-foreground ml-2">Social</label>
                          </div>
                          <div className="flex items-center">
                            <input type="radio" id="puzzle" name="encounter-type" className="text-primary focus:ring-primary" />
                            <label htmlFor="puzzle" className="font-opensans text-sm text-foreground ml-2">Puzzle/Trap</label>
                          </div>
                          <div className="flex items-center">
                            <input type="radio" id="mixed" name="encounter-type" className="text-primary focus:ring-primary" />
                            <label htmlFor="mixed" className="font-opensans text-sm text-foreground ml-2">Mixed</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-lora font-semibold text-xl text-primary">Monsters & Creatures</h3>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-white text-primary border border-primary px-3 py-1 rounded">
                          <i className="ri-filter-line mr-1"></i> Filter
                        </button>
                        <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                          <i className="ri-add-line mr-1"></i> Add Creature
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm mb-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
                        <div className="flex items-center mb-2 md:mb-0">
                          <img src="https://images.unsplash.com/photo-1551975036-b8935e64e531?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Winter Wolf" className="w-12 h-12 object-cover rounded-md mr-3" />
                          <div>
                            <h4 className="font-lora font-semibold text-lg text-primary">Winter Wolf</h4>
                            <p className="font-opensans text-xs text-foreground/70">Large monstrosity, neutral evil</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="text-center">
                            <span className="font-opensans text-xs text-foreground/70 block">CR</span>
                            <span className="font-opensans font-semibold text-primary">3</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">HP</span>
                            <span className="font-opensans font-semibold text-primary">75</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">AC</span>
                            <span className="font-opensans font-semibold text-primary">13</span>
                          </div>
                          <div className="flex space-x-1 items-center ml-4">
                            <button className="text-foreground/70 hover:text-primary">
                              <i className="ri-edit-line"></i>
                            </button>
                            <button className="text-foreground/70 hover:text-red-500">
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-lora font-semibold text-sm text-primary mb-1">Abilities</h5>
                          <p className="font-opensans text-xs text-foreground mb-2">
                            <span className="font-semibold">Snow Camouflage:</span> Advantage on Dexterity (Stealth) checks in snowy terrain.
                          </p>
                          <p className="font-opensans text-xs text-foreground">
                            <span className="font-semibold">Keen Hearing and Smell:</span> Advantage on Wisdom (Perception) checks that rely on hearing or smell.
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-lora font-semibold text-sm text-primary mb-1">Actions</h5>
                          <p className="font-opensans text-xs text-foreground mb-2">
                            <span className="font-semibold">Bite:</span> +6 to hit, 10 (2d6 + 3) piercing damage. If target is a creature, it must succeed on a DC 14 Strength saving throw or be knocked prone.
                          </p>
                          <p className="font-opensans text-xs text-foreground">
                            <span className="font-semibold">Cold Breath (Recharge 5-6):</span> 15 ft. cone, DC 12 Dexterity save, 18 (4d8) cold damage on a failed save, or half on success.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 border-t border-secondary/20 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-opensans text-sm">Quantity:</span>
                          <div className="flex items-center">
                            <button className="w-6 h-6 rounded bg-secondary/20 flex items-center justify-center text-foreground">-</button>
                            <span className="font-opensans font-semibold text-primary mx-3">3</span>
                            <button className="w-6 h-6 rounded bg-secondary/20 flex items-center justify-center text-foreground">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm mb-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
                        <div className="flex items-center mb-2 md:mb-0">
                          <img src="https://images.unsplash.com/photo-1602491673980-73aa38de027b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Ice Mephit" className="w-12 h-12 object-cover rounded-md mr-3" />
                          <div>
                            <h4 className="font-lora font-semibold text-lg text-primary">Ice Mephit</h4>
                            <p className="font-opensans text-xs text-foreground/70">Small elemental, neutral evil</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="text-center">
                            <span className="font-opensans text-xs text-foreground/70 block">CR</span>
                            <span className="font-opensans font-semibold text-primary">1/2</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">HP</span>
                            <span className="font-opensans font-semibold text-primary">21</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">AC</span>
                            <span className="font-opensans font-semibold text-primary">11</span>
                          </div>
                          <div className="flex space-x-1 items-center ml-4">
                            <button className="text-foreground/70 hover:text-primary">
                              <i className="ri-edit-line"></i>
                            </button>
                            <button className="text-foreground/70 hover:text-red-500">
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 border-t border-secondary/20 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-opensans text-sm">Quantity:</span>
                          <div className="flex items-center">
                            <button className="w-6 h-6 rounded bg-secondary/20 flex items-center justify-center text-foreground">-</button>
                            <span className="font-opensans font-semibold text-primary mx-3">4</span>
                            <button className="w-6 h-6 rounded bg-secondary/20 flex items-center justify-center text-foreground">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-1">Encounter Summary</h4>
                        <p className="font-opensans text-sm text-foreground">
                          <span className="font-semibold">Total XP:</span> 2,000 XP
                        </p>
                        <p className="font-opensans text-sm text-foreground">
                          <span className="font-semibold">Difficulty:</span> Medium for 3 Level 5 players
                        </p>
                      </div>
                      <button className="text-sm bg-primary text-white px-4 py-2 rounded magic-button">
                        <i className="ri-save-line mr-1"></i> Save Encounter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
