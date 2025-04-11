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
  { value: "ally", label: t("npc.roleOptions.ally") },
  { value: "villain", label: t("npc.roleOptions.villain") },
  { value: "obstacle", label: t("npc.roleOptions.obstacle") },
  { value: "curiosity", label: t("npc.roleOptions.curiosity") },
  { value: "neutral", label: t("npc.roleOptions.neutral") },
];

const getThreatLevelOptions = () => {
  const { t } = useTranslation();
  return [
    { value: "harmless", label: t("npc.threatLevelOptions.harmless") },
    { value: "challenging", label: t("npc.threatLevelOptions.challenging") },
    { value: "dangerous", label: t("npc.threatLevelOptions.dangerous") },
    { value: "boss", label: t("npc.threatLevelOptions.boss") },
  ];
};

// Extend schema for validation
const formSchema = insertNpcSchema.extend({
  name: z.string().min(1, "O nome é obrigatório"),
  role: z.string().optional(),
  motivation: z.string().optional(),
  imageUrl: z.string().optional(),
  relationships: z.string().optional(),
  abilities: z.string().optional(),
  threatLevel: z.string().optional(),
  healthPoints: z.string().optional(),
  str: z.string().optional(),
  dex: z.string().optional(),
  con: z.string().optional(),
  int: z.string().optional(),
  wis: z.string().optional(),
  cha: z.string().optional(),
  specialAbilities: z.string().optional(),
  plotHooks: z.string().optional(),
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
  role?: string;
  motivation?: string;
  imageUrl?: string;
  relationships?: string;
  abilities?: string;
  threatLevel?: string;
  healthPoints?: string;
  str?: string;
  dex?: string;
  con?: string;
  int?: string;
  wis?: string;
  cha?: string;
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
      role: editingCreature?.role || "",
      motivation: editingCreature?.motivation || "",
      imageUrl: editingCreature?.imageUrl || "",
      relationships: editingCreature?.relationships || "",
      abilities: editingCreature?.abilities || "",
      threatLevel: editingCreature?.threatLevel || "",
      healthPoints: editingCreature?.healthPoints || "",
      str: editingCreature?.strength || "",
      dex: editingCreature?.dexterity || "",
      con: editingCreature?.constitution || "",
      int: editingCreature?.intelligence || "",
      wis: editingCreature?.wisdom || "",
      cha: editingCreature?.charisma || "",
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
        estilo: generationOptions.estilo
      };
      
      // Fazer requisição para a API de geração
      const response = await apiRequest("POST", "/api/generate-npc", options);
      
      const data = await response.json();
      console.log("Criatura gerada:", data);
      
      // Preencher o formulário com os dados gerados
      form.setValue("name", data.name || "");
      form.setValue("role", data.role || "");
      form.setValue("motivation", data.motivation || "");
      form.setValue("relationships", data.relationships || "");
      form.setValue("abilities", data.abilities || "");
      form.setValue("threatLevel", data.threatLevel?.toLowerCase().includes("perigoso") ? "dangerous" : 
                         data.threatLevel?.toLowerCase().includes("chefe") ? "boss" :
                         data.threatLevel?.toLowerCase().includes("desafiador") ? "challenging" : "harmless");
      form.setValue("healthPoints", data.healthPoints ? String(data.healthPoints) : "");
      form.setValue("str", data.strength ? String(data.strength) : "");
      form.setValue("dex", data.dexterity ? String(data.dexterity) : "");
      form.setValue("con", data.constitution ? String(data.constitution) : "");
      form.setValue("int", data.intelligence ? String(data.intelligence) : "");
      form.setValue("wis", data.wisdom ? String(data.wisdom) : "");
      form.setValue("cha", data.charisma ? String(data.charisma) : "");
      form.setValue("specialAbilities", Array.isArray(data.specialAbilities) ? data.specialAbilities.join('\n') : data.specialAbilities || "");
      form.setValue("plotHooks", Array.isArray(data.plotHooks) ? data.plotHooks.join('\n') : data.plotHooks || "");
      
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
      
      // Este campo pode conter informações sobre habilidades especiais
      // e pontos de vida em formato legível
      notes: `Vida/Resistência: ${values.healthPoints || '-'}\nGanchos: ${values.plotHooks || '-'}\nRelações: ${values.relationships || '-'}\nPapel: ${values.role || '-'}`,
      
      // Campos mantidos para compatibilidade, mesmo vazios
      race: "",       // vazio para manter compatibilidade
      appearance: values.specialAbilities || "", // usar campo appearance para habilidades especiais
      personality: "", // vazio para manter compatibilidade
      occupation: "",  // vazio para manter compatibilidade
      location: "",    // vazio para manter compatibilidade
      
      // Campos adicionados ao esquema
      imageUrl: values.imageUrl || "",
      role: values.role || "",
      motivation: values.motivation || "",
      
      // Força entityType como "creature"
      entityType: "creature",
      
      // Usamos o campo abilities existente para armazenar habilidades
      abilities: values.abilities || "",
      
      // Campos específicos para os atributos
      strength: values.str || null,
      dexterity: values.dex || null,
      constitution: values.con || null,
      intelligence: values.int || null,
      wisdom: values.wis || null,
      charisma: values.cha || null,
      healthPoints: values.healthPoints || null,
      threatLevel: values.threatLevel || null,
      specialAbilities: values.specialAbilities || null,
      
      // Campos de data
      updated: new Date().toISOString(),
      
      // Armazenando outros dados em campos existentes para manter a compatibilidade
      // Usamos o campo memorableTrait para armazenar atributos
      memorableTrait: attrString,
      // E o campo threatOrUtility para armazenar o nível de ameaça
      threatOrUtility: threatOrUtility,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da criatura" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Papel no jogo */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel no jogo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um papel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getRoleOptions(t).map(option => (
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
                
                {/* Motivação */}
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="O que motiva esta criatura?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Relacionamentos */}
                <FormField
                  control={form.control}
                  name="relationships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relacionamentos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Como esta criatura se relaciona com outros seres?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Ganchos de história */}
                <FormField
                  control={form.control}
                  name="plotHooks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ganchos de história</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Como esta criatura pode se conectar às histórias dos personagens?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Características de Combate</h3>
                
                {/* Nível de Ameaça */}
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
                
                {/* Pontos de Vida */}
                <FormField
                  control={form.control}
                  name="healthPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pontos de Vida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Atributos em 3 colunas */}
                <div>
                  <FormLabel>Atributos</FormLabel>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <FormField
                      control={form.control}
                      name="str"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">FOR</FormLabel>
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
                          <FormLabel className="text-xs">DES</FormLabel>
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
                          <FormLabel className="text-xs">CON</FormLabel>
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
                          <FormLabel className="text-xs">INT</FormLabel>
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
                          <FormLabel className="text-xs">SAB</FormLabel>
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
                          <FormLabel className="text-xs">CAR</FormLabel>
                          <FormControl>
                            <Input placeholder="10" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Habilidades */}
                <FormField
                  control={form.control}
                  name="abilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habilidades</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Que habilidades esta criatura possui?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Habilidades Especiais */}
                <FormField
                  control={form.control}
                  name="specialAbilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habilidades Especiais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Quais habilidades especiais ou únicas esta criatura possui?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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