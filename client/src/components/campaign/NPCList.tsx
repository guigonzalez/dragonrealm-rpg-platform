import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Npc } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pen, Trash2, Plus, User2, Eye, ArrowLeft, MapPin, Shield, Map, Sword, Brain, FileText, Heart } from "lucide-react";

import NPCCreator from "./NPCCreator";
import NPCViewer from "./NPCViewer";
import { TruncatedText } from "@/components/ui/truncated-text";

const ROLE_COLORS = {
  ally: "bg-green-600 hover:bg-green-700",
  villain: "bg-red-600 hover:bg-red-700",
  obstacle: "bg-amber-600 hover:bg-amber-700",
  curiosity: "bg-blue-600 hover:bg-blue-700",
  neutral: "bg-slate-600 hover:bg-slate-700",
  Aliada: "bg-green-600 hover:bg-green-700",
  Vilão: "bg-red-600 hover:bg-red-700",
  Obstáculo: "bg-amber-600 hover:bg-amber-700",
  Neutro: "bg-slate-600 hover:bg-slate-700",
  Informante: "bg-blue-600 hover:bg-blue-700",
};

interface NPCListProps {
  campaignId: number;
}

export default function NPCList({ campaignId }: NPCListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showCreator, setShowCreator] = useState(false);
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null);
  const [viewingNpc, setViewingNpc] = useState<Npc | null>(null);

  // Fetch NPCs
  const { data: npcs = [], isLoading, isError } = useQuery<Npc[]>({
    queryKey: [`/api/campaigns/${campaignId}/npcs`],
    staleTime: 10000,
  });

  // Mutação para excluir NPCs
  const deleteNpcMutation = useMutation({
    mutationFn: async (npcId: number) => {
      await apiRequest("DELETE", `/api/npcs/${npcId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/npcs`] });
      toast({
        title: t("npc.deleteSuccess.title"),
        description: t("npc.deleteSuccess.description"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("npc.deleteError.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handlers
  const handleStartCreate = () => {
    setEditingNpc(null);
    setShowCreator(true);
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
    setEditingNpc(null);
  };

  // Exclusão de um NPC
  const handleDelete = (npc: Npc) => {
    deleteNpcMutation.mutate(npc.id);
  };

  // Visualização de um NPC
  const handleView = (npc: Npc) => {
    setViewingNpc(npc);
  };
  
  // Edição de um NPC
  const handleEdit = (npc: Npc) => {
    setEditingNpc(npc);
    setShowCreator(true);
  };

  const handleCloseViewer = () => {
    setViewingNpc(null);
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
      <NPCCreator
        campaignId={campaignId}
        onClose={handleCloseCreator}
        editingNpc={editingNpc}
        onSuccess={() => setShowCreator(false)}
      />
    );
  }

  if (viewingNpc) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleCloseViewer} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
          <h2 className="text-2xl font-bold font-lora text-primary">
            {t("npc.viewNpc")}
          </h2>
          <div className="w-28"></div> {/* Espaçador para alinhar o título */}
        </div>

        <NPCViewer npc={viewingNpc} onClose={handleCloseViewer} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-lora text-primary">
          {t("npc.npcs")}
        </h2>
        <Button onClick={handleStartCreate}>
          <Plus className="mr-2 h-4 w-4" /> {t("common.create")}
        </Button>
      </div>

      {npcs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">
              {t("npc.noNpcs")}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              {t("npc.noNpcsDesc")}
            </p>
            <Button onClick={handleStartCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" /> {t("common.create")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {npcs.map((npc) => (
              <Card 
                key={npc.id} 
                className="overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 border-l-4" 
                style={{ borderLeftColor: npc.role && ROLE_COLORS[npc.role as keyof typeof ROLE_COLORS] ? 
                  (ROLE_COLORS[npc.role as keyof typeof ROLE_COLORS].split(' ')[0]) : 'rgb(71, 85, 105)' }}
              >
                <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="font-lora">{npc.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <CardDescription>
                            {t("npc.npc")}
                          </CardDescription>
                          {npc.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{npc.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
                </CardHeader>

                <CardContent className="pt-3 pb-3 flex-grow grid grid-cols-1 gap-2">
                  {/* Atributos principais */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* CA a partir das notas */}
                    {npc.notes && npc.notes.includes("CA:") && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-md flex items-center">
                        <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-1" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          CA: {npc.notes.split("CA:")[1].split("\n")[0].trim()}
                        </span>
                      </div>
                    )}
                    
                    {/* HP do campo específico ou das notas */}
                    {(npc.healthPoints || (npc.notes && npc.notes.includes("Vida/Resistência:"))) && (
                      <div className="bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-md flex items-center">
                        <Heart className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mr-1" />
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                          HP: {npc.healthPoints || 
                              (npc.notes && npc.notes.includes("Vida/Resistência:") ? 
                               npc.notes.split("Vida/Resistência:")[1].split("\n")[0].trim() : "")}
                        </span>
                      </div>
                    )}
                    
                    {/* Atributos de força */}
                    {npc.strength && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md">
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">FOR: {npc.strength}</span>
                      </div>
                    )}
                    
                    {/* Atributos de destreza */}
                    {npc.dexterity && (
                      <div className="bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-md">
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">DES: {npc.dexterity}</span>
                      </div>
                    )}
                    
                    {/* Atributos de inteligência */}
                    {npc.intelligence && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-md">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">INT: {npc.intelligence}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Informações do personagem */}
                  {npc.motivation && (
                    <div className="flex items-start gap-1">
                      <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <TruncatedText
                        text={npc.motivation}
                        className="text-sm"
                        maxLength={55}
                      />
                    </div>
                  )}

                  {npc.abilities && (
                    <div className="flex items-start gap-1">
                      <Sword className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <TruncatedText
                        text={npc.abilities}
                        className="text-sm"
                        maxLength={55}
                      />
                    </div>
                  )}

                  {npc.memorableTrait && (
                    <div className="flex items-start gap-1">
                      <Map className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <TruncatedText
                        text={npc.memorableTrait}
                        className="text-sm"
                        maxLength={55}
                      />
                    </div>
                  )}
                  
                  {npc.notes && (
                    <div className="flex items-start gap-1">
                      <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <TruncatedText
                        text={npc.notes}
                        className="text-sm"
                        maxLength={55}
                      />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-end gap-2 pt-2 bg-slate-50/50 dark:bg-slate-900/30">
                  <Button variant="ghost" size="sm" onClick={() => handleView(npc)} className="text-primary">
                    <Eye className="h-4 w-4 mr-1" /> {t("common.view")}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => handleEdit(npc)}>
                    <Pen className="h-4 w-4 mr-1" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-9 px-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("common.deleteWarning", { item: npc.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(npc)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("common.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}