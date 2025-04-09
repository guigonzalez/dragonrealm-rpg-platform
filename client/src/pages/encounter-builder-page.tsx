import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EncounterBuilder from "@/components/campaign/EncounterBuilder";
import { Campaign } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function EncounterBuilderPage() {
  const params = useParams<{ campaignId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const campaignId = parseInt(params.campaignId);
  
  // Validate the campaign ID
  useEffect(() => {
    if (isNaN(campaignId)) {
      toast({
        title: "Invalid campaign ID",
        description: "The campaign ID must be a number.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [campaignId, toast, setLocation]);
  
  // Fetch campaign data to verify the user has access
  const { 
    data: campaign, 
    isLoading, 
    error 
  } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: !isNaN(campaignId),
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
  
  if (isLoading) {
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
  
  if (!campaign) {
    return null; // We'll redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <EncounterBuilder campaign={campaign} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
