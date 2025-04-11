import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type Npc } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, User2, Skull } from "lucide-react";

interface NPCViewerProps {
  npc: Npc;
  onClose: () => void;
}

const ROLE_COLORS = {
  ally: "bg-green-600 hover:bg-green-700",
  villain: "bg-red-600 hover:bg-red-700",
  obstacle: "bg-amber-600 hover:bg-amber-700",
  informant: "bg-blue-600 hover:bg-blue-700",
  curiosity: "bg-blue-600 hover:bg-blue-700",
  neutral: "bg-slate-600 hover:bg-slate-700",
};

export default function NPCViewer({ npc, onClose }: NPCViewerProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  // Função para processar o caminho da imagem
  const getImagePath = () => {
    if (!npc.imageUrl) return undefined;
    
    if (npc.imageUrl.startsWith("data:")) {
      return npc.imageUrl;
    } else if (npc.imageUrl.startsWith("/")) {
      return npc.imageUrl;
    } else {
      return `/${npc.imageUrl}`;
    }
  };

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

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {npc.motivation && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{t("npc.motivation")}</h3>
                <p>{npc.motivation}</p>
              </div>
            )}

            {npc.abilities && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{t("npc.abilities")}</h3>
                <p>{npc.abilities}</p>
              </div>
            )}

            {npc.specialAbilities && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{t("npc.specialAbilities", "Habilidades Especiais")}</h3>
                <p>{npc.specialAbilities}</p>
              </div>
            )}

            {npc.notes && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{t("npc.notes")}</h3>
                <p className="whitespace-pre-line">{npc.notes}</p>
              </div>
            )}

            {/* Atributos apenas para criaturas ou se existirem */}
            {(npc.entityType === "creature" || npc.strength || npc.dexterity || npc.constitution || 
             npc.intelligence || npc.wisdom || npc.charisma || npc.healthPoints) && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{t("character.abilities")}</h3>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {npc.strength && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">{t("character.strength")}</div>
                      <div className="font-semibold">{npc.strength}</div>
                    </div>
                  )}
                  {npc.dexterity && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">{t("character.dexterity")}</div>
                      <div className="font-semibold">{npc.dexterity}</div>
                    </div>
                  )}
                  {npc.constitution && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">{t("character.constitution")}</div>
                      <div className="font-semibold">{npc.constitution}</div>
                    </div>
                  )}
                  {npc.intelligence && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">{t("character.intelligence")}</div>
                      <div className="font-semibold">{npc.intelligence}</div>
                    </div>
                  )}
                  {npc.wisdom && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">{t("character.wisdom")}</div>
                      <div className="font-semibold">{npc.wisdom}</div>
                    </div>
                  )}
                  {npc.charisma && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">{t("character.charisma")}</div>
                      <div className="font-semibold">{npc.charisma}</div>
                    </div>
                  )}
                </div>

                {npc.healthPoints && (
                  <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-center mb-2">
                    <div className="text-xs text-muted-foreground">{t("character.hitPoints")}</div>
                    <div className="font-semibold text-red-600 dark:text-red-400">{npc.healthPoints}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Imagem */}
            {npc.imageUrl && !imageError ? (
              <div className="rounded-md overflow-hidden border">
                <img 
                  src={getImagePath()} 
                  alt={npc.name} 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem:", npc.imageUrl);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                {npc.entityType === "creature" ? (
                  <Skull className="h-20 w-20 text-slate-400" />
                ) : (
                  <User2 className="h-20 w-20 text-slate-400" />
                )}
              </div>
            )}

            {npc.memorableTrait && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{t("npc.memorableTrait")}</h3>
                <p>{npc.memorableTrait}</p>
              </div>
            )}

            {/* Campos opcionais que podem não estar no banco de dados ainda */}
            {/* Campo relationships removido pois não existe no banco de dados */}

            {npc.plotHooks && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">{t("npc.plotHooks", "Ganchos de História")}</h3>
                <p className="whitespace-pre-line">{npc.plotHooks}</p>
              </div>
            )}
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