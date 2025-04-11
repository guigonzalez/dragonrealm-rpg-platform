import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Creature } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TruncatedText } from "@/components/ui/truncated-text";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pen, Trash2, Plus, Skull, Eye, ArrowLeft, Shield, Heart, Swords, Zap } from "lucide-react";

import CreatureCreator from "./CreatureCreator";
import CreatureViewer from "./CreatureViewer";

const ROLE_COLORS = {
  ally: "bg-green-600 hover:bg-green-700",
  villain: "bg-red-600 hover:bg-red-700",
  obstacle: "bg-amber-600 hover:bg-amber-700",
  curiosity: "bg-blue-600 hover:bg-blue-700",
  neutral: "bg-slate-600 hover:bg-slate-700",
};

interface CreatureListProps {
  campaignId: number;
}

export default function CreatureList({ campaignId }: CreatureListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showCreator, setShowCreator] = useState(false);
  const [editingCreature, setEditingCreature] = useState<Creature | null>(null);
  const [viewingCreature, setViewingCreature] = useState<Creature | null>(null);

  // Fetch Creatures
  const { data: creatures = [], isLoading, isError } = useQuery<Creature[]>({
    queryKey: [`/api/campaigns/${campaignId}/creatures`],
    staleTime: 10000,
  });
  
  // Mutação para excluir Criaturas
  const deleteCreatureMutation = useMutation({
    mutationFn: async (creatureId: number) => {
      await apiRequest("DELETE", `/api/creatures/${creatureId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/creatures`] });
      toast({
        title: t("creature.deleteSuccess.title"),
        description: t("creature.deleteSuccess.description"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("creature.deleteError.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleStartCreate = () => {
    setEditingCreature(null);
    setShowCreator(true);
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
    setEditingCreature(null);
  };

  // Exclusão de uma criatura
  const handleDelete = (creature: Creature) => {
    deleteCreatureMutation.mutate(creature.id);
  };

  // Visualização de uma criatura
  const handleView = (creature: Creature) => {
    setViewingCreature(creature);
  };
  
  // Edição de uma criatura
  const handleEdit = (creature: Creature) => {
    setEditingCreature(creature);
    setShowCreator(true);
  };

  const handleCloseViewer = () => {
    setViewingCreature(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6">
        <div className="text-red-500 mb-2 text-xl">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="font-bold mb-2">{t("common.errorLoading")}</h3>
        <p className="text-muted-foreground">{t("common.tryAgainLater")}</p>
      </div>
    );
  }

  if (showCreator) {
    return (
      <CreatureCreator
        campaignId={campaignId}
        onClose={handleCloseCreator}
        editingCreature={editingCreature}
        onSuccess={() => setShowCreator(false)}
      />
    );
  }

  if (viewingCreature) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleCloseViewer} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
          <h2 className="text-2xl font-bold font-lora text-primary">
            {t("creature.viewCreature")}
          </h2>
          <div className="w-28"></div> {/* Espaçador para alinhar o título */}
        </div>

        <CreatureViewer creature={viewingCreature} onClose={handleCloseViewer} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-lora text-primary">
          {t("creature.creatures")}
        </h2>
        <Button onClick={handleStartCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t("common.create")}
        </Button>
      </div>

      {creatures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Skull className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">
              {t("creature.noCreatures")}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              {t("creature.noCreaturesDesc")}
            </p>
            <Button onClick={handleStartCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" /> {t("common.create")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatures.map((creature) => {
              // Extrair tipo, CA, resistências do campo notes
              const extractInfo = (notes?: string | null) => {
                if (!notes) return { type: "", armorClass: "", resistances: "", terrain: "" };
                
                const typeMatch = notes.match(/Tipo: ([^\n]+)/);
                const acMatch = notes.match(/CA: ([^\n]+)/);
                const resistMatch = notes.match(/Resistências: ([^\n]+)/);
                
                // Captura o terreno até o final da linha ou do texto
                let terrain = "";
                const terrainMatch = notes.match(/Terreno: ([^\n]+)/);
                if (terrainMatch) {
                  terrain = terrainMatch[1].trim();
                }
                
                return {
                  type: typeMatch ? typeMatch[1].trim() : "",
                  armorClass: acMatch ? acMatch[1].trim() : "",
                  resistances: resistMatch ? resistMatch[1].trim() : "",
                  terrain: terrain
                };
              };

              // Verifica o nível de ameaça e aplica cor correspondente
              const getThreatBadge = (threatLevel?: string | null) => {
                if (!threatLevel) return null;
                
                let color = "bg-gray-500";
                let label = "Desconhecido";
                
                switch(threatLevel) {
                  case "harmless":
                    color = "bg-green-500";
                    label = "Inofensivo";
                    break;
                  case "challenging":
                    color = "bg-amber-500";
                    label = "Desafiador";
                    break;
                  case "dangerous":
                    color = "bg-orange-500";
                    label = "Perigoso";
                    break;
                  case "boss":
                    color = "bg-red-500";
                    label = "Chefe";
                    break;
                }
                
                return (
                  <Badge className={`${color} hover:${color}/90`}>
                    {label}
                  </Badge>
                );
              };
              
              // Extrai atributos do memorableTrait
              const extractAttributes = (trait?: string | null) => {
                if (!trait) return null;
                const match = trait.match(/FOR:(\S+).*DES:(\S+).*CON:(\S+).*INT:(\S+).*SAB:(\S+).*CAR:(\S+)/);
                return match ? {
                  str: match[1],
                  dex: match[2],
                  con: match[3],
                  int: match[4],
                  wis: match[5],
                  cha: match[6],
                } : null;
              };
              
              const notesInfo = extractInfo(creature.notes);
              const attributes = extractAttributes(creature.memorableTrait);
              
              return (
                <Card key={creature.id} className="overflow-hidden flex flex-col border-2 border-muted">
                  <CardHeader className="p-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Skull className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="font-lora text-lg">{creature.name}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>{notesInfo.type || "Criatura"}</span>
                          </div>
                          {creature.threatLevel && (
                            <div className="mt-1">
                              {getThreatBadge(creature.threatLevel)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7 p-0" onClick={() => handleEdit(creature)}>
                          <Pen className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-7 w-7 p-0" onClick={() => handleView(creature)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 flex-grow">
                    {/* Stats de Combate */}
                    <div className="flex justify-between items-center mb-2 bg-muted/20 p-2 rounded-md">
                      {/* PV - Pontos de Vida */}
                      <div className="flex items-center gap-1" title="Pontos de Vida">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{creature.healthPoints || '--'}</span>
                      </div>
                      
                      {/* CA - Classe de Armadura */}
                      <div className="flex items-center gap-1" title="Classe de Armadura">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{notesInfo.armorClass || '--'}</span>
                      </div>
                      
                      {/* Ataques */}
                      <div className="flex items-center gap-1" title="Ataques">
                        <Swords className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{creature.abilities ? '✓' : '–'}</span>
                      </div>
                      
                      {/* Habilidades Especiais */}
                      <div className="flex items-center gap-1" title="Habilidades Especiais">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{creature.specialAbilities ? '✓' : '–'}</span>
                      </div>
                    </div>
                    
                    {/* Atributos em grid */}
                    {attributes && (
                      <div className="grid grid-cols-6 gap-1 mb-2 text-xs">
                        <div className="flex flex-col items-center bg-muted/10 p-1 rounded">
                          <span className="font-semibold">FOR</span>
                          <span>{attributes.str}</span>
                        </div>
                        <div className="flex flex-col items-center bg-muted/10 p-1 rounded">
                          <span className="font-semibold">DES</span>
                          <span>{attributes.dex}</span>
                        </div>
                        <div className="flex flex-col items-center bg-muted/10 p-1 rounded">
                          <span className="font-semibold">CON</span>
                          <span>{attributes.con}</span>
                        </div>
                        <div className="flex flex-col items-center bg-muted/10 p-1 rounded">
                          <span className="font-semibold">INT</span>
                          <span>{attributes.int}</span>
                        </div>
                        <div className="flex flex-col items-center bg-muted/10 p-1 rounded">
                          <span className="font-semibold">SAB</span>
                          <span>{attributes.wis}</span>
                        </div>
                        <div className="flex flex-col items-center bg-muted/10 p-1 rounded">
                          <span className="font-semibold">CAR</span>
                          <span>{attributes.cha}</span>
                        </div>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    {/* Habilidades e Resumo */}
                    <div className="space-y-2">
                      {/* Habilidades (Ataques) */}
                      {creature.abilities && (
                        <div>
                          <h4 className="text-xs font-semibold text-primary mb-1">ATAQUES:</h4>
                          <TruncatedText 
                            text={creature.abilities}
                            maxLength={60}
                          />
                        </div>
                      )}
                      
                      {/* Habilidades Especiais */}
                      {creature.specialAbilities && (
                        <div>
                          <h4 className="text-xs font-semibold text-primary mb-1">HABILIDADES ESPECIAIS:</h4>
                          <TruncatedText 
                            text={creature.specialAbilities}
                            maxLength={60}
                          />
                        </div>
                      )}
                      
                      {/* Comportamento/Motivação */}
                      {creature.motivation && (
                        <div>
                          <h4 className="text-xs font-semibold text-primary mb-1">COMPORTAMENTO:</h4>
                          <TruncatedText 
                            text={creature.motivation}
                            maxLength={60}
                          />
                        </div>
                      )}
                      
                      {/* Terreno */}
                      {notesInfo.terrain && notesInfo.terrain !== '-' && (
                        <div>
                          <h4 className="text-xs font-semibold text-primary mb-1">TERRENO:</h4>
                          <TruncatedText 
                            text={notesInfo.terrain}
                            maxLength={60}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-3 flex justify-end gap-1 pt-2 border-t bg-muted/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => handleView(creature)}
                    >
                      Ver Detalhes
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("common.deleteWarning", { item: creature.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(creature)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("common.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}