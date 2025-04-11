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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, X } from "lucide-react";

const roleOptions = [
  { value: "ally", label: "Aliado" },
  { value: "villain", label: "Vilão" },
  { value: "obstacle", label: "Obstáculo" },
  { value: "curiosity", label: "Curiosidade" },
  { value: "neutral", label: "Neutro" },
];

const utilityOptions = [
  { id: "unique_abilities", label: "Tem habilidades únicas" },
  { id: "potential_enemy", label: "Pode virar inimigo" },
  { id: "potential_ally", label: "Pode ser aliado poderoso" },
  { id: "important_info", label: "Tem informação importante" },
  { id: "contractor", label: "Serve como contratante" },
];

// Extend the schema for validation
const formSchema = insertNpcSchema.extend({
  name: z.string().min(1, "O nome é obrigatório"),
  entityType: z.enum(["npc", "creature"], { 
    required_error: "Selecione o tipo: NPC ou Criatura",
  }),
  role: z.string().optional(),
  // threatOrUtility será um array de strings convertido para string no envio
});

type NPCCreatorProps = {
  campaignId: number;
  onClose: () => void;
  onSuccess?: (npc: any) => void;
  editingNpc?: any; // Se fornecido, estamos editando um NPC existente
};

export default function NPCCreator({ campaignId, onClose, onSuccess, editingNpc }: NPCCreatorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Preparar valores padrões considerando possível edição
  const defaultValues: Partial<InsertNpc & { threatOrUtilityOptions?: string[] }> = {
    campaignId,
    entityType: "npc",
    name: "",
    role: "",
    motivation: "",
    memorableTrait: "",
    relationships: "",
    abilities: "",
    threatOrUtility: "",
    plotHooks: "",
    threatOrUtilityOptions: [],
    // Preenchemos os campos padrão restantes
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  const form = useForm<z.infer<typeof formSchema> & { threatOrUtilityOptions: string[] }>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Se estamos editando, preencha o formulário com dados existentes
  useEffect(() => {
    if (editingNpc) {
      const threatUtilityArray = editingNpc.threatOrUtility 
        ? editingNpc.threatOrUtility.split(",") 
        : [];
        
      form.reset({
        ...editingNpc,
        threatOrUtilityOptions: threatUtilityArray,
      });
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
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/npcs`] });
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

  const onSubmit = async (values: z.infer<typeof formSchema> & { threatOrUtilityOptions: string[] }) => {
    setIsSubmitting(true);
    
    // Converte array de opções para string
    const threatOrUtility = values.threatOrUtilityOptions?.join(",") || "";
    
    const submitData = {
      ...values,
      threatOrUtility,
      // Removemos o campo extra que só existe no formulário
      threatOrUtilityOptions: undefined,
      // Atualizamos a data
      updated: new Date().toISOString(),
    };
    
    mutation.mutate(submitData as InsertNpc);
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
            {/* Tipo: NPC ou Criatura */}
            <FormField
              control={form.control}
              name="entityType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Tipo:</FormLabel>
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

            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome:</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do NPC ou criatura" {...field} />
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
                  <FormLabel>Papel na história:</FormLabel>
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

            {/* Motivação */}
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivação ou objetivo principal:</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: proteger o templo, vingar a irmã, coletar artefatos mágicos" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Traço memorável */}
            <FormField
              control={form.control}
              name="memorableTrait"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traço memorável:</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: aparência, fala, comportamento, mania" 
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
                  <FormLabel>Relacionamentos e contexto:</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Com quem ele se conecta? Onde vive? Tem aliados ou rivais?" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ameaça ou utilidade */}
            <FormField
              control={form.control}
              name="threatOrUtilityOptions"
              render={() => (
                <FormItem>
                  <FormLabel>Ameaça ou utilidade:</FormLabel>
                  <div className="space-y-2">
                    {utilityOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={form.watch("threatOrUtilityOptions")?.includes(option.id)}
                          onCheckedChange={(checked) => {
                            const current = form.watch("threatOrUtilityOptions") || [];
                            const updated = checked
                              ? [...current, option.id]
                              : current.filter(value => value !== option.id);
                            form.setValue("threatOrUtilityOptions", updated);
                          }}
                        />
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Habilidades */}
            <FormField
              control={form.control}
              name="abilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habilidades únicas:</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Quais habilidades especiais esse NPC ou criatura possui?" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas extras */}
            <FormField
              control={form.control}
              name="plotHooks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas extras / Ganchos de história:</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Anotações adicionais, ideias para enredos futuros, etc." 
                      className="min-h-[100px]"
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