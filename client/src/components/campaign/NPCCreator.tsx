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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, X, Upload } from "lucide-react";

// Componente reutilizável para upload de imagem
const ImageUpload = ({ imageUrl, onImageChange }: { imageUrl: string | null, onImageChange: (url: string) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Função de compressão e conversão para base64
      const compressAndConvertToBase64 = (file: File) => {
        return new Promise<string>((resolve) => {
          // Criar um elemento de imagem para redimensionar
          const img = document.createElement("img");
          img.onload = () => {
            // Criar um canvas para redimensionar
            const canvas = document.createElement("canvas");
            
            // Definir tamanho máximo (800px de largura ou altura, mantendo a proporção)
            const MAX_SIZE = 800;
            let width = img.width;
            let height = img.height;
            
            // Redimensionar mantendo a proporção se necessário
            if (width > MAX_SIZE || height > MAX_SIZE) {
              if (width > height) {
                height = Math.round(height * MAX_SIZE / width);
                width = MAX_SIZE;
              } else {
                width = Math.round(width * MAX_SIZE / height);
                height = MAX_SIZE;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar no canvas
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              
              // Converter para base64 com qualidade reduzida (0.7)
              const base64String = canvas.toDataURL("image/jpeg", 0.7);
              resolve(base64String);
            } else {
              // Fallback caso não consiga obter o contexto do canvas
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string);
              };
              reader.readAsDataURL(file);
            }
          };
          
          // Carregar a imagem
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      };
      
      const base64String = await compressAndConvertToBase64(file);
      onImageChange(base64String);
      
      toast({
        title: t("common.uploadSuccess"),
        description: "Imagem carregada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: t("common.uploadError"),
        description: "Não foi possível carregar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {imageUrl ? (
        <div className="relative w-full max-w-xs">
          <img 
            src={imageUrl} 
            alt="Character" 
            className="w-full h-48 object-cover rounded-md" 
          />
          <div className="flex gap-2 mt-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                document.getElementById('npc-image-upload')?.click();
              }}
            >
              {t("campaign.changeCampaignImage")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => onImageChange("")}
            >
              {t("common.removeImage")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-primary/20 rounded-md p-6 w-full max-w-xs text-center hover:border-primary/40 transition-colors">
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Envie uma imagem para seu personagem</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-2"
              disabled={isUploading}
              onClick={() => {
                document.getElementById('npc-image-upload')?.click();
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.uploading")}
                </>
              ) : (
                "Escolher imagem"
              )}
            </Button>
          </div>
        </div>
      )}
      <Input
        id="npc-image-upload"
        type="file"
        accept="image/png,image/jpeg,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
        }}
      />
    </div>
  );
};

// Definição das opções para os selects e radio buttons
const roleOptions = [
  { value: "ally", label: "Aliado" },
  { value: "villain", label: "Vilão" },
  { value: "obstacle", label: "Obstáculo" },
  { value: "informant", label: "Informante" },
  { value: "curiosity", label: "Curiosidade" },
  { value: "neutral", label: "Neutro" },
];

const threatLevelOptions = [
  { value: "harmless", label: "Inofensivo" },
  { value: "challenging", label: "Desafiador" },
  { value: "dangerous", label: "Perigoso" },
  { value: "boss", label: "Boss" },
];

// Extend schema for validation
const formSchema = insertNpcSchema.extend({
  name: z.string().min(1, "O nome é obrigatório"),
  entityType: z.enum(["npc", "creature"], { 
    required_error: "Selecione o tipo: NPC ou Criatura",
  }),
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

type NPCCreatorProps = {
  campaignId?: number;
  campaign?: any;
  onClose?: () => void;
  onSuccess?: (npc: any) => void;
  editingNpc?: any; // Se fornecido, estamos editando um NPC existente
};

export default function NPCCreator({ campaignId, campaign, onClose = () => {}, onSuccess, editingNpc }: NPCCreatorProps) {
  // Se campaign está presente mas campaignId não, extrair o ID da campaign
  const actualCampaignId = campaignId || (campaign ? campaign.id : undefined);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    tipo: 'npc' as 'npc' | 'creature',
    campanha: '',
    nivel: '',
    terreno: '',
    estilo: ''
  });
  
  // Preparar valores padrões considerando possível edição
  const defaultValues = {
    campaignId: actualCampaignId,
    entityType: "npc" as "npc" | "creature",  // tipo explícito para garantir tipagem correta
    name: "",
    role: "",
    motivation: "",
    imageUrl: "",
    relationships: "",
    abilities: "",
    threatLevel: "",
    healthPoints: "",
    str: "",
    dex: "",
    con: "",
    int: "",
    wis: "",
    cha: "",
    specialAbilities: "",
    plotHooks: "",
    // Preenchemos os campos padrão restantes
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  // Defina uma interface explícita para os valores do formulário para evitar problemas de tipagem
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as FormValues,
  });

  // Se estamos editando, preencha o formulário com dados existentes
  useEffect(() => {
    if (editingNpc) {
      console.log("Editando NPC:", editingNpc);
      
      // Extrair valores de atributos do memorableTrait ou usar os valores diretos do banco
      const extractAttribute = (attr: string | null, defaultValue: string = "") => (attr || defaultValue);
      
      // Mapear campos de atributos - usar os valores dos campos próprios se existirem
      const str = editingNpc.strength || extractAttribute(editingNpc.memorableTrait?.match(/FOR:(\d+)/)?.[1]);
      const dex = editingNpc.dexterity || extractAttribute(editingNpc.memorableTrait?.match(/DES:(\d+)/)?.[1]);
      const con = editingNpc.constitution || extractAttribute(editingNpc.memorableTrait?.match(/CON:(\d+)/)?.[1]);
      const int = editingNpc.intelligence || extractAttribute(editingNpc.memorableTrait?.match(/INT:(\d+)/)?.[1]);
      const wis = editingNpc.wisdom || extractAttribute(editingNpc.memorableTrait?.match(/SAB:(\d+)/)?.[1]);
      const cha = editingNpc.charisma || extractAttribute(editingNpc.memorableTrait?.match(/CAR:(\d+)/)?.[1]);
      
      // Determinar o nível de ameaça
      const threatLevel = editingNpc.threatLevel || 
                          (editingNpc.threatOrUtility?.includes("potential_enemy") ? "dangerous" : 
                          editingNpc.threatOrUtility?.includes("unique_abilities") ? "challenging" : "harmless");
      
      // Extrair pontos de vida
      const healthPoints = editingNpc.healthPoints || 
                          (editingNpc.notes?.match(/Vida\/Resistência:\s*(\d+)/)?.[1] || "");
      
      // Adicionar habilidades especiais baseado no campo abilities ou specialAbilities
      const specialAbilities = editingNpc.specialAbilities || editingNpc.abilities || "";
      
      // Combinar relacionamentos com informações de contexto
      const relationships = [
        editingNpc.relationships || "",
        editingNpc.location ? `Localização: ${editingNpc.location}` : "",
      ].filter(Boolean).join("\n\n");

      form.reset({
        ...editingNpc,
        // Garantir valor correto para entityType
        entityType: (editingNpc.entityType === "creature" ? "creature" : "npc") as "npc" | "creature",
        // Mapear campos novos
        threatLevel,
        specialAbilities,
        relationships,
        healthPoints,
        // Valores de atributos
        str,
        dex,
        con,
        int,
        wis,
        cha,
        // Garantir que imageUrl não seja undefined
        imageUrl: editingNpc.imageUrl || "",
      } as FormValues);
    }
  }, [editingNpc, form]);

  // Mutação para criar/editar NPC
  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertNpc>) => {
      let response;
      if (editingNpc) {
        response = await apiRequest("PATCH", `/api/npcs/${editingNpc.id}`, data);
      } else {
        response = await apiRequest("POST", "/api/npcs", data);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${actualCampaignId}/npcs`] });
      toast({
        title: editingNpc 
          ? t("npc.updateSuccess.title") 
          : t("npc.createSuccess.title"),
        description: editingNpc 
          ? t("npc.updateSuccess.description") 
          : t("npc.createSuccess.description"),
      });
      if (onSuccess) onSuccess(data);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: editingNpc 
          ? t("npc.updateError.title") 
          : t("npc.createError.title"),
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Função para gerar NPCs e Criaturas usando IA
  const generateNPC = async () => {
    setIsGenerating(true);
    try {
      // Pegar valores atuais do formulário para contexto
      const tipo = form.getValues("entityType") || "npc";
      
      // Configurar opções de geração
      const options = {
        tipo,
        campanha: generationOptions.campanha,
        nivel: generationOptions.nivel,
        terreno: generationOptions.terreno,
        estilo: generationOptions.estilo
      };
      
      // Chamar a API para gerar o NPC
      const response = await fetch("/api/generate-npc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao gerar NPC: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("NPC gerado:", data);
      
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
      form.setValue("specialAbilities", data.specialAbilities || "");
      form.setValue("plotHooks", data.plotHooks || "");
      
      toast({
        title: "NPC gerado com sucesso!",
        description: "Os campos foram preenchidos automaticamente. Você pode editar conforme necessário.",
      });
    } catch (error) {
      console.error("Erro ao gerar NPC:", error);
      toast({
        title: "Erro ao gerar NPC",
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
        threatOrUtility = "unique_abilities";
        break;
      case "harmless":
      default:
        // deixar vazio para inofensivo
        break;
    }
    
    // Montando os atributos em um formato armazenável
    const attrString = values.str || values.dex || values.con || values.int || values.wis || values.cha 
      ? `FOR:${values.str || "-"} DES:${values.dex || "-"} CON:${values.con || "-"} INT:${values.int || "-"} SAB:${values.wis || "-"} CAR:${values.cha || "-"}` 
      : "";
    
    // Preparando campos
    let notesText = [];
    if (values.healthPoints) notesText.push(`Vida/Resistência: ${values.healthPoints}`);
    if (values.plotHooks) notesText.push(`Ganchos: ${values.plotHooks}`);
    if (values.relationships) notesText.push(`Relações: ${values.relationships}`);
    if (values.role) notesText.push(`Papel: ${values.role}`);
    
    // Use apenas campos que sabemos que existem na tabela ou que foram mapeados
    const submitData = {
      campaignId: values.campaignId,
      name: values.name,
      // Campos opcionais que existem na tabela
      race: "",  // vazio para manter compatibilidade
      notes: notesText.join("\n"),
      appearance: values.specialAbilities || "",
      personality: "", // vazio para manter compatibilidade
      occupation: "",  // vazio para manter compatibilidade
      location: "",    // vazio para manter compatibilidade
      // Campos adicionados ao esquema
      imageUrl: values.imageUrl || "",
      role: values.role || "",
      motivation: values.motivation || "",
      entityType: values.entityType || "npc",
      // Usamos o campo abilities existente para armazenar habilidades
      abilities: values.abilities || "",
      // Campos de data
      updated: new Date().toISOString(),
      
      // Armazenando outros dados em campos existentes para manter a compatibilidade
      // Usamos o campo memorableTrait para armazenar atributos
      memorableTrait: attrString,
    };
    
    // Se criando novo NPC, adiciona a data de criação
    if (!editingNpc) {
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
            {editingNpc ? t("npc.editNpc") : t("npc.createNpc")}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* 1. Tipo: NPC ou Criatura */}
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>1. Tipo</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="npc" id="npc" />
                            <label htmlFor="npc" className="cursor-pointer">NPC</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="creature" id="creature" />
                            <label htmlFor="creature" className="cursor-pointer">Criatura</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 3. Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do personagem ou criatura" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 4. Papel no jogo */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Papel no jogo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o papel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map(option => (
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
                
                {/* 5. Motivação */}
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>5. Motivação</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="O que ele/ela/isso quer? (Ex: proteger, destruir, manipular, escapar)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* 6. Relações e contexto */}
                <FormField
                  control={form.control}
                  name="relationships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6. Relações e contexto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Com quem se conecta? Vive onde? Tem inimigos ou aliados relevantes?" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 7. Atributos e Status */}
                <div className="border border-primary/20 rounded-md p-4 bg-primary/5 space-y-3">
                  <h3 className="text-sm font-semibold text-primary">7. Atributos e Status</h3>
                  
                  {/* Pontos de Vida */}
                  <div className="mb-2">
                    <FormField
                      control={form.control}
                      name="healthPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pontos de Vida</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="PV" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Nível de Ameaça */}
                  <div className="mb-2">
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
                                <SelectValue placeholder="Selecione o nível de ameaça" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {threatLevelOptions.map(option => (
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
                  
                  {/* Atributos - Grid de 3x2 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                    {/* Força */}
                    <FormField
                      control={form.control}
                      name="str"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">Força</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="FOR" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {/* Destreza */}
                    <FormField
                      control={form.control}
                      name="dex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">Destreza</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="DES" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {/* Constituição */}
                    <FormField
                      control={form.control}
                      name="con"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">Constituição</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="CON" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {/* Inteligência */}
                    <FormField
                      control={form.control}
                      name="int"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">Inteligência</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="INT" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {/* Sabedoria */}
                    <FormField
                      control={form.control}
                      name="wis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">Sabedoria</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="SAB" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {/* Carisma */}
                    <FormField
                      control={form.control}
                      name="cha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">Carisma</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="CAR" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* 8. Habilidades Especiais */}
                <FormField
                  control={form.control}
                  name="specialAbilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>8. Habilidades Especiais</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Poderes, magias, capacidades únicas..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 9. Ganchos de História */}
                <FormField
                  control={form.control}
                  name="plotHooks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>9. Ganchos de História</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ideias de como usar este personagem na história..." 
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
                {/* 2. Imagem Upload */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. Imagem</FormLabel>
                      <FormControl>
                        <ImageUpload 
                          imageUrl={field.value || null} 
                          onImageChange={(url) => field.onChange(url)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Gerador automático */}
                <Card className="p-4 border border-primary/30 bg-primary/5">
                  <h3 className="text-base font-semibold font-lora text-primary mb-2">
                    Gerador de {form.getValues("entityType") === "creature" ? "Criaturas" : "NPCs"} por IA
                  </h3>
                  <p className="text-sm mb-4">
                    Deixe a IA criar um {form.getValues("entityType") === "creature" ? "monstro" : "personagem"} completo para sua campanha.
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FormLabel className="text-xs">Tema da campanha</FormLabel>
                        <Input 
                          placeholder="Medieval, Piratas, Futuro, etc."
                          className="text-sm" 
                          value={generationOptions.campanha}
                          onChange={(e) => setGenerationOptions({...generationOptions, campanha: e.target.value})}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-xs">Nível/Desafio</FormLabel>
                        <Input 
                          placeholder="1-5, 10-15, etc." 
                          className="text-sm"
                          value={generationOptions.nivel}
                          onChange={(e) => setGenerationOptions({...generationOptions, nivel: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FormLabel className="text-xs">Ambiente/Terreno</FormLabel>
                        <Input 
                          placeholder="Floresta, Cidade, etc." 
                          className="text-sm"
                          value={generationOptions.terreno}
                          onChange={(e) => setGenerationOptions({...generationOptions, terreno: e.target.value})}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-xs">Estilo</FormLabel>
                        <Input 
                          placeholder="Sombrio, Cômico, etc." 
                          className="text-sm"
                          value={generationOptions.estilo}
                          onChange={(e) => setGenerationOptions({...generationOptions, estilo: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    onClick={generateNPC}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        Gerar {form.getValues("entityType") === "creature" ? "Criatura" : "NPC"} Automaticamente
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            </div>

            <Separator className="my-6" />
            
            <h3 className="text-lg font-semibold font-lora text-primary mb-4">7. Status Básicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Atributos (opcional) */}
              <div>
                <FormLabel className="block mb-3">Atributos (opcional)</FormLabel>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="str"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col">
                            <FormLabel className="text-xs mb-1">FOR</FormLabel>
                            <Input placeholder="-" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dex"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col">
                            <FormLabel className="text-xs mb-1">DES</FormLabel>
                            <Input placeholder="-" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="con"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col">
                            <FormLabel className="text-xs mb-1">CON</FormLabel>
                            <Input placeholder="-" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="int"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col">
                            <FormLabel className="text-xs mb-1">INT</FormLabel>
                            <Input placeholder="-" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wis"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col">
                            <FormLabel className="text-xs mb-1">SAB</FormLabel>
                            <Input placeholder="-" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cha"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col">
                            <FormLabel className="text-xs mb-1">CAR</FormLabel>
                            <Input placeholder="-" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Vida / Resistência */}
                <FormField
                  control={form.control}
                  name="healthPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vida / Resistência</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: baixa, média, alta, ou pontos específicos" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Nível de Ameaça */}
                <FormField
                  control={form.control}
                  name="threatLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Ameaça</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {threatLevelOptions.map(option => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <label htmlFor={option.value} className="cursor-pointer">{option.label}</label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Ataques ou Habilidades especiais */}
            <FormField
              control={form.control}
              name="specialAbilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ataques ou Habilidades especiais</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder='Ex: "Grito paralisante", "Magia de necrose", "Transforma-se em névoa"' 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Liste 1-3 habilidades que tornam este personagem único em combate ou interações.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notas adicionais */}
            <FormField
              control={form.control}
              name="plotHooks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionais / Ideias de história</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais, ganchos de história, ou ideias para usar esse personagem" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  editingNpc ? t("common.save") : t("common.create")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}