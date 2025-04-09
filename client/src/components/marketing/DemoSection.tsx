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
                      <h3 className="font-lora font-bold text-2xl text-primary">{t('landing.demoSection.characterSheet.characterName')}</h3>
                      <p className="font-opensans text-sm text-foreground/70">{t('landing.demoSection.characterSheet.characterRaceClass')}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-foreground/70">{t('landing.demoSection.characterSheet.stats.ac')}</p>
                          <p className="font-lora font-bold text-xl text-primary">18</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-foreground/70">{t('landing.demoSection.characterSheet.stats.hp')}</p>
                          <p className="font-lora font-bold text-xl text-primary">45/45</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-2 border border-secondary/30 shadow-sm">
                          <p className="font-opensans text-xs text-foreground/70">{t('landing.demoSection.characterSheet.stats.speed')}</p>
                          <p className="font-lora font-bold text-xl text-primary">25</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-3 mb-6">
                      {[
                        { stat: t('landing.demoSection.characterSheet.stats.str'), value: "16", mod: "+3", tooltip: t('landing.demoSection.characterSheet.tooltips.strength') },
                        { stat: t('landing.demoSection.characterSheet.stats.dex'), value: "12", mod: "+1", tooltip: t('landing.demoSection.characterSheet.tooltips.dexterity') },
                        { stat: t('landing.demoSection.characterSheet.stats.con'), value: "14", mod: "+2", tooltip: t('landing.demoSection.characterSheet.tooltips.constitution') },
                        { stat: t('landing.demoSection.characterSheet.stats.int'), value: "10", mod: "+0", tooltip: t('landing.demoSection.characterSheet.tooltips.intelligence') },
                        { stat: t('landing.demoSection.characterSheet.stats.wis'), value: "13", mod: "+1", tooltip: t('landing.demoSection.characterSheet.tooltips.wisdom') },
                        { stat: t('landing.demoSection.characterSheet.stats.cha'), value: "15", mod: "+2", tooltip: t('landing.demoSection.characterSheet.tooltips.charisma') }
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
                      <h4 className="font-lora font-semibold text-md text-primary mb-2">{t('landing.demoSection.characterSheet.stats.savingThrows')}</h4>
                      <div className="grid grid-cols-2 gap-2 font-opensans text-sm">
                        <div className="flex items-center">
                          <i className="ri-checkbox-circle-fill text-accent mr-1"></i>
                          <span>{t('landing.demoSection.characterSheet.saves.wisdom')}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="ri-checkbox-circle-fill text-accent mr-1"></i>
                          <span>{t('landing.demoSection.characterSheet.saves.charisma')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="parchment bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-lora font-semibold text-xl text-primary">{t('landing.demoSection.characterSheet.equipmentAndAbilities')}</h3>
                      <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                        <i className="ri-edit-line mr-1"></i> {t('landing.demoSection.characterSheet.edit')}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2 flex items-center">
                          <i className="ri-sword-fill text-accent mr-2"></i> {t('landing.demoSection.characterSheet.weapons')}
                        </h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm flex justify-between">
                            <span>{t('landing.demoSection.characterSheet.weaponsList.warhammer')}</span>
                            <span className="text-primary">{t('landing.demoSection.characterSheet.weaponsList.warhammer_damage')}</span>
                          </li>
                          <li className="font-opensans text-sm flex justify-between">
                            <span>{t('landing.demoSection.characterSheet.weaponsList.handaxe')}</span>
                            <span className="text-primary">{t('landing.demoSection.characterSheet.weaponsList.handaxe_damage')}</span>
                          </li>
                          <li className="font-opensans text-sm flex justify-between">
                            <span>{t('landing.demoSection.characterSheet.weaponsList.lightCrossbow')}</span>
                            <span className="text-primary">{t('landing.demoSection.characterSheet.weaponsList.lightCrossbow_damage')}</span>
                          </li>
                        </ul>
                        
                        <h4 className="font-lora font-semibold text-md text-primary mt-4 mb-2 flex items-center">
                          <i className="ri-shield-fill text-accent mr-2"></i> {t('landing.demoSection.characterSheet.armor')}
                        </h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm flex justify-between">
                            <span>{t('landing.demoSection.characterSheet.armorList.chainMail')}</span>
                            <span className="text-primary">{t('landing.demoSection.characterSheet.armorList.chainMail_ac')}</span>
                          </li>
                          <li className="font-opensans text-sm flex justify-between">
                            <span>{t('landing.demoSection.characterSheet.armorList.shield')}</span>
                            <span className="text-primary">{t('landing.demoSection.characterSheet.armorList.shield_ac')}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2 flex items-center">
                          <i className="ri-magic-fill text-accent mr-2"></i> {t('landing.demoSection.characterSheet.abilities')}
                        </h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">{t('landing.demoSection.characterSheet.abilitiesList.divineSense')}</span>
                            <p className="text-xs text-foreground">{t('landing.demoSection.characterSheet.abilitiesList.divineSense_desc')}</p>
                          </li>
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">{t('landing.demoSection.characterSheet.abilitiesList.layOnHands')}</span>
                            <p className="text-xs text-foreground">{t('landing.demoSection.characterSheet.abilitiesList.layOnHands_desc')}</p>
                          </li>
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">{t('landing.demoSection.characterSheet.abilitiesList.divineSmite')}</span>
                            <p className="text-xs text-foreground">{t('landing.demoSection.characterSheet.abilitiesList.divineSmite_desc')}</p>
                          </li>
                          <li className="font-opensans text-sm">
                            <span className="font-semibold text-primary">{t('landing.demoSection.characterSheet.abilitiesList.oathOfDevotion')}</span>
                            <p className="text-xs text-foreground">{t('landing.demoSection.characterSheet.abilitiesList.oathOfDevotion_desc')}</p>
                          </li>
                        </ul>
                        
                        <h4 className="font-lora font-semibold text-md text-primary mt-4 mb-2 flex items-center">
                          <i className="ri-book-fill text-accent mr-2"></i> {t('landing.demoSection.characterSheet.spells')}
                        </h4>
                        <div className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm">
                          <div className="flex justify-between mb-2">
                            <span className="font-opensans text-sm font-semibold">{t('landing.demoSection.characterSheet.spellsList.spellSlots')}</span>
                            <div className="flex space-x-1">
                              <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">✓</span>
                              <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">✓</span>
                              <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs">✓</span>
                              <span className="w-5 h-5 bg-secondary/30 rounded-full flex items-center justify-center text-foreground text-xs">✓</span>
                            </div>
                          </div>
                          <ul className="space-y-1">
                            <li className="font-opensans text-sm">{t('landing.demoSection.characterSheet.spellsList.cureWounds')}</li>
                            <li className="font-opensans text-sm">{t('landing.demoSection.characterSheet.spellsList.shieldOfFaith')}</li>
                            <li className="font-opensans text-sm">{t('landing.demoSection.characterSheet.spellsList.thunderousSmite')}</li>
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
                    <h3 className="font-lora font-semibold text-xl text-primary mb-4">{t('landing.demoSection.campaignManager.title')}: {t('landing.demoSection.campaignManager.campaignName')}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2">{t('landing.demoSection.campaignManager.players')}</h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm flex items-center">
                            <div className="w-6 h-6 bg-primary rounded-full mr-2"></div>
                            <span>{t('landing.demoSection.campaignManager.playersList.player1')}</span>
                          </li>
                          <li className="font-opensans text-sm flex items-center">
                            <div className="w-6 h-6 bg-accent rounded-full mr-2"></div>
                            <span>{t('landing.demoSection.campaignManager.playersList.player2')}</span>
                          </li>
                          <li className="font-opensans text-sm flex items-center">
                            <div className="w-6 h-6 bg-green-600 rounded-full mr-2"></div>
                            <span>{t('landing.demoSection.campaignManager.playersList.player3')}</span>
                          </li>
                          <li className="font-opensans text-sm flex items-center opacity-50">
                            <div className="w-6 h-6 bg-gray-400 rounded-full mr-2 flex items-center justify-center text-white text-xs">+</div>
                            <span>{t('landing.demoSection.campaignManager.playersList.invitePlayer')}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-lora font-semibold text-md text-primary mb-2">{t('landing.demoSection.campaignManager.campaignLinks')}</h4>
                        <ul className="bg-white rounded-lg p-3 border border-secondary/30 shadow-sm space-y-2">
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-map-fill mr-1"></i> {t('landing.demoSection.campaignManager.linksList.worldMap')}
                            </a>
                          </li>
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-user-star-fill mr-1"></i> {t('landing.demoSection.campaignManager.linksList.npcs')}
                            </a>
                          </li>
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-sword-fill mr-1"></i> {t('landing.demoSection.campaignManager.linksList.encounters')}
                            </a>
                          </li>
                          <li className="font-opensans text-sm">
                            <a href="#" className="text-primary hover:underline flex items-center">
                              <i className="ri-book-fill mr-1"></i> {t('landing.demoSection.campaignManager.linksList.sessionNotes')}
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
                      <h3 className="font-lora font-semibold text-xl text-primary">{t('landing.demoSection.campaignManager.worldBuilding')}</h3>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-white text-primary border border-primary px-3 py-1 rounded">
                          <i className="ri-save-line mr-1"></i> {t('landing.demoSection.campaignManager.save')}
                        </button>
                        <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                          <i className="ri-add-line mr-1"></i> {t('landing.demoSection.campaignManager.addLocation')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <img src="/assets/frost-spire-mountain.png" alt="Frost Spire Mountain" className="w-full h-40 object-cover rounded-md mb-3" />
                        <h4 className="font-lora font-semibold text-lg text-primary mb-1">{t('landing.demoSection.campaignManager.location1.name')}</h4>
                        <p className="font-opensans text-sm text-foreground mb-3">
                          {t('landing.demoSection.campaignManager.location1.description')}
                        </p>
                        <div className="flex justify-between text-xs text-foreground/70">
                          <span>{t('landing.demoSection.campaignManager.created')}: 05/15/2023</span>
                          <button className="text-primary hover:underline">{t('landing.demoSection.campaignManager.edit')}</button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <img src="/assets/evernight-forest.png" alt="Evernight Forest" className="w-full h-40 object-cover rounded-md mb-3" />
                        <h4 className="font-lora font-semibold text-lg text-primary mb-1">{t('landing.demoSection.campaignManager.location2.name')}</h4>
                        <p className="font-opensans text-sm text-foreground mb-3">
                          {t('landing.demoSection.campaignManager.location2.description')}
                        </p>
                        <div className="flex justify-between text-xs text-foreground/70">
                          <span>{t('landing.demoSection.campaignManager.created')}: 05/10/2023</span>
                          <button className="text-primary hover:underline">{t('landing.demoSection.campaignManager.edit')}</button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <img src="/assets/haven-village.png" alt="Haven Village" className="w-full h-40 object-cover rounded-md mb-3" />
                        <h4 className="font-lora font-semibold text-lg text-primary mb-1">{t('landing.demoSection.campaignManager.location3.name')}</h4>
                        <p className="font-opensans text-sm text-foreground mb-3">
                          {t('landing.demoSection.campaignManager.location3.description')}
                        </p>
                        <div className="flex justify-between text-xs text-foreground/70">
                          <span>{t('landing.demoSection.campaignManager.created')}: 05/05/2023</span>
                          <button className="text-primary hover:underline">{t('landing.demoSection.campaignManager.edit')}</button>
                        </div>
                      </div>
                      
                      <div className="bg-white/50 rounded-lg p-4 border border-dashed border-secondary/50 shadow-sm flex flex-col items-center justify-center h-full">
                        <i className="ri-add-circle-line text-4xl text-secondary/50 mb-2"></i>
                        <p className="font-opensans text-sm text-foreground/70 text-center">
                          {t('landing.demoSection.campaignManager.addLocationHint')}
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
                    <h3 className="font-lora font-semibold text-xl text-primary mb-4">{t('landing.demoSection.npcCreator.title')}</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">{t('landing.demoSection.npcCreator.basicInformation')}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.name')}</label>
                            <input type="text" value="Grimwald the Sage" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.race')}</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>{t('landing.demoSection.npcCreator.races.human')}</option>
                              <option>{t('landing.demoSection.npcCreator.races.elf')}</option>
                              <option>{t('landing.demoSection.npcCreator.races.dwarf')}</option>
                              <option>{t('landing.demoSection.npcCreator.races.halfling')}</option>
                              <option selected>{t('landing.demoSection.npcCreator.races.gnome')}</option>
                              <option>{t('landing.demoSection.npcCreator.races.halfElf')}</option>
                              <option>{t('landing.demoSection.npcCreator.races.halfOrc')}</option>
                              <option>{t('landing.demoSection.npcCreator.races.tiefling')}</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.occupation')}</label>
                            <input type="text" value="Wizard Librarian" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.location')}</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option selected>{t('landing.demoSection.campaignManager.location3.name')}</option>
                              <option>{t('landing.demoSection.campaignManager.location1.name')}</option>
                              <option>{t('landing.demoSection.campaignManager.location2.name')}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">{t('landing.demoSection.npcCreator.appearance')}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.age')}</label>
                            <input type="text" value="237" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.distinctiveFeatures')}</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20">{t('landing.demoSection.npcCreator.featuresExample')}</textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-lora font-semibold text-xl text-primary">{t('landing.demoSection.npcCreator.details')}</h3>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-white text-primary border border-primary px-3 py-1 rounded">
                          <i className="ri-save-line mr-1"></i> {t('landing.demoSection.npcCreator.saveDraft')}
                        </button>
                        <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                          <i className="ri-check-line mr-1"></i> {t('landing.demoSection.npcCreator.createNpc')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">{t('landing.demoSection.npcCreator.personality')}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.traits')}</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" defaultValue={t('landing.demoSection.npcCreator.traitsExample')}></textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.ideals')}</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" defaultValue={t('landing.demoSection.npcCreator.idealsExample')}></textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.voice')}</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" defaultValue={t('landing.demoSection.npcCreator.voiceExample')}></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">{t('landing.demoSection.npcCreator.roleInCampaign')}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.abilities')}</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" defaultValue={t('landing.demoSection.npcCreator.abilitiesExample')}></textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.plotHooks')}</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" defaultValue={t('landing.demoSection.npcCreator.plotHooksExample')}></textarea>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.npcCreator.relationshipToPlayers')}</label>
                            <textarea className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" defaultValue={t('landing.demoSection.npcCreator.relationshipExample')}></textarea>
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
                    <h3 className="font-lora font-semibold text-xl text-primary mb-4">{t('landing.demoSection.encounterBuilder.settings')}</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm">
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">{t('landing.demoSection.encounterBuilder.basicSetup')}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.encounterBuilder.encounterName')}</label>
                            <input type="text" defaultValue="Frost Wolf Ambush" className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.encounterBuilder.location')}</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>{t('landing.demoSection.campaignManager.location3.name')}</option>
                              <option selected>{t('landing.demoSection.campaignManager.location1.name')}</option>
                              <option>{t('landing.demoSection.campaignManager.location2.name')}</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.encounterBuilder.difficulty')}</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>{t('landing.demoSection.encounterBuilder.difficulties.easy')}</option>
                              <option selected>{t('landing.demoSection.encounterBuilder.difficulties.medium')}</option>
                              <option>{t('landing.demoSection.encounterBuilder.difficulties.hard')}</option>
                              <option>{t('landing.demoSection.encounterBuilder.difficulties.deadly')}</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.encounterBuilder.partyLevel')}</label>
                            <select className="w-full px-3 py-2 border border-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                              <option>3</option>
                              <option>4</option>
                              <option selected>5</option>
                              <option>6</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="font-opensans text-sm text-foreground block mb-1">{t('landing.demoSection.encounterBuilder.partySize')}</label>
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
                        <h4 className="font-lora font-semibold text-md text-primary mb-3">{t('landing.demoSection.encounterBuilder.encounterType')}</h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="radio" id="combat" name="encounter-type" defaultChecked className="text-primary focus:ring-primary" />
                            <label htmlFor="combat" className="font-opensans text-sm text-foreground ml-2">{t('landing.demoSection.encounterBuilder.types.combat')}</label>
                          </div>
                          <div className="flex items-center">
                            <input type="radio" id="social" name="encounter-type" className="text-primary focus:ring-primary" />
                            <label htmlFor="social" className="font-opensans text-sm text-foreground ml-2">{t('landing.demoSection.encounterBuilder.types.social')}</label>
                          </div>
                          <div className="flex items-center">
                            <input type="radio" id="puzzle" name="encounter-type" className="text-primary focus:ring-primary" />
                            <label htmlFor="puzzle" className="font-opensans text-sm text-foreground ml-2">{t('landing.demoSection.encounterBuilder.types.puzzleTrap')}</label>
                          </div>
                          <div className="flex items-center">
                            <input type="radio" id="mixed" name="encounter-type" className="text-primary focus:ring-primary" />
                            <label htmlFor="mixed" className="font-opensans text-sm text-foreground ml-2">{t('landing.demoSection.encounterBuilder.types.mixed')}</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/30 shadow">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-lora font-semibold text-xl text-primary">{t('landing.demoSection.encounterBuilder.monstersAndCreatures')}</h3>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-white text-primary border border-primary px-3 py-1 rounded">
                          <i className="ri-filter-line mr-1"></i> {t('landing.demoSection.encounterBuilder.filter')}
                        </button>
                        <button className="text-sm bg-primary text-white px-3 py-1 rounded magic-button">
                          <i className="ri-add-line mr-1"></i> {t('landing.demoSection.encounterBuilder.addCreature')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-secondary/30 shadow-sm mb-4">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3">
                        <div className="flex items-center mb-2 md:mb-0">
                          <img src="/assets/winter-wolf.png" alt="Winter Wolf" className="w-12 h-12 object-cover rounded-md mr-3" />
                          <div>
                            <h4 className="font-lora font-semibold text-lg text-primary">{t('landing.demoSection.encounterBuilder.creatures.winterWolf')}</h4>
                            <p className="font-opensans text-xs text-foreground/70">{t('landing.demoSection.encounterBuilder.creatures.winterWolfType')}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="text-center">
                            <span className="font-opensans text-xs text-foreground/70 block">{t('landing.demoSection.encounterBuilder.cr')}</span>
                            <span className="font-opensans font-semibold text-primary">3</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">{t('landing.demoSection.encounterBuilder.hp')}</span>
                            <span className="font-opensans font-semibold text-primary">75</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">{t('landing.demoSection.encounterBuilder.ac')}</span>
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
                          <h5 className="font-lora font-semibold text-sm text-primary mb-1">{t('landing.demoSection.encounterBuilder.abilities')}</h5>
                          <p className="font-opensans text-xs text-foreground mb-2">
                            <span className="font-semibold">{t('landing.demoSection.encounterBuilder.snowCamouflage')}:</span> {t('landing.demoSection.encounterBuilder.snowCamouflageDesc')}
                          </p>
                          <p className="font-opensans text-xs text-foreground">
                            <span className="font-semibold">{t('landing.demoSection.encounterBuilder.keenSenses')}:</span> {t('landing.demoSection.encounterBuilder.keenSensesDesc')}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-lora font-semibold text-sm text-primary mb-1">{t('landing.demoSection.encounterBuilder.actions')}</h5>
                          <p className="font-opensans text-xs text-foreground mb-2">
                            <span className="font-semibold">{t('landing.demoSection.encounterBuilder.bite')}:</span> {t('landing.demoSection.encounterBuilder.biteDesc')}
                          </p>
                          <p className="font-opensans text-xs text-foreground">
                            <span className="font-semibold">{t('landing.demoSection.encounterBuilder.coldBreath')}:</span> {t('landing.demoSection.encounterBuilder.coldBreathDesc')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 border-t border-secondary/20 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-opensans text-sm">{t('landing.demoSection.encounterBuilder.quantity')}</span>
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
                          <img src="/assets/ice-mephit.png" alt="Ice Mephit" className="w-12 h-12 object-cover rounded-md mr-3" />
                          <div>
                            <h4 className="font-lora font-semibold text-lg text-primary">{t('landing.demoSection.encounterBuilder.creatures.iceMephit')}</h4>
                            <p className="font-opensans text-xs text-foreground/70">{t('landing.demoSection.encounterBuilder.creatures.iceMephitType')}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="text-center">
                            <span className="font-opensans text-xs text-foreground/70 block">{t('landing.demoSection.encounterBuilder.cr')}</span>
                            <span className="font-opensans font-semibold text-primary">1/2</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">{t('landing.demoSection.encounterBuilder.hp')}</span>
                            <span className="font-opensans font-semibold text-primary">21</span>
                          </div>
                          <div className="text-center ml-3">
                            <span className="font-opensans text-xs text-foreground/70 block">{t('landing.demoSection.encounterBuilder.ac')}</span>
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
                          <span className="font-opensans text-sm">{t('landing.demoSection.encounterBuilder.quantity')}</span>
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
                        <h4 className="font-lora font-semibold text-md text-primary mb-1">{t('landing.demoSection.encounterBuilder.encounterSummary')}</h4>
                        <p className="font-opensans text-sm text-foreground">
                          <span className="font-semibold">{t('landing.demoSection.encounterBuilder.totalXP')}:</span> 2,000 XP
                        </p>
                        <p className="font-opensans text-sm text-foreground">
                          <span className="font-semibold">{t('landing.demoSection.encounterBuilder.difficultyLevel')}:</span> {t('landing.demoSection.encounterBuilder.difficulties.medium')} for 3 Level 5 players
                        </p>
                      </div>
                      <button className="text-sm bg-primary text-white px-4 py-2 rounded magic-button">
                        <i className="ri-save-line mr-1"></i> {t('landing.demoSection.encounterBuilder.saveEncounter')}
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
