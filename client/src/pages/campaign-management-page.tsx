import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CampaignManager from "@/components/campaign/CampaignManager";
import { Campaign } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CampaignManagementPage() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const campaignId = params.id ? parseInt(params.id) : undefined;
  
  // Validate the campaign ID if provided
  useEffect(() => {
    if (params.id && isNaN(campaignId!)) {
      toast({
        title: "Invalid campaign ID",
        description: "The campaign ID must be a number.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [params.id, campaignId, toast, setLocation]);
  
  // Fetch campaign data if editing an existing campaign
  const { 
    data: campaign, 
    isLoading, 
    error 
  } = useQuery<Campaign>({
    queryKey: campaignId ? [`/api/campaigns/${campaignId}`] : null,
    enabled: !!campaignId,
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading campaign",
        description: "Failed to load campaign data. Please try again.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [error, toast, setLocation]);
  
  // If we're trying to edit a campaign and it's still loading
  if (campaignId && isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  // If we're editing a campaign but it failed to load
  if (campaignId && !campaign && !isLoading) {
    return null; // We'll redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <CampaignManager campaign={campaign} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
