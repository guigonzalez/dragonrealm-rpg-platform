import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertNpcSchema, type InsertNpc } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, X } from "lucide-react";

// Opções traduzidas diretamente do arquivo de tradução
const getRoleOptions = (t: any) => [
  { value: "ally", label: t("creature.roleOptions.ally") },
  { value: "villain", label: t("creature.roleOptions.villain") },
  { value: "obstacle", label: t("creature.roleOptions.obstacle") },
  { value: "curiosity", label: t("creature.roleOptions.curiosity") },
  { value: "neutral", label: t("creature.roleOptions.neutral") },
];

const getThreatLevelOptions = () => {
  const { t } = useTranslation();
  return [
    { value: "harmless", label: t("creature.threatLevelOptions.harmless") },
    { value: "challenging", label: t("creature.threatLevelOptions.challenging") },
    { value: "dangerous", label: t("creature.threatLevelOptions.dangerous") },
    { value: "boss", label: t("creature.threatLevelOptions.boss") },
  ];
};

// Extend schema for validation
const formSchema = insertNpcSchema.extend({
  name: z.string().min(1, "O nome é obrigatório"),
  type: z.string().optional(), // Tipo e Inteligência
  specialAbility: z.string().optional(), // Habilidade especial
  healthPoints: z.string().optional(), // PV
  armorClass: z.string().optional(), // CA
  // Atributos
  str: z.string().optional(),
  dex: z.string().optional(),
  con: z.string().optional(),
  int: z.string().optional(),
  wis: z.string().optional(),
  cha: z.string().optional(),
  attacks: z.string().optional(), // Ataques ou poderes
  resistances: z.string().optional(), // Resistências ou fraquezas
  terrain: z.string().optional(), // Terreno e contexto de aparição
  behavior: z.string().optional(), // Comportamento e motivação
  
  // Campos mantidos para compatibilidade com o esquema existente
  imageUrl: z.string().optional(),
  threatLevel: z.string().min(1, "O nível de ameaça é obrigatório"),
});

type CreatureCreatorProps = {
  campaignId?: number;
  campaign?: any;
  onClose?: () => void;
  onSuccess?: (creature: any) => void;
  editingCreature?: any; // Se fornecido, estamos editando uma Criatura existente
};

interface FormValues {
  name: string;
  campaignId: number;
  entityType: "npc" | "creature";
  
  // Novos campos do formulário
  type?: string; // Tipo e Inteligência
  specialAbility?: string; // Habilidade especial
  armorClass?: string; // CA
  attacks?: string; // Ataques ou poderes
  resistances?: string; // Resistências ou fraquezas
  terrain?: string; // Terreno e contexto de aparição
  behavior?: string; // Comportamento e motivação
  
  // Campos existentes que continuamos usando
  imageUrl?: string;
  threatLevel?: string;
  healthPoints?: string;
  str?: string;
  dex?: string;
  con?: string;
  int?: string;
  wis?: string;
  cha?: string;
  
  // Campos que serão mapeados para os novos
  role?: string;
  motivation?: string;
  relationships?: string;
  abilities?: string;
  specialAbilities?: string;
  plotHooks?: string;
  
  created: string;
  updated: string;
  
  // Campos legados para compatibilidade
  memorableTrait?: string;
  threatOrUtility?: string;
  race?: string;
  occupation?: string;
  location?: string;
  appearance?: string;
  personality?: string;
  notes?: string;
}

export default function CreatureCreator({ campaignId, campaign, onClose = () => {}, onSuccess, editingCreature }: CreatureCreatorProps) {
  // Se campaign está presente mas campaignId não, extrair o ID da campaign
  const actualCampaignId = campaignId || (campaign ? campaign.id : undefined);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    tipo: 'creature' as 'npc' | 'creature',
    campanha: '',
    nivel: '',
    terreno: '',
    estilo: ''
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingCreature?.name || "",
      campaignId: actualCampaignId,
      entityType: "creature", // Sempre criatura
      
      // Novos campos do formulário
      type: editingCreature?.type || "",
      specialAbility: editingCreature?.specialAbility || "",
      armorClass: editingCreature?.armorClass || "",
      attacks: editingCreature?.attacks || "",
      resistances: editingCreature?.resistances || "",
      terrain: editingCreature?.terrain || editingCreature?.location || "",
      behavior: editingCreature?.behavior || editingCreature?.motivation || "",
      
      // Campos mantidos
      imageUrl: editingCreature?.imageUrl || "",
      threatLevel: editingCreature?.threatLevel || "",
      healthPoints: editingCreature?.healthPoints || "",
      str: editingCreature?.strength || "",
      dex: editingCreature?.dexterity || "",
      con: editingCreature?.constitution || "",
      int: editingCreature?.intelligence || "",
      wis: editingCreature?.wisdom || "",
      cha: editingCreature?.charisma || "",
      
      // Campos legados que mapeamos para os novos
      role: editingCreature?.role || "",
      motivation: editingCreature?.motivation || "",
      relationships: editingCreature?.relationships || "",
      abilities: editingCreature?.abilities || "",
      specialAbilities: editingCreature?.specialAbilities || "",
      plotHooks: editingCreature?.plotHooks || "",
      
      created: editingCreature?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
    }
  });
  
  useEffect(() => {
    if (editingCreature) {
      // Forçar entityType para "creature" independente do valor existente
      form.setValue("entityType", "creature");
    }
  }, [editingCreature, form]);
  
  // Mutation para criar ou atualizar
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCreature) {
        // Atualizar criatura existente
        return await apiRequest("PUT", `/api/creatures/${editingCreature.id}`, data);
      } else {
        // Criar nova criatura
        return await apiRequest("POST", `/api/creatures`, data);
      }
    },
    onSuccess: async (response) => {
      const creature = await response.json();
      setIsSubmitting(false);
      
      toast({
        title: editingCreature 
          ? t("creature.updateSuccess.title") 
          : t("creature.createSuccess.title"),
        description: editingCreature 
          ? t("creature.updateSuccess.description") 
          : t("creature.createSuccess.description"),
      });
      
      // Invalidar queries relevantes
      if (actualCampaignId) {
        queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${actualCampaignId}/creatures`] });
        queryClient.invalidateQueries({ queryKey: [`/api/creatures/${editingCreature?.id}`] });
      }
      
      if (onSuccess) {
        onSuccess(creature);
      }
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: editingCreature
          ? t("creature.updateError.title")
          : t("creature.createError.title"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Função para gerar uma criatura com o OpenAI
  const generateCreature = async () => {
    setIsGenerating(true);
    
    try {
      // Obter opções de geração dos inputs
      const options = {
        tipo: 'creature' as 'npc' | 'creature',
        campanha: generationOptions.campanha,
        nivel: generationOptions.nivel,
        terreno: generationOptions.terreno,
        estilo: generationOptions.estilo,
        // Passar o ID da campanha para permitir que a API busque informações contextuais
        campaignId: actualCampaignId
      };
      
      // Fazer requisição para a API de geração
      const response = await apiRequest("POST", "/api/generate-npc", options);
      
      const data = await response.json();
      console.log("Criatura gerada:", data);
      
      // Preencher o formulário com os dados gerados
      form.setValue("name", data.name || "");
      
      // Mapeamos os campos da API para os novos campos do formulário
      form.setValue("type", data.race || "Monstro");
      form.setValue("specialAbility", Array.isArray(data.specialAbilities) ? 
                    data.specialAbilities.join('\n') : data.specialAbilities || "");
      form.setValue("behavior", data.motivation || "");
      form.setValue("terrain", data.location || "");
      form.setValue("attacks", data.abilities || "");
      form.setValue("resistances", ""); // A API não retorna este campo específico
      
      // Nível de ameaça
      form.setValue("threatLevel", data.threatLevel?.toLowerCase().includes("perigoso") ? "dangerous" : 
                         data.threatLevel?.toLowerCase().includes("chefe") ? "boss" :
                         data.threatLevel?.toLowerCase().includes("desafiador") ? "challenging" : "harmless");
      
      // Atributos de combate
      form.setValue("healthPoints", data.healthPoints ? String(data.healthPoints) : "");
      form.setValue("armorClass", "14"); // Valor padrão, a API não retorna este campo
      
      // Atributos
      form.setValue("str", data.strength ? String(data.strength) : "");
      form.setValue("dex", data.dexterity ? String(data.dexterity) : "");
      form.setValue("con", data.constitution ? String(data.constitution) : "");
      form.setValue("int", data.intelligence ? String(data.intelligence) : "");
      form.setValue("wis", data.wisdom ? String(data.wisdom) : "");
      form.setValue("cha", data.charisma ? String(data.charisma) : "");
      
      toast({
        title: "Criatura gerada com sucesso!",
        description: "Os campos foram preenchidos automaticamente. Você pode editar conforme necessário.",
      });
    } catch (error) {
      console.error("Erro ao gerar criatura:", error);
      toast({
        title: "Erro ao gerar criatura",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    // Mapear valores novos para a estrutura de dados existente
    let threatOrUtility = "";
    switch(values.threatLevel) {
      case "dangerous":
        threatOrUtility = "potential_enemy";
        break;
      case "boss":
        threatOrUtility = "potential_enemy,unique_abilities";
        break;
      case "challenging":
        threatOrUtility = "potential_enemy";
        break;
      case "harmless":
        threatOrUtility = "";
        break;
    }
    
    // String formatada com atributos para campo legado
    const attrString = `FOR:${values.str || '-'} DES:${values.dex || '-'} CON:${values.con || '-'} INT:${values.int || '-'} SAB:${values.wis || '-'} CAR:${values.cha || '-'}`;
    
    // Criar objeto para enviar para API
    const submitData = {
      // Campos obrigatórios
      campaignId: actualCampaignId,
      name: values.name,
      
      // Este campo pode conter informações sobre atributos de combate e resistências
      notes: `Tipo: ${values.type || '-'}\nCA: ${values.armorClass || '-'}\nPV: ${values.healthPoints || '-'}\nResistências: ${values.resistances || '-'}\nTerreno: ${values.terrain || '-'}`,
      
      // Mapeamos os novos campos para campos existentes
      race: values.type || "",  // Tipo e Inteligência no campo race
      appearance: values.specialAbility || "", // Habilidade especial no campo appearance
      personality: values.behavior || "", // Comportamento no campo personality
      occupation: "", // Mantém vazio para compatibilidade
      location: values.terrain || "", // Terreno no campo location
      
      // Campos adicionados ao esquema
      imageUrl: values.imageUrl || "",
      motivation: values.behavior || "", // Comportamento e motivação no campo motivation
      
      // Força entityType como "creature"
      entityType: "creature",
      
      // Mapeamos os novos campos para campos existentes
      abilities: values.attacks || "", // Ataques ou poderes no campo abilities
      
      // Campos específicos para os atributos
      strength: values.str || null,
      dexterity: values.dex || null,
      constitution: values.con || null,
      intelligence: values.int || null,
      wisdom: values.wis || null,
      charisma: values.cha || null,
      healthPoints: values.healthPoints || null,
      threatLevel: values.threatLevel || null,
      specialAbilities: values.specialAbility || null, // Habilidade especial
      
      // Campos de data
      updated: new Date().toISOString(),
      
      // Armazenando outros dados em campos existentes para manter a compatibilidade
      memorableTrait: attrString, // Atributos no campo memorableTrait
      threatOrUtility: threatOrUtility, // Nível de ameaça no campo threatOrUtility
      
      // Campos que existem no backend mas não aparecem no formulário
      relationships: values.terrain || "", // Usando terreno como relacionamentos (contextual)
      plotHooks: "", // Removemos os plot hooks do formulário
    };
    
    // Se criando nova criatura, adiciona a data de criação
    if (!editingCreature) {
      // @ts-ignore - ignorar erro de tipo aqui
      submitData.created = new Date().toISOString();
    }
    
    console.log("Enviando dados:", submitData);
    
    // @ts-ignore - ignorar erro de tipo aqui
    mutation.mutate(submitData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-lora text-primary">
            {editingCreature ? t("creature.editCreature") : t("creature.createCreature")}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Ficha de Criatura</h3>
              
              {/* Nome da Criatura */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Criatura</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Gárgula Flamejante" {...field} />
                    </FormControl>
                    <FormDescription>Nome único e memorável da criatura</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Tipo e Inteligência */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo e Inteligência</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Monstro, Inteligente/Racional ou Besta, Instintiva" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Descreve a natureza e nível de inteligência da criatura</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Habilidade Especial */}
              <FormField
                control={form.control}
                name="specialAbility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habilidade Especial</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Explode ao morrer, causa medo ao rugir, se teleporta entre sombras"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Poderes únicos que definem a criatura</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Atributos de Combate</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* PV */}
                  <FormField
                    control={form.control}
                    name="healthPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PV (Pontos de Vida)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 75" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* CA */}
                  <FormField
                    control={form.control}
                    name="armorClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CA (Classe de Armadura)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 16" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Atributos - FOR/DES/CON/INT/SAB/CAR */}
                <div>
                  <FormLabel>Atributos</FormLabel>
                  <FormDescription className="mb-2">Preencha apenas os essenciais para a cena</FormDescription>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    <FormField
                      control={form.control}
                      name="str"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">FOR</FormLabel>
                          <FormControl>
                            <Input placeholder="10" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">DES</FormLabel>
                          <FormControl>
                            <Input placeholder="10" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="con"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">CON</FormLabel>
                          <FormControl>
                            <Input placeholder="10" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="int"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">INT</FormLabel>
                          <FormControl>
                            <Input placeholder="10" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="wis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">SAB</FormLabel>
                          <FormControl>
                            <Input placeholder="10" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">CAR</FormLabel>
                          <FormControl>
                            <Input placeholder="10" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Ataques ou poderes */}
              <FormField
                control={form.control}
                name="attacks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ataques ou poderes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Garras +5 (2d6+2), Bola de Fogo 3x/dia"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Ações ofensivas da criatura</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Resistências ou fraquezas */}
              <FormField
                control={form.control}
                name="resistances"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resistências ou fraquezas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Imune a fogo, vulnerável a dano radiante"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Defesas e vulnerabilidades da criatura</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Terreno e contexto */}
              <FormField
                control={form.control}
                name="terrain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terreno e contexto de aparição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Cripta ancestral cheia de armadilhas, floresta densa e escura"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Ambiente natural e onde essa criatura costuma ser encontrada</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Comportamento e motivação */}
              <FormField
                control={form.control}
                name="behavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comportamento e motivação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Protege um artefato, quer vingança contra elfos, odeia intrusos"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>O que leva a criatura a agir e como ela se comporta</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Campo oculto de Nível de Ameaça (obrigatório) */}
              <FormField
                control={form.control}
                name="threatLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Ameaça</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha o nível de ameaça" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getThreatLevelOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Seção para geração por IA */}
            <div className="pb-4">
              <h3 className="text-lg font-semibold mb-4">Geração por IA</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  placeholder="Campanha (ex: D&D, Fantasia Medieval...)"
                  value={generationOptions.campanha}
                  onChange={(e) => setGenerationOptions({...generationOptions, campanha: e.target.value})}
                />
                <Input
                  placeholder="Nível de desafio (ex: Fácil, Difícil...)"
                  value={generationOptions.nivel}
                  onChange={(e) => setGenerationOptions({...generationOptions, nivel: e.target.value})}
                />
                <Input
                  placeholder="Terreno/Ambiente (ex: Floresta, Caverna...)"
                  value={generationOptions.terreno}
                  onChange={(e) => setGenerationOptions({...generationOptions, terreno: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Estilo (ex: Horror, Magia Elemental...)"
                  value={generationOptions.estilo}
                  onChange={(e) => setGenerationOptions({...generationOptions, estilo: e.target.value})}
                />
                <Button 
                  type="button" 
                  onClick={generateCreature} 
                  disabled={isGenerating}
                  className="magic-button"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    "Gerar Criatura com IA"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="magic-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingCreature ? "Atualizar" : "Criar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}