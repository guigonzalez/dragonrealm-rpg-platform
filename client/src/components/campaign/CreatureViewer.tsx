import { useTranslation } from "react-i18next";
import { Creature } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skull } from "lucide-react";

type CreatureViewerProps = {
  creature: Creature;
  onClose?: () => void;
};

export default function CreatureViewer({ creature, onClose = () => {} }: CreatureViewerProps) {
  const { t } = useTranslation();

  // Função para extrair atributos do formato legado
  const getAttributesFromString = (attrString?: string) => {
    if (!attrString) return null;
    
    // Parse do formato "FOR:18 DES:10 CON:16 INT:12 SAB:14 CAR:10"
    const attrs: Record<string, string> = {};
    const matches = attrString.match(/(\w+):(\d+|-)/g) || [];
    
    matches.forEach(match => {
      const [key, value] = match.split(':');
      attrs[key] = value;
    });
    
    return attrs;
  };
  
  // Função para determinar a classe de cor com base no valor do atributo
  const getAttrColorClass = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return "text-gray-400";
    if (numValue >= 18) return "text-green-600 font-bold";
    if (numValue >= 14) return "text-green-500";
    if (numValue >= 10) return "text-gray-600";
    if (numValue >= 8) return "text-amber-500";
    return "text-red-500";
  };
  
  // Extrai atributos se disponíveis
  const attributes = getAttributesFromString(creature.memorableTrait);
  
  // Obter os valores de atributos das propriedades específicas ou do campo legado
  const str = creature.strength || (attributes && attributes['FOR']) || '-';
  const dex = creature.dexterity || (attributes && attributes['DES']) || '-';
  const con = creature.constitution || (attributes && attributes['CON']) || '-';
  const int = creature.intelligence || (attributes && attributes['INT']) || '-';
  const wis = creature.wisdom || (attributes && attributes['SAB']) || '-';
  const cha = creature.charisma || (attributes && attributes['CAR']) || '-';
  
  // Extrair informações do campo notes se disponível
  const getNotesInfo = () => {
    if (!creature.notes) return { healthPoints: null, plotHooks: null, relationships: null };
    
    const healthMatch = creature.notes.match(/Vida\/Resistência: ([^\\n]+)/);
    const plotHooksMatch = creature.notes.match(/Ganchos: ([^\\n]+)/);
    const relationshipsMatch = creature.notes.match(/Relações: ([^\\n]+)/);
    
    return {
      healthPoints: healthMatch ? healthMatch[1] : null,
      plotHooks: plotHooksMatch ? plotHooksMatch[1] : null,
      relationships: relationshipsMatch ? relationshipsMatch[1] : null
    };
  };
  
  const notesInfo = getNotesInfo();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Skull className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-lora">{creature.name}</CardTitle>
              <CardDescription>
                {t("creature.creature")}
                {creature.role && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 bg-primary/10 text-primary border-primary/20"
                  >
                    {t(`creature.roleOptions.${creature.role}`)}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seção de informações básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-lora text-primary">
            {t("creature.basicInfo")}
          </h3>
          
          {/* Motivation */}
          {creature.motivation && (
            <div>
              <h4 className="text-sm font-medium mb-1">{t("creature.motivation")}</h4>
              <p className="text-muted-foreground">{creature.motivation}</p>
            </div>
          )}
          
          {/* Relationships */}
          {(creature.relationships || notesInfo.relationships) && (
            <div>
              <h4 className="text-sm font-medium mb-1">{t("creature.relationships")}</h4>
              <p className="text-muted-foreground">
                {creature.relationships || notesInfo.relationships}
              </p>
            </div>
          )}
          
          {/* Plot Hooks */}
          {(creature.plotHooks || notesInfo.plotHooks) && (
            <div>
              <h4 className="text-sm font-medium mb-1">{t("creature.plotHooks")}</h4>
              <p className="text-muted-foreground">
                {creature.plotHooks || notesInfo.plotHooks}
              </p>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Seção de combate */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold font-lora text-primary">
            {t("creature.combatInfo")}
          </h3>
          
          {/* Health Points */}
          {(creature.healthPoints || notesInfo.healthPoints) && (
            <div>
              <h4 className="text-sm font-medium mb-1">{t("creature.healthPoints")}</h4>
              <p className="text-muted-foreground">
                {creature.healthPoints || notesInfo.healthPoints}
              </p>
            </div>
          )}
          
          {/* Threat Level */}
          {creature.threatLevel && (
            <div>
              <h4 className="text-sm font-medium mb-1">{t("creature.threatLevel")}</h4>
              <p className="text-muted-foreground">
                {t(`creature.threatLevelOptions.${creature.threatLevel}`)}
              </p>
            </div>
          )}
          
          {/* Attributes */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t("creature.attributes")}</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center bg-background rounded-md p-2 border">
                <span className="text-xs uppercase text-muted-foreground">FOR</span>
                <span className={`text-lg ${getAttrColorClass(str)}`}>{str}</span>
              </div>
              <div className="flex flex-col items-center bg-background rounded-md p-2 border">
                <span className="text-xs uppercase text-muted-foreground">DES</span>
                <span className={`text-lg ${getAttrColorClass(dex)}`}>{dex}</span>
              </div>
              <div className="flex flex-col items-center bg-background rounded-md p-2 border">
                <span className="text-xs uppercase text-muted-foreground">CON</span>
                <span className={`text-lg ${getAttrColorClass(con)}`}>{con}</span>
              </div>
              <div className="flex flex-col items-center bg-background rounded-md p-2 border">
                <span className="text-xs uppercase text-muted-foreground">INT</span>
                <span className={`text-lg ${getAttrColorClass(int)}`}>{int}</span>
              </div>
              <div className="flex flex-col items-center bg-background rounded-md p-2 border">
                <span className="text-xs uppercase text-muted-foreground">SAB</span>
                <span className={`text-lg ${getAttrColorClass(wis)}`}>{wis}</span>
              </div>
              <div className="flex flex-col items-center bg-background rounded-md p-2 border">
                <span className="text-xs uppercase text-muted-foreground">CAR</span>
                <span className={`text-lg ${getAttrColorClass(cha)}`}>{cha}</span>
              </div>
            </div>
          </div>
          
          {/* Abilities */}
          {creature.abilities && (
            <div>
              <h4 className="text-sm font-medium mb-1">{t("creature.abilities")}</h4>
              <p className="text-muted-foreground">{creature.abilities}</p>
            </div>
          )}
          
          {/* Special Abilities */}
          {creature.specialAbilities && (
            <div>
              <h4 className="text-sm font-medium mb-1">{t("creature.specialAbilities")}</h4>
              <p className="text-muted-foreground">{creature.specialAbilities}</p>
            </div>
          )}
        </div>
        
        {/* Informações adicionais */}
        {creature.notes && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold font-lora text-primary">
                {t("creature.additionalInfo")}
              </h3>
              <div>
                <h4 className="text-sm font-medium mb-1">{t("creature.notes")}</h4>
                <div className="text-muted-foreground whitespace-pre-line">{creature.notes}</div>
              </div>
            </div>
          </>
        )}
        
        {/* Footer button */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}