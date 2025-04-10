import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  imageUrl: string | null;
  onImageChange: (url: string) => void;
  readOnly?: boolean;
}

export default function ImageUpload({ imageUrl, onImageChange, readOnly = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload/character-image", {
        method: "POST",
        body: formData,
        credentials: "include" // Para incluir cookies de autenticação
      });
      
      if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem");
      }
      
      const data = await response.json();
      onImageChange(data.imagePath);
      
      toast({
        title: "Upload realizado com sucesso",
        description: "A imagem do seu personagem foi salva com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32 border-2 rounded-md overflow-hidden flex items-center justify-center bg-background/50">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Personagem" 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/200x200?text=Character";
            }} 
          />
        ) : (
          <User className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      
      {!readOnly && (
        <div className="flex flex-col items-center gap-1 w-full">
          <Button
            type="button"
            variant="outline"
            className="text-sm"
            disabled={isUploading}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const fileInput = e.target as HTMLInputElement;
                const files = fileInput.files;
                if (files && files.length > 0) {
                  handleUpload(files[0]);
                }
              };
              input.click();
            }}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              imageUrl ? "Trocar imagem" : "Enviar imagem"
            )}
          </Button>
        </div>
      )}
      
      {readOnly && imageUrl && (
        <div className="text-sm text-muted-foreground">
          Imagem do personagem
        </div>
      )}
    </div>
  );
}