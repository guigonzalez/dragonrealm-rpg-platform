import { useTranslation } from "react-i18next";
import { type Npc, type Creature } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, User2, Skull, MapPin, Brain, 
  Sword, Shield, Flag, Scroll, Heart, 
  Footprints, Dices, FlaskConical, 
  BookOpen, Eye
} from "lucide-react";

interface NPCViewerProps {
  npc: Npc | Creature;
  onClose: () => void;
}

const ROLE_COLORS = {
  ally: "bg-green-600 hover:bg-green-700",
  villain: "bg-red-600 hover:bg-red-700",
  obstacle: "bg-amber-600 hover:bg-amber-700",
  informant: "bg-blue-600 hover:bg-blue-700",
  curiosity: "bg-blue-600 hover:bg-blue-700",
  neutral: "bg-slate-600 hover:bg-slate-700",
  Aliada: "bg-green-600 hover:bg-green-700",
  Vilão: "bg-red-600 hover:bg-red-700",
  Obstáculo: "bg-amber-600 hover:bg-amber-700",
  Neutro: "bg-slate-600 hover:bg-slate-700",
  Informante: "bg-blue-600 hover:bg-blue-700",
};

export default function NPCViewer({ npc, onClose }: NPCViewerProps) {
  const { t } = useTranslation();
  // Removido código de manipulação de imagem conforme solicitação

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              {npc.entityType === "creature" ? (
                <Skull className="h-6 w-6 text-primary" />
              ) : (
                <User2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-lora">{npc.name}</CardTitle>
            {npc.role && (
              <Badge
                variant="default"
                className={
                  ROLE_COLORS[npc.role as keyof typeof ROLE_COLORS] || "bg-slate-600 hover:bg-slate-700"
                }
              >
                {npc.role === "Neutro" ? "Neutro" : t(`npc.roleOptions.${npc.role}`) || npc.role}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-muted-foreground">
          {npc.entityType === "creature" ? t("npc.creature") : t("npc.npc")}
        </p>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Painel lateral com ícone e informações-chave */}
          <div className="md:w-1/3 space-y-4">
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center drop-shadow-sm">
              {npc.entityType === "creature" ? (
                <Skull className="h-24 w-24 text-slate-400" />
              ) : (
                <User2 className="h-24 w-24 text-slate-400" />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Estatísticas de combate destacadas */}
              {/* CA a partir das notas */}
              {npc.notes && npc.notes.includes("CA:") && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-md flex items-center col-span-1">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <div className="text-xs text-muted-foreground">{t("character.armorClass")}</div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {npc.notes.split("CA:")[1].split("\n")[0].trim()}
                    </div>
                  </div>
                </div>
              )}

              {/* HP do campo de notas ou do campo específico */}
              {(npc.healthPoints || (npc.notes && npc.notes.includes("Vida/Resistência:"))) && (
                <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded-md flex items-center col-span-1">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                  <div>
                    <div className="text-xs text-muted-foreground">{t("character.hitPoints")}</div>
                    <div className="font-semibold text-red-600 dark:text-red-400">
                      {npc.healthPoints ? 
                        `${npc.healthPoints} HP` : 
                        npc.notes!.split("Vida/Resistência:")[1].split("\n")[0].trim()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Atributos físicos */}
              {npc.strength && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">{t("character.strength")}</div>
                  <div className="font-semibold text-amber-600 dark:text-amber-400">{npc.strength}</div>
                </div>
              )}
              
              {npc.dexterity && (
                <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">{t("character.dexterity")}</div>
                  <div className="font-semibold text-green-600 dark:text-green-400">{npc.dexterity}</div>
                </div>
              )}
              
              {npc.constitution && (
                <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">{t("character.constitution")}</div>
                  <div className="font-semibold text-orange-600 dark:text-orange-400">{npc.constitution}</div>
                </div>
              )}
              
              {/* Atributos mentais */}
              {npc.intelligence && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">{t("character.intelligence")}</div>
                  <div className="font-semibold text-blue-600 dark:text-blue-400">{npc.intelligence}</div>
                </div>
              )}
              
              {npc.wisdom && (
                <div className="bg-teal-50 dark:bg-teal-950/20 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">{t("character.wisdom")}</div>
                  <div className="font-semibold text-teal-600 dark:text-teal-400">{npc.wisdom}</div>
                </div>
              )}
              
              {npc.charisma && (
                <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded-md">
                  <div className="text-xs text-muted-foreground">{t("character.charisma")}</div>
                  <div className="font-semibold text-purple-600 dark:text-purple-400">{npc.charisma}</div>
                </div>
              )}
            </div>
            
            {/* Informações básicas */}
            <div className="space-y-2 pt-2">
              {npc.race && (
                <div className="flex items-center gap-2 text-sm">
                  <Footprints className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium">{t("character.race")}:</span>
                  <span>{npc.race}</span>
                </div>
              )}
              
              {/* Verificando se é um NPC antes de exibir campos específicos de NPC */}
              {npc.entityType === "npc" && "location" in npc && npc.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium">{t("npc.location")}:</span>
                  <span>{npc.location}</span>
                </div>
              )}
              
              {npc.entityType === "npc" && "occupation" in npc && npc.occupation && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium">{t("npc.occupation")}:</span>
                  <span>{npc.occupation}</span>
                </div>
              )}
              
              {npc.threatLevel && (
                <div className="flex items-center gap-2 text-sm">
                  <Dices className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium">{t("npc.threatLevel")}:</span>
                  <span>{npc.threatLevel}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Conteúdo principal com abas */}
          <div className="md:w-2/3">
            <Tabs defaultValue="personality" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="personality" className="flex-1">
                  <Brain className="h-4 w-4 mr-2" />
                  {t("npc.personality")}
                </TabsTrigger>
                <TabsTrigger value="abilities" className="flex-1">
                  <Sword className="h-4 w-4 mr-2" />
                  {t("npc.abilities")}
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">
                  <Scroll className="h-4 w-4 mr-2" />
                  {t("npc.notes")}
                </TabsTrigger>
              </TabsList>
              
              {/* Aba de personalidade e motivações */}
              <TabsContent value="personality" className="space-y-4">
                {npc.memorableTrait && (
                  <div className="p-3 bg-primary/5 rounded-md">
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <Flag className="h-4 w-4 mr-1" /> {t("npc.memorableTrait")}
                    </h3>
                    <p className="text-sm">{npc.memorableTrait}</p>
                  </div>
                )}
                
                {npc.motivation && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <Heart className="h-4 w-4 mr-1" /> {t("npc.motivation")}
                    </h3>
                    <p className="text-sm">{npc.motivation}</p>
                  </div>
                )}
                
                {npc.entityType === "npc" && "personality" in npc && npc.personality && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <Brain className="h-4 w-4 mr-1" /> {t("npc.personality")}
                    </h3>
                    <p className="text-sm">{npc.personality}</p>
                  </div>
                )}
                
                {/* Campo para exibir qualquer informação relacionada a relacionamentos do campo "notes" */}
                {npc.notes && npc.notes.includes("Relações:") && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-1">{t("npc.relationships")}</h3>
                    <p className="text-sm whitespace-pre-line">
                      {npc.notes.split("Relações:")[1].split("\n")[0]}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              {/* Aba de habilidades */}
              <TabsContent value="abilities" className="space-y-4">
                {npc.abilities && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <Sword className="h-4 w-4 mr-1" /> {t("npc.abilities")}
                    </h3>
                    <p className="text-sm">{npc.abilities}</p>
                  </div>
                )}
                
                {npc.specialAbilities && (
                  <div className="p-3 bg-primary/5 rounded-md">
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <FlaskConical className="h-4 w-4 mr-1" /> {t("npc.specialAbilities", "Habilidades Especiais")}
                    </h3>
                    <p className="text-sm">{npc.specialAbilities}</p>
                  </div>
                )}
                
                {/* Campo para exibir informações de combate do campo "notes" */}
                {npc.notes && (npc.notes.includes("CA:") || npc.notes.includes("Vida/Resistência:")) && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <Shield className="h-4 w-4 mr-1" /> {t("npc.combatInfo", "Informações de Combate")}
                    </h3>
                    <div className="text-sm space-y-1">
                      {npc.notes.includes("CA:") && (
                        <p>
                          <strong>CA:</strong> {npc.notes.split("CA:")[1].split("\n")[0].trim()}
                        </p>
                      )}
                      {npc.notes.includes("Vida/Resistência:") && (
                        <p>
                          <strong>HP:</strong> {npc.notes.split("Vida/Resistência:")[1].split("\n")[0].trim()}
                        </p>
                      )}
                      {npc.notes.includes("Atributo-chave:") && (
                        <p>
                          <strong>Atributo-chave:</strong> {npc.notes.split("Atributo-chave:")[1].split("\n")[0].trim()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Aba de notas */}
              <TabsContent value="notes" className="space-y-4">
                {npc.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <Scroll className="h-4 w-4 mr-1" /> {t("npc.fullNotes", "Notas Completas")}
                    </h3>
                    <p className="text-sm whitespace-pre-line">{npc.notes}</p>
                  </div>
                )}
                
                {npc.appearance && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      <Eye className="h-4 w-4 mr-1" /> {t("npc.appearance")}
                    </h3>
                    <p className="text-sm">{npc.appearance}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-end p-4">
        <Button onClick={onClose}>{t("common.close")}</Button>
      </CardFooter>
    </Card>
  );
}