import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CharacterSheet from "@/components/character/CharacterSheet";
import { Character } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CharacterSheetPage() {
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const characterId = parseInt(params.id);
  
  // Check if we're in view-only mode from URL
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const readOnly = searchParams.get('readOnly') === 'true';
  
  // Validate the character ID
  useEffect(() => {
    if (isNaN(characterId)) {
      toast({
        title: "Invalid character ID",
        description: "The character ID must be a number.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [characterId, toast, setLocation]);
  
  // Fetch character data
  const { 
    data: character, 
    isLoading, 
    error 
  } = useQuery<Character>({
    queryKey: [`/api/characters/${characterId}`],
    enabled: !isNaN(characterId),
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading character",
        description: "Failed to load character data. Please try again.",
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
  
  if (!character) {
    return null; // We'll redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          <CharacterSheet character={character} readOnly={readOnly} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
