import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Character, Campaign } from "@shared/schema";
import { Plus, BookOpen, Swords, Scroll, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("characters");
  
  // Fetch user's characters
  const { 
    data: characters = [], 
    isLoading: charactersLoading,
    error: charactersError
  } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
    enabled: !!user,
  });
  
  // Fetch user's campaigns
  const { 
    data: campaigns = [], 
    isLoading: campaignsLoading,
    error: campaignsError
  } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    enabled: !!user,
  });
  
  // Handle errors
  useEffect(() => {
    if (charactersError) {
      toast({
        title: t("dashboard.errors.charactersTitle"),
        description: t("dashboard.errors.charactersDescription"),
        variant: "destructive",
      });
    }
    
    if (campaignsError) {
      toast({
        title: t("dashboard.errors.campaignsTitle"),
        description: t("dashboard.errors.campaignsDescription"),
        variant: "destructive",
      });
    }
  }, [charactersError, campaignsError, toast, t]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="font-lora font-bold text-3xl text-primary mb-2">{t("dashboard.welcome", { name: user?.displayName || user?.username })}</h1>
              <p className="text-secondary">{t("dashboard.subtitle")}</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Link href="/character-creation">
                <Button className="magic-button flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("dashboard.buttons.newCharacter")}
                </Button>
              </Link>
              <Link href="/campaign-management">
                <Button variant="outline" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("dashboard.buttons.newCampaign")}
                </Button>
              </Link>
            </div>
          </div>
          
          <Tabs defaultValue="characters" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="characters" className="font-lora">{t("dashboard.tabs.characters")}</TabsTrigger>
              <TabsTrigger value="campaigns" className="font-lora">{t("dashboard.tabs.campaigns")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="characters" className="mt-6">
              {charactersLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map((character) => (
                    <Card key={character.id} className="overflow-hidden">
                      <div className="h-2 bg-primary" />
                      <CardHeader>
                        <CardTitle className="font-lora text-primary">{character.name}</CardTitle>
                        <CardDescription>
                          {character.race} • {character.class} • Level {character.level}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                          <div className="bg-muted rounded-md p-2">
                            <p className="text-xs text-muted-foreground">HP</p>
                            <p className="font-lora font-bold text-primary">{character.currentHitPoints}/{character.maxHitPoints}</p>
                          </div>
                          <div className="bg-muted rounded-md p-2">
                            <p className="text-xs text-muted-foreground">AC</p>
                            <p className="font-lora font-bold text-primary">{character.armorClass}</p>
                          </div>
                          <div className="bg-muted rounded-md p-2">
                            <p className="text-xs text-muted-foreground">Speed</p>
                            <p className="font-lora font-bold text-primary">{character.speed}</p>
                          </div>
                        </div>
                        
                        {character.background && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            <span className="font-semibold">{t("character.background")}:</span> {character.background}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Link href={`/character-sheet/${character.id}`}>
                          <Button className="w-full">{t("character.viewSheet")}</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Swords className="h-12 w-12 text-primary/40 mb-4" />
                    <h3 className="font-lora text-xl font-semibold mb-2">{t("character.empty.title")}</h3>
                    <p className="text-muted-foreground mb-6">{t("character.empty.description")}</p>
                    <Link href="/character-creation">
                      <Button className="magic-button">{t("character.empty.button")}</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="campaigns" className="mt-6">
              {campaignsLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden">
                      <div className="h-2 bg-secondary" />
                      <CardHeader>
                        <CardTitle className="font-lora text-primary">{campaign.name}</CardTitle>
                        <CardDescription>
                          {new Date(campaign.created).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {campaign.description || t("campaign.noDescription")}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link href={`/campaign-management/${campaign.id}`}>
                          <Button variant="outline" className="flex items-center">
                            <BookOpen className="mr-2 h-4 w-4" />
                            {t("campaign.buttons.manage")}
                          </Button>
                        </Link>
                        <div className="flex space-x-2">
                          <Link href={`/npc-creator/${campaign.id}`}>
                            <Button variant="ghost" size="sm" className="h-9 px-2">{t("campaign.buttons.npcs")}</Button>
                          </Link>
                          <Link href={`/encounter-builder/${campaign.id}`}>
                            <Button variant="ghost" size="sm" className="h-9 px-2">{t("campaign.buttons.encounters")}</Button>
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Scroll className="h-12 w-12 text-primary/40 mb-4" />
                    <h3 className="font-lora text-xl font-semibold mb-2">{t("campaign.empty.title")}</h3>
                    <p className="text-muted-foreground mb-6">{t("campaign.empty.description")}</p>
                    <Link href="/campaign-management">
                      <Button className="magic-button">{t("campaign.empty.button")}</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
