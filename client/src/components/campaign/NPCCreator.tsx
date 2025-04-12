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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, X } from "lucide-react";

// Estendendo o schema para validação
const formSchema = insertNpcSchema.extend({
  name: z.string().min(1, "O nome é obrigatório"),
  role: z.string().optional(),
  personality: z.string().optional(),
  voice: z.string().optional(),
  motivation: z.string().optional(),
  location: z.string().optional(),
  // Campo virtual que será armazenado nas notas, não existe na tabela
  relationships: z.string().optional(), 
  secrets: z.string().optional(),
  // Aceita string ou número e converte para string
  healthPoints: z.union([z.string(), z.number()])
    .transform(val => val === null || val === undefined ? null : String(val))
    .optional()
    .nullable(),
  armorClass: z.string().optional(),
  keyAttribute: z.string().optional()
});

type NPCCreatorProps = {
  campaignId?: number;
  campaign?: any;
  onClose?: () => void;
  onSuccess?: (npc: any) => void;
  editingNpc?: any; // Se fornecido, estamos editando um NPC existente
};

interface FormValues {
  name: string;
  campaignId: number;
  role?: string;
  personality?: string;
  voice?: string;
  motivation?: string;
  location?: string;
  relationships?: string;
  secrets?: string;
  healthPoints?: string;
  armorClass?: string;
  keyAttribute?: string;
  created: string;
  updated: string;
  // Campos legados para compatibilidade
  memorableTrait?: string;
  notes?: string;
  appearance?: string;
  entityType?: "npc";
}

export default function NPCCreator({ campaignId, campaign, onClose = () => {}, onSuccess, editingNpc }: NPCCreatorProps) {
  // Se campaign está presente mas campaignId não, extrair o ID da campaign
  const actualCampaignId = campaignId || (campaign ? campaign.id : undefined);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    tipo: 'npc' as 'npc',
    campanha: '',
    nivel: '',
    terreno: '',
    estilo: '',
    usingCampaignContext: true
  });
  
  // Preparar valores padrões considerando possível edição
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingNpc?.name || "",
      campaignId: actualCampaignId,
      role: editingNpc?.role || "",
      personality: editingNpc?.personality || "",
      voice: editingNpc?.memorableTrait || "",
      motivation: editingNpc?.motivation || "",
      location: editingNpc?.location || "",
      relationships: editingNpc?.relationships || "",
      secrets: editingNpc?.abilities || "",
      healthPoints: editingNpc?.healthPoints || "",
      armorClass: "",
      keyAttribute: "",
      // Campos legados mantidos para compatibilidade
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
  });

  // Se estamos editando, preencha o formulário com dados existentes
  useEffect(() => {
    if (editingNpc) {
      console.log("Editando NPC:", editingNpc);
      
      // Extrair pontos de vida e outros valores das notas
      const healthPoints = editingNpc.healthPoints || 
                         (editingNpc.notes?.match(/Vida\/Resistência:\s*(\d+)/)?.[1] || "");
      
      // Extrair CA das notas
      const acMatch = editingNpc.notes?.match(/CA:\s*(\d+)/);
      const armorClass = acMatch ? acMatch[1] : "";
      
      // Extrair relacionamentos
      const relationsRegex = /Relações:\s*([^\n]+)/;
      const extractedRelations = (editingNpc.notes && relationsRegex.test(editingNpc.notes) 
                                ? editingNpc.notes.match(relationsRegex)[1] 
                                : "");

      form.reset({
        name: editingNpc.name || "",
        campaignId: actualCampaignId,
        role: editingNpc.role || "",
        personality: editingNpc.personality || "",
        voice: editingNpc.memorableTrait || "",
        motivation: editingNpc.motivation || "",
        location: editingNpc.location || "",
        relationships: editingNpc.relationships || extractedRelations || "",
        secrets: editingNpc.abilities || "",
        healthPoints: healthPoints,
        armorClass: armorClass,
        keyAttribute: "",
        created: editingNpc.created || new Date().toISOString(),
        updated: new Date().toISOString(),
      });
    }
  }, [editingNpc, form, actualCampaignId]);

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

  // Função para gerar NPCs usando IA
  const generateNPC = async () => {
    setIsGenerating(true);
    try {
      // Configurar opções de geração
      const options = {
        tipo: 'npc' as 'npc',
        campanha: generationOptions.campanha,
        nivel: generationOptions.nivel,
        terreno: generationOptions.terreno,
        estilo: generationOptions.estilo,
        // Usar campaignId para permitir que o servidor busque informações da campanha como contexto
        campaignId: actualCampaignId
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
      form.setValue("personality", data.personality || "");
      form.setValue("voice", data.memorableTrait || "");
      form.setValue("motivation", data.motivation || "");
      form.setValue("location", data.location || "");
      form.setValue("relationships", data.relationships || "");
      form.setValue("secrets", data.abilities || "");
      
      // Valores de combate
      form.setValue("healthPoints", data.healthPoints ? String(data.healthPoints) : "");
      
      // Adicionar CA (Classe de Armadura) - calculada com base na destreza
      const dexMod = data.dexterity ? Math.floor((Number(data.dexterity) - 10) / 2) : 0;
      const baseAC = 10 + dexMod;
      form.setValue("armorClass", String(baseAC));
      
      // Determinar atributo-chave com base no valor mais alto
      const attributes = [
        { name: "For", value: Number(data.strength) || 0 },
        { name: "Des", value: Number(data.dexterity) || 0 },
        { name: "Con", value: Number(data.constitution) || 0 },
        { name: "Int", value: Number(data.intelligence) || 0 },
        { name: "Sab", value: Number(data.wisdom) || 0 },
        { name: "Car", value: Number(data.charisma) || 0 }
      ];
      
      // Ordenar atributos do maior para o menor
      attributes.sort((a, b) => b.value - a.value);
      // Selecionar o atributo com maior valor e calcular o modificador
      const highestAttr = attributes[0];
      const mod = Math.floor((highestAttr.value - 10) / 2);
      if (highestAttr.value > 0) {
        form.setValue("keyAttribute", `${highestAttr.name} ${mod >= 0 ? '+' : ''}${mod}`);
      }
      
      toast({
        title: "NPC gerado com sucesso!",
        description: actualCampaignId 
          ? "O NPC foi gerado utilizando o contexto da sua campanha. Os campos foram preenchidos automaticamente." 
          : "Os campos foram preenchidos automaticamente. Você pode editar conforme necessário.",
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
    
    // Preparando campos para notas
    let notesText = [];
    if (values.healthPoints) notesText.push(`Vida/Resistência: ${values.healthPoints}`);
    if (values.armorClass) notesText.push(`CA: ${values.armorClass}`);
    if (values.keyAttribute) notesText.push(`Atributo-chave: ${values.keyAttribute}`);
    // Adicionar relacionamentos às notas
    if (values.relationships) notesText.push(`Relações: ${values.relationships}`);
    
    // Use apenas campos que sabemos que existem na tabela ou que foram mapeados
    const submitData = {
      campaignId: values.campaignId,
      name: values.name,
      // Campos que existem na tabela
      role: values.role || "",
      personality: values.personality || "",
      location: values.location || "",
      motivation: values.motivation || "",
      abilities: values.secrets || "",
      // Voz ou fala vai para memorableTrait
      memorableTrait: values.voice || "",
      // Campos adicionais para notas - o relationships já está incluído em notesText, não enviar separadamente
      notes: notesText.join("\n"),
      // Forçar entityType como "npc"
      entityType: "npc" as "npc",
      // Campo healthPoints como string
      healthPoints: values.healthPoints ? String(values.healthPoints) : null,
      // Campos de data
      updated: new Date().toISOString(),
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
                {/* Nome do NPC */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do NPC</FormLabel>
                      <FormDescription>
                        Ex: Velkan, o Taverneiro Ranzinza
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Nome do NPC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Papel na história */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel na história</FormLabel>
                      <FormDescription>
                        Ex: Informante, vilão disfarçado, aliado relutante, figurante com potencial
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Papel na história" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Personalidade e trejeitos */}
                <FormField
                  control={form.control}
                  name="personality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personalidade e trejeitos</FormLabel>
                      <FormDescription>
                        Ex: Sarcástico, fala cuspindo, coça a barba o tempo todo
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva a personalidade e maneirismos característicos..." 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Voz ou fala típica */}
                <FormField
                  control={form.control}
                  name="voice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voz ou fala típica</FormLabel>
                      <FormDescription>
                        Ex: "Eu vi coisas que você nem sonha, moleque..."
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Uma frase ou modo de falar característico..." 
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
                {/* Objetivo ou motivação atual */}
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo ou motivação atual</FormLabel>
                      <FormDescription>
                        Ex: Proteger a filha, enriquecer, derrubar o prefeito, sobreviver
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="O que motiva este personagem..." 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Local e contexto */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local e contexto</FormLabel>
                      <FormDescription>
                        Ex: Cidade portuária decadente, ruínas antigas, castelo nobre
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Onde este NPC está e qual seu contexto..." 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Relações e lealdades */}
                <FormField
                  control={form.control}
                  name="relationships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relações e lealdades</FormLabel>
                      <FormDescription>
                        Ex: Odeia a guarda local, é devoto da deusa da sorte, tem um pacto com demônios
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Com quem este NPC se relaciona..." 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Informações úteis ou segredos */}
                <FormField
                  control={form.control}
                  name="secrets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informações úteis ou segredos</FormLabel>
                      <FormDescription>
                        Ex: Sabe onde está o artefato, mas não entrega sem pagamento
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="O que este NPC sabe que pode ser útil..." 
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

            <div className="space-y-6">
              <h3 className="text-lg font-semibold font-lora text-primary">
                Informações Opcionais de Combate
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PV */}
                <FormField
                  control={form.control}
                  name="healthPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pontos de Vida (PV)</FormLabel>
                      <FormDescription>Opcional</FormDescription>
                      <FormControl>
                        <Input 
                          placeholder="Ex: 25" 
                          type="text"
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => {
                            // Garantir que estamos usando strings aqui
                            const value = e.target.value;
                            field.onChange(value === "" ? null : String(value));
                          }}
                        />
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
                      <FormLabel>Classe de Armadura (CA)</FormLabel>
                      <FormDescription>Opcional</FormDescription>
                      <FormControl>
                        <Input 
                          placeholder="Ex: 14" 
                          type="text"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : String(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Atributo-chave */}
                <FormField
                  control={form.control}
                  name="keyAttribute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atributo-chave (apenas um)</FormLabel>
                      <FormDescription>Ex: Car +3 para blefar</FormDescription>
                      <FormControl>
                        <Input placeholder="Ex: Int +2 para saber de coisas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botões de IA e Envio */}
            <div className="space-y-6">
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-lora text-primary">
                  Gerador de NPC com IA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Preencha os campos abaixo para personalizar a geração. Todos os campos são opcionais.
                </p>
                {actualCampaignId && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-primary/10 mb-4">
                    <div className="h-5 w-5 text-primary shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Usando dados da campanha para gerar o NPC</p>
                      <p className="text-xs text-muted-foreground">
                        A IA usará a construção de mundo, NPCs existentes e localizações da sua campanha para criar um NPC contextualizado.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Input
                      placeholder="Tema da campanha (ex: D&D, Fantasia Medieval...)"
                      value={generationOptions.campanha}
                      onChange={(e) => setGenerationOptions({...generationOptions, campanha: e.target.value})}
                    />
                    <Input
                      placeholder="Nível de desafio (ex: Fácil, Difícil...)"
                      value={generationOptions.nivel}
                      onChange={(e) => setGenerationOptions({...generationOptions, nivel: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <Input
                      placeholder="Localização (ex: Floresta, Cidade...)"
                      value={generationOptions.terreno}
                      onChange={(e) => setGenerationOptions({...generationOptions, terreno: e.target.value})}
                    />
                    <Input
                      placeholder="Estilo (ex: Misterioso, Cômico...)"
                      value={generationOptions.estilo}
                      onChange={(e) => setGenerationOptions({...generationOptions, estilo: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    type="button" 
                    onClick={generateNPC} 
                    disabled={isGenerating}
                    className="magic-button w-full md:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando NPC...
                      </>
                    ) : (
                      <>
                        Gerar NPC com IA
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || form.formState.isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      Salvar NPC
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}