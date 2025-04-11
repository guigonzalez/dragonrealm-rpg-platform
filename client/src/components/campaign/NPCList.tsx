import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Npc, type Creature } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pen, Trash2, Plus, UserIcon, Swords, User2, Skull, Eye, ArrowLeft } from "lucide-react";

import NPCCreator from "./NPCCreator";
import NPCViewer from "./NPCViewer";

const ROLE_COLORS = {
  ally: "bg-green-600 hover:bg-green-700",
  villain: "bg-red-600 hover:bg-red-700",
  obstacle: "bg-amber-600 hover:bg-amber-700",
  curiosity: "bg-blue-600 hover:bg-blue-700",
  neutral: "bg-slate-600 hover:bg-slate-700",
};

interface NPCListProps {
  campaignId: number;
}

export default function NPCList({ campaignId }: NPCListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showCreator, setShowCreator] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null);
  const [viewingNpc, setViewingNpc] = useState<Npc | Creature | null>(null);

  // Fetch NPCs
  const { data: npcs = [], isLoading: npcsLoading, isError: npcsError } = useQuery<Npc[]>({
    queryKey: [`/api/campaigns/${campaignId}/npcs`],
    staleTime: 10000,
  });
  
  // Fetch Creatures
  const { data: creatures = [], isLoading: creaturesLoading, isError: creaturesError } = useQuery<Creature[]>({
    queryKey: [`/api/campaigns/${campaignId}/creatures`],
    staleTime: 10000,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
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

  // Filter NPCs based on tab
  const filteredNpcs = npcs.filter((npc) => {
    if (activeTab === "all") return true;
    if (activeTab === "npcs") return npc.entityType === "npc" || !npc.entityType;
    if (activeTab === "creatures") return npc.entityType === "creature";
    return true;
  });

  // Handle create/edit
  const handleStartCreate = () => {
    setEditingNpc(null);
    setShowCreator(true);
  };

  const handleEdit = (npc: Npc) => {
    setEditingNpc(npc);
    setShowCreator(true);
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
    setEditingNpc(null);
  };

  const handleDelete = (npcId: number) => {
    deleteMutation.mutate(npcId);
  };

  const handleView = (npc: Npc) => {
    setViewingNpc(npc);
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
            {viewingNpc.entityType === "creature" ? t("npc.viewCreature") : t("npc.viewNpc")}
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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="npcs">{t("npc.npc")}</TabsTrigger>
          <TabsTrigger value="creatures">{t("npc.creature")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredNpcs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {activeTab === "creatures" ? (
                    <Swords className="h-6 w-6 text-primary" />
                  ) : (
                    <UserIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold mb-1">
                  {activeTab === "creatures"
                    ? t("npc.noCreatures")
                    : activeTab === "npcs"
                    ? t("npc.noNpcs")
                    : t("npc.noEntities")}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mb-4">
                  {activeTab === "creatures"
                    ? t("npc.noCreaturesDesc")
                    : activeTab === "npcs"
                    ? t("npc.noNpcsDesc")
                    : t("npc.noEntitiesDesc")}
                </p>
                <Button onClick={handleStartCreate} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> {t("common.create")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNpcs.map((npc) => (
                  <Card key={npc.id} className="overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            {npc.entityType === "creature" ? (
                              <Skull className="h-5 w-5 text-primary" />
                            ) : (
                              <User2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="font-lora">{npc.name}</CardTitle>
                            <CardDescription>
                              {npc.entityType === "creature" ? t("npc.creature") : t("npc.npc")}
                            </CardDescription>
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

                    <CardContent className="pt-2 flex-grow">
                      {npc.motivation && (
                        <div className="mb-2">
                          <strong className="text-xs text-muted-foreground">{t("npc.motivation")}:</strong>
                          <p className="text-sm">{npc.motivation}</p>
                        </div>
                      )}

                      {npc.memorableTrait && (
                        <div className="mb-2">
                          <strong className="text-xs text-muted-foreground">{t("npc.memorableTrait")}:</strong>
                          <p className="text-sm">{npc.memorableTrait}</p>
                        </div>
                      )}

                      {npc.abilities && (
                        <div className="mb-2">
                          <strong className="text-xs text-muted-foreground">{t("npc.abilities")}:</strong>
                          <p className="text-sm">{npc.abilities}</p>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button variant="secondary" size="sm" onClick={() => handleView(npc)}>
                        <Eye className="h-4 w-4 mr-1" /> {t("common.view")}
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => handleEdit(npc)}>
                        <Pen className="h-4 w-4 mr-1" /> {t("common.edit")}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
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
                              onClick={() => handleDelete(npc.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}