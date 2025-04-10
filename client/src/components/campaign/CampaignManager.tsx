import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign, CampaignLocation, SessionNote, insertCampaignSchema, insertCampaignLocationSchema, insertSessionNoteSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Map, 
  BookOpen, 
  Calendar,
  Info,
  Globe,
  Users, 
  Swords,
  Upload
} from "lucide-react";

interface CampaignManagerProps {
  campaign?: Campaign;
}

// Campaign form schema
const campaignFormSchema = insertCampaignSchema.pick({
  name: true,
  description: true,
}).extend({
  name: z.string().min(1, "Campaign name is required"),
});

// Location form schema
const locationFormSchema = insertCampaignLocationSchema.pick({
  name: true,
  description: true,
  imageUrl: true,
  notes: true,
});

// Session note form schema
const sessionNoteFormSchema = insertSessionNoteSchema.pick({
  title: true,
  content: true,
  date: true,
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;
type LocationFormValues = z.infer<typeof locationFormSchema>;
type SessionNoteFormValues = z.infer<typeof sessionNoteFormSchema>;

export default function CampaignManager({ campaign }: CampaignManagerProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("details");
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  
  // State para armazenar a URL da imagem do mapa do mundo
  const [mapImageUrl, setMapImageUrl] = useState<string>(campaign?.mapImageUrl || "");
  
  // States para armazenar os textos do mundo
  const [centralConcept, setCentralConcept] = useState<string>(campaign?.centralConcept || "");
  const [geography, setGeography] = useState<string>(campaign?.geography || "");
  const [factions, setFactions] = useState<string>(campaign?.factions || "");
  const [history, setHistory] = useState<string>(campaign?.history || "");
  const [magicTech, setMagicTech] = useState<string>(campaign?.magicTech || "");
  
  // State para controlar se está no modo de edição ou visualização
  const [worldEditMode, setWorldEditMode] = useState<boolean>(true);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  
  // Campaign form setup
  const campaignForm = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: campaign?.name || "",
      description: campaign?.description || "",
    },
  });
  
  // Location form setup
  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      notes: "",
    },
  });
  
  // Session note form setup
  const sessionNoteForm = useForm<SessionNoteFormValues>({
    resolver: zodResolver(sessionNoteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      date: new Date().toISOString().split('T')[0],
    },
  });
  
  // Fetch campaign locations if editing
  const { 
    data: locations = [], 
    isLoading: locationsLoading 
  } = useQuery<CampaignLocation[]>({
    queryKey: campaign ? [`/api/campaigns/${campaign.id}/locations`] : [''],
    enabled: !!campaign,
  });
  
  // Fetch session notes if editing
  const { 
    data: sessionNotes = [], 
    isLoading: notesLoading 
  } = useQuery<SessionNote[]>({
    queryKey: campaign ? [`/api/campaigns/${campaign.id}/session-notes`] : [''],
    enabled: !!campaign,
  });
  
  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormValues) => {
      if (!user) throw new Error("You must be logged in to create a campaign");
      
      const now = new Date().toISOString();
      const res = await apiRequest("POST", "/api/campaigns", {
        ...data,
        userId: user.id,
        created: now,
        updated: now
      });
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      });
      setLocation(`/campaign-management/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormValues | any) => {
      if (!campaign) throw new Error("No campaign to update");
      
      const res = await apiRequest("PUT", `/api/campaigns/${campaign.id}`, {
        ...data,
        updated: new Date().toISOString()
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: t("campaign.campaignUpdated"),
        description: t("campaign.campaignUpdatedDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("campaign.updateFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (data: LocationFormValues) => {
      if (!campaign) throw new Error("No campaign selected");
      
      const now = new Date().toISOString();
      const res = await apiRequest("POST", `/api/campaigns/${campaign.id}/locations`, {
        ...data,
        campaignId: campaign.id,
        created: now,
        updated: now
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign?.id}/locations`] });
      toast({
        title: "Location created",
        description: "Your location has been created successfully.",
      });
      setShowLocationForm(false);
      locationForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: LocationFormValues }) => {
      const res = await apiRequest("PUT", `/api/locations/${id}`, {
        ...data,
        updated: new Date().toISOString()
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign?.id}/locations`] });
      toast({
        title: "Location updated",
        description: "Your location has been updated successfully.",
      });
      setShowLocationForm(false);
      setEditingLocationId(null);
      locationForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign?.id}/locations`] });
      toast({
        title: "Location deleted",
        description: "The location has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create session note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: SessionNoteFormValues) => {
      if (!campaign) throw new Error("No campaign selected");
      
      const now = new Date().toISOString();
      const res = await apiRequest("POST", `/api/campaigns/${campaign.id}/session-notes`, {
        ...data,
        campaignId: campaign.id,
        created: now,
        updated: now
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign?.id}/session-notes`] });
      toast({
        title: "Note created",
        description: "Your session note has been created successfully.",
      });
      setNoteDialogOpen(false);
      sessionNoteForm.reset({
        title: "",
        content: "",
        date: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update session note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: SessionNoteFormValues }) => {
      const res = await apiRequest("PUT", `/api/session-notes/${id}`, {
        ...data,
        updated: new Date().toISOString()
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign?.id}/session-notes`] });
      toast({
        title: "Note updated",
        description: "Your session note has been updated successfully.",
      });
      setNoteDialogOpen(false);
      setEditingNoteId(null);
      sessionNoteForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete session note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/session-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign?.id}/session-notes`] });
      toast({
        title: "Note deleted",
        description: "The session note has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Campaign form submit handler
  const onCampaignSubmit = (data: CampaignFormValues) => {
    if (campaign) {
      updateCampaignMutation.mutate(data);
    } else {
      createCampaignMutation.mutate(data);
    }
  };
  
  // Location form submit handler
  const onLocationSubmit = (data: LocationFormValues) => {
    if (editingLocationId !== null) {
      updateLocationMutation.mutate({ id: editingLocationId, data });
    } else {
      createLocationMutation.mutate(data);
    }
  };
  
  // Session note form submit handler
  const onNoteSubmit = (data: SessionNoteFormValues) => {
    if (editingNoteId !== null) {
      updateNoteMutation.mutate({ id: editingNoteId, data });
    } else {
      createNoteMutation.mutate(data);
    }
  };
  
  // Edit location handler
  const handleEditLocation = (locationId: number) => {
    const locationToEdit = locations.find(loc => loc.id === locationId);
    if (locationToEdit) {
      locationForm.reset({
        name: locationToEdit.name,
        description: locationToEdit.description || "",
        imageUrl: locationToEdit.imageUrl || "",
        notes: locationToEdit.notes || "",
      });
      setEditingLocationId(locationId);
      setShowLocationForm(true);
    }
  };
  
  // Edit note handler
  const handleEditNote = (noteId: number) => {
    const noteToEdit = sessionNotes.find(note => note.id === noteId);
    if (noteToEdit) {
      sessionNoteForm.reset({
        title: noteToEdit.title,
        content: noteToEdit.content,
        date: noteToEdit.date,
      });
      setEditingNoteId(noteId);
      setNoteDialogOpen(true);
    }
  };
  
  // Delete location handler
  const handleDeleteLocation = (locationId: number) => {
    if (confirm("Are you sure you want to delete this location? This action cannot be undone.")) {
      deleteLocationMutation.mutate(locationId);
    }
  };
  
  // Delete note handler
  const handleDeleteNote = (noteId: number) => {
    if (confirm("Are you sure you want to delete this session note? This action cannot be undone.")) {
      deleteNoteMutation.mutate(noteId);
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="font-lora font-bold text-3xl text-primary mb-2">
            {campaign ? t("campaign.manageCampaign") : t("campaign.createCampaign")}
          </h1>
          <p className="text-secondary">
            {campaign ? t("campaign.editCampaignDetails") : t("campaign.createNewCampaign")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation('/dashboard')}
          className="mt-4 md:mt-0"
        >
          {t("dashboard.backToDashboard")}
        </Button>
      </div>
      
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
            <TabsTrigger value="details" className="font-lora">
              <div className="w-6 h-6 mr-2 inline-flex items-center justify-center">
                <Info className="h-5 w-5" />
              </div>
              {t("campaign.details")}
            </TabsTrigger>
            <TabsTrigger value="world" className="font-lora">
              <div className="w-6 h-6 mr-2 inline-flex items-center justify-center">
                <Globe className="h-5 w-5" />
              </div>
              {t("location.worldBuilding")}
            </TabsTrigger>
            <TabsTrigger value="npcs" className="font-lora">
              <div className="w-6 h-6 mr-2 inline-flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              {t("campaign.npcsCreatures")}
            </TabsTrigger>
            <TabsTrigger value="encounters" className="font-lora">
              <div className="w-6 h-6 mr-2 inline-flex items-center justify-center">
                <Swords className="h-5 w-5" />
              </div>
              {t("campaign.encounters")}
            </TabsTrigger>
          </TabsList>
          
          {/* Detalhes da Campanha */}
          <TabsContent value="details" className="space-y-6">
            <Form {...campaignForm}>
              <form onSubmit={campaignForm.handleSubmit(onCampaignSubmit)}>
                <Card className="border-t-4 border-t-primary">
                  <CardHeader>
                    <CardTitle className="font-lora text-2xl">{t("campaign.campaignDetails")}</CardTitle>
                    <CardDescription>
                      {campaign ? t("campaign.updateCampaignInfo") : t("campaign.enterCampaignInfo")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={campaignForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("campaign.campaignName")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("campaign.enterCampaignName")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={campaignForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("campaign.description")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("campaign.describeCampaign")} 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="magic-button"
                      disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                    >
                      {campaign ? (
                        updateCampaignMutation.isPending ? t("common.saving") : t("campaign.saveCampaign")
                      ) : (
                        createCampaignMutation.isPending ? t("common.creating") : t("campaign.createCampaign")
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </TabsContent>
          
          {/* World Building Tab */}
          <TabsContent value="world" className="space-y-6">
            {/* World Building Foundations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-lora text-2xl text-primary">{t("location.worldFoundations")}</CardTitle>
                <CardDescription>
                  {t("location.worldBuildingCore")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {worldEditMode ? (
                  <>
                    {/* Modo de Edição */}
                    {/* Central Concept */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-lora text-xl text-primary">{t("location.centralConcept")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("location.centralConceptDescription")}
                      </p>
                      <Textarea 
                        placeholder="What's the central concept of your world?"
                        className="min-h-[100px]"
                        value={centralConcept}
                        onChange={(e) => setCentralConcept(e.target.value)}
                      />
                    </div>
                    
                    {/* Geography */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-lora text-xl text-primary">{t("location.geography")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("location.geographyDescription")}
                      </p>
                      <Textarea 
                        placeholder="Describe the key geographical regions of your world"
                        className="min-h-[100px]"
                        value={geography}
                        onChange={(e) => setGeography(e.target.value)}
                      />
                      
                      {/* World Map Upload */}
                      <div className="mt-6 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-lora text-md text-primary">{t("location.worldMap")}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t("location.worldMapDescription")}
                        </p>
                        
                        <div className="border-2 border-dashed border-primary/20 rounded-md p-6 text-center hover:border-primary/40 transition-colors">
                          <div className="space-y-2">
                            <div className="flex justify-center">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">{t("location.uploadMapDescription")}</p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                document.getElementById('map-upload')?.click();
                              }}
                            >
                              {t("location.uploadMap")}
                            </Button>
                            <Input
                              id="map-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/gif"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Comprimir e converter a imagem para base64
                                  const compressAndConvertToBase64 = (file: File) => {
                                    return new Promise<string>((resolve) => {
                                      // Criar um elemento de imagem para redimensionar
                                      const img = new Image();
                                      img.onload = () => {
                                        // Criar um canvas para redimensionar
                                        const canvas = document.createElement("canvas");
                                        
                                        // Definir tamanho máximo (1000px de largura ou altura, mantendo a proporção)
                                        const MAX_SIZE = 1000;
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
                                        ctx?.drawImage(img, 0, 0, width, height);
                                        
                                        // Converter para base64 com qualidade reduzida (0.7)
                                        const base64String = canvas.toDataURL("image/jpeg", 0.7);
                                        resolve(base64String);
                                      };
                                      
                                      // Carregar a imagem
                                      const reader = new FileReader();
                                      reader.onload = (e) => {
                                        img.src = e.target?.result as string;
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  };
                                  
                                  // Comprimir e converter para base64
                                  compressAndConvertToBase64(file).then((base64String) => {
                                    setMapImageUrl(base64String);
                                    console.log("Mapa carregado, comprimido e convertido para base64");
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Exibir preview da imagem quando ela for carregada */}
                        {mapImageUrl && (
                          <div className="mt-4">
                            <img 
                              src={mapImageUrl} 
                              alt="World map" 
                              className="w-full max-h-96 object-contain rounded-md border border-border" 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive mt-2"
                              onClick={() => setMapImageUrl("")}
                            >
                              {t("common.removeImage")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Factions */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-lora text-xl text-primary">{t("location.factions")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("location.factionsDescription")}
                      </p>
                      <Textarea 
                        placeholder="Describe the major factions and their tensions"
                        className="min-h-[100px]"
                        value={factions}
                        onChange={(e) => setFactions(e.target.value)}
                      />
                    </div>
                    
                    {/* History */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-lora text-xl text-primary">{t("location.history")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("location.historyDescription")}
                      </p>
                      <Textarea 
                        placeholder="Describe a key historical event and its consequences"
                        className="min-h-[100px]"
                        value={history}
                        onChange={(e) => setHistory(e.target.value)}
                      />
                    </div>
                    
                    {/* Magic/Technology */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-lora text-xl text-primary">{t("location.magicTech")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("location.magicTechDescription")}
                      </p>
                      <Textarea 
                        placeholder="Describe how magic, technology, or other systems work in your world"
                        className="min-h-[100px]"
                        value={magicTech}
                        onChange={(e) => setMagicTech(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Modo de Visualização */}
                    {/* Mostrar mapa no topo se existir */}
                    {mapImageUrl && (
                      <div className="mb-8">
                        <img 
                          src={mapImageUrl} 
                          alt="World map" 
                          className="w-full max-h-[500px] object-contain rounded-md border border-border" 
                        />
                      </div>
                    )}
                    
                    {/* Central Concept */}
                    {centralConcept && (
                      <div className="space-y-2">
                        <h3 className="font-lora text-xl text-primary">{t("location.centralConcept")}</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-secondary whitespace-pre-wrap">{centralConcept}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Geography */}
                    {geography && (
                      <div className="space-y-2">
                        <h3 className="font-lora text-xl text-primary">{t("location.geography")}</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-secondary whitespace-pre-wrap">{geography}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Factions */}
                    {factions && (
                      <div className="space-y-2">
                        <h3 className="font-lora text-xl text-primary">{t("location.factions")}</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-secondary whitespace-pre-wrap">{factions}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* History */}
                    {history && (
                      <div className="space-y-2">
                        <h3 className="font-lora text-xl text-primary">{t("location.history")}</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-secondary whitespace-pre-wrap">{history}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Magic/Technology */}
                    {magicTech && (
                      <div className="space-y-2">
                        <h3 className="font-lora text-xl text-primary">{t("location.magicTech")}</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-secondary whitespace-pre-wrap">{magicTech}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Mensagem quando não houver conteúdo */}
                    {!centralConcept && !geography && !factions && !history && !magicTech && !mapImageUrl && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{t("location.noWorldContent")}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                {worldEditMode ? (
                  <Button 
                    className="magic-button"
                    onClick={() => {
                      // Salvar os fundamentos do mundo
                      if (campaign) {
                        updateCampaignMutation.mutate({
                          centralConcept,
                          geography,
                          mapImageUrl,
                          factions, 
                          history,
                          magicTech
                        });
                      }
                      setWorldEditMode(false);
                    }}
                  >
                    {updateCampaignMutation.isPending ? t("common.saving") : t("location.save")}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setWorldEditMode(true)}
                  >
                    {t("location.edit")}
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Locations Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-lora text-2xl text-primary">{t("location.locations")}</h2>
              <Button 
                className="magic-button" 
                onClick={() => {
                  setEditingLocationId(null);
                  locationForm.reset({
                    name: "",
                    description: "",
                    imageUrl: "",
                    notes: "",
                  });
                  setShowLocationForm(!showLocationForm);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("location.createLocation")}
              </Button>
            </div>
            
            {showLocationForm && (
              <Card className="mb-8 border border-primary/20">
                <CardHeader>
                  <CardTitle className="font-lora text-xl flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    {editingLocationId !== null ? t("location.editLocation") : t("location.createLocation")}
                  </CardTitle>
                  <CardDescription>
                    {editingLocationId !== null 
                      ? "Update the details of this location in your campaign world" 
                      : "Create a new location for your campaign world"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...locationForm}>
                    <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={locationForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter location name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={locationForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image Upload</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <div className="border border-dashed border-primary/20 rounded-md p-3 text-center hover:border-primary/40 transition-colors">
                                    <div className="space-y-2">
                                      <div className="flex justify-center">
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <p className="text-xs text-muted-foreground">Upload an image for this location</p>
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-1"
                                        onClick={() => {
                                          document.getElementById('location-image-upload')?.click();
                                        }}
                                      >
                                        {t("location.uploadImage")}
                                      </Button>
                                      <Input
                                        id="location-image-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/gif"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            // Converter a imagem para base64 para persistência
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              const base64String = reader.result as string;
                                              field.onChange(base64String);
                                              console.log("Imagem convertida para base64");
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                  {field.value && (
                                    <div className="flex flex-col items-center">
                                      <img 
                                        src={field.value} 
                                        alt="Location preview" 
                                        className="w-full max-h-40 object-cover rounded-md mt-2"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive mt-1"
                                        onClick={() => field.onChange("")}
                                      >
                                        Remove Image
                                      </Button>
                                    </div>
                                  )}
                                  <Input
                                    type="hidden"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={locationForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe this location" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={locationForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional details about this location" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setShowLocationForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="magic-button">
                          {editingLocationId !== null ? "Update Location" : "Add Location"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {locationsLoading ? (
              <div className="flex justify-center p-8">
                <p>Loading locations...</p>
              </div>
            ) : locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc) => (
                  <Card key={loc.id} className="overflow-hidden">
                    {loc.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={loc.imageUrl} 
                          alt={loc.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className={loc.imageUrl ? "pt-4" : ""}>
                      <CardTitle className="font-lora text-xl text-primary flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        {loc.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-secondary line-clamp-3 mb-3">
                        {loc.description || "No description available."}
                      </p>
                      {loc.notes && (
                        <>
                          <Separator className="my-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-semibold">Notes:</span> {loc.notes}
                          </p>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleEditLocation(loc.id);
                          setShowLocationForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteLocation(loc.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Map className="h-12 w-12 text-primary/40 mb-4" />
                  <h3 className="font-lora text-xl font-semibold mb-2">No Locations Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your world by adding locations to your campaign.
                  </p>
                  <Button 
                    className="magic-button" 
                    onClick={() => {
                      setEditingLocationId(null);
                      locationForm.reset();
                      setShowLocationForm(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* NPCs & Criaturas */}
          <TabsContent value="npcs" className="space-y-6">
            <Card className="bg-muted/40">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="h-12 w-12 text-primary/40 mb-4" />
                <h3 className="font-lora text-xl font-semibold mb-2">{t("campaign.npcsCreatures")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("common.comingSoon")}
                </p>
                <Button className="magic-button" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("campaign.addNpc")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Encontros */}
          <TabsContent value="encounters" className="space-y-6">
            <Card className="bg-muted/40">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Swords className="h-12 w-12 text-primary/40 mb-4" />
                <h3 className="font-lora text-xl font-semibold mb-2">{t("campaign.encounters")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("common.comingSoon")}
                </p>
                <Button className="magic-button" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("campaign.addEncounter")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}