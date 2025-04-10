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
  Swords 
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
    mutationFn: async (data: CampaignFormValues) => {
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
        title: "Campaign updated",
        description: "Your campaign has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
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
      setLocationDialogOpen(false);
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
      setLocationDialogOpen(false);
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
    // Converter valores nulos para string vazia para resolver o problema de tipagem
    const cleanData = removeNullValues(data);
    
    if (campaign) {
      updateCampaignMutation.mutate(cleanData);
    } else {
      createCampaignMutation.mutate(cleanData);
    }
  };
  
  // Função auxiliar para remover valores nulos (resolver o problema de tipagem)
  const removeNullValues = (obj: Record<string, any>): Record<string, any> => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
      if (newObj[key] === null) {
        newObj[key] = '';
      }
    });
    return newObj;
  };

  // Location form submit handler
  const onLocationSubmit = (data: LocationFormValues) => {
    // Converter valores nulos para string vazia para resolver o problema de tipagem do TextareaProps/InputProps
    const cleanData = removeNullValues(data);
    
    if (editingLocationId !== null) {
      updateLocationMutation.mutate({ id: editingLocationId, data: cleanData });
    } else {
      createLocationMutation.mutate(cleanData);
    }
  };
  
  // Session note form submit handler
  const onNoteSubmit = (data: SessionNoteFormValues) => {
    // Converter valores nulos para string vazia para resolver o problema de tipagem
    const cleanData = removeNullValues(data);
    
    if (editingNoteId !== null) {
      updateNoteMutation.mutate({ id: editingNoteId, data: cleanData });
    } else {
      createNoteMutation.mutate(cleanData);
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
      setLocationDialogOpen(true);
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
      
      <Form {...campaignForm}>
        <form onSubmit={campaignForm.handleSubmit(onCampaignSubmit)}>
          <Card className="border-t-4 border-t-primary mb-8">
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
                        className="min-h-[100px]"
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
      
      {campaign && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:w-[400px] mb-6">
            <TabsTrigger value="world" className="font-lora">
              <Map className="h-4 w-4 mr-2" />
              {t("location.worldBuilding")}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="font-lora">
              <BookOpen className="h-4 w-4 mr-2" />
              {t("sessionNote.sessionNotes")}
            </TabsTrigger>
          </TabsList>
          
          {/* World Building Tab */}
          <TabsContent value="world" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-lora text-2xl text-primary">{t("location.locations")}</h2>
              <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="magic-button" onClick={() => {
                    setEditingLocationId(null);
                    locationForm.reset({
                      name: "",
                      description: "",
                      imageUrl: "",
                      notes: "",
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("location.createLocation")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLocationId !== null ? t("location.editLocation") : t("location.createLocation")}
                    </DialogTitle>
                    <DialogDescription>
                      {editingLocationId !== null 
                        ? "Update the details of this location in your campaign world" 
                        : "Create a new location for your campaign world"}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...locationForm}>
                    <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe this location" 
                                className="min-h-[80px]"
                                {...field} 
                              />
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
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} />
                            </FormControl>
                            <FormDescription>
                              Add an image URL to visually represent this location
                            </FormDescription>
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
                      
                      <DialogFooter>
                        <Button type="submit" className="magic-button">
                          {editingLocationId !== null ? "Update Location" : "Add Location"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
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
                        onClick={() => handleEditLocation(loc.id)}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="magic-button" onClick={() => {
                        setEditingLocationId(null);
                        locationForm.reset();
                        setLocationDialogOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Location
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Session Notes Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-lora text-2xl text-primary">{t("sessionNote.sessionNotes")}</h2>
              <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="magic-button" onClick={() => {
                    setEditingNoteId(null);
                    sessionNoteForm.reset({
                      title: "",
                      content: "",
                      date: new Date().toISOString().split('T')[0],
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("sessionNote.createSessionNote")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNoteId !== null ? t("sessionNote.editSessionNote") : t("sessionNote.createSessionNote")}
                    </DialogTitle>
                    <DialogDescription>
                      {editingNoteId !== null 
                        ? "Update the details of this session note" 
                        : "Record notes from your campaign session"}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...sessionNoteForm}>
                    <form onSubmit={sessionNoteForm.handleSubmit(onNoteSubmit)} className="space-y-4">
                      <FormField
                        control={sessionNoteForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter session title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sessionNoteForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={sessionNoteForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Record what happened during this session" 
                                className="min-h-[200px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit" className="magic-button">
                          {editingNoteId !== null ? "Update Note" : "Add Note"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            {notesLoading ? (
              <div className="flex justify-center p-8">
                <p>Loading session notes...</p>
              </div>
            ) : sessionNotes.length > 0 ? (
              <div className="space-y-4">
                {sessionNotes
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-lora text-xl text-primary">
                            {note.title}
                          </CardTitle>
                          <CardDescription className="flex items-center">
                            <Calendar className="h-3 w-3 mr-2" />
                            {new Date(note.date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditNote(note.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap">
                        {note.content}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <BookOpen className="h-12 w-12 text-primary/40 mb-4" />
                  <h3 className="font-lora text-xl font-semibold mb-2">No Session Notes Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Record your campaign sessions to keep track of your adventures.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="magic-button" onClick={() => {
                        setEditingNoteId(null);
                        sessionNoteForm.reset({
                          title: "",
                          content: "",
                          date: new Date().toISOString().split('T')[0],
                        });
                        setNoteDialogOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Session Note
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/npc-creator/${campaign.id}`)}
                className="mr-2"
              >
                Manage NPCs
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/encounter-builder/${campaign.id}`)}
              >
                Create Encounters
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
