import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface CampaignImageUploadProps {
  imageUrl: string | null;
  onImageChange: (url: string) => void;
  readOnly?: boolean;
}

export default function CampaignImageUpload({ 
  imageUrl, 
  onImageChange, 
  readOnly = false 
}: CampaignImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleUpload = async (file: File) => {
    // Como ainda não temos uma rota de API específica para uploads de imagens de campanha,
    // vamos usar a mesma funcionalidade de compressão e conversão para base64 que usamos
    // para o mapa do mundo
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
        description: t("campaign.imageUploadSuccess"),
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: t("common.uploadError"),
        description: t("campaign.imageUploadError"),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-[3/2] border-2 border-dashed border-primary/20 rounded-md overflow-hidden flex items-center justify-center bg-background/50 hover:border-primary/40 transition-colors">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={t("campaign.campaignImage")} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/800x400?text=Campaign";
            }} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            <Image className="w-16 h-16 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground text-center">
              {t("campaign.uploadCampaignImageDescription")}
            </p>
          </div>
        )}
      </div>
      
      {!readOnly && (
        <div className="flex justify-center w-full">
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
                {t("common.uploading")}
              </>
            ) : (
              imageUrl ? t("campaign.changeCampaignImage") : t("campaign.uploadCampaignImage")
            )}
          </Button>
          
          {imageUrl && (
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-destructive ml-2"
              disabled={isUploading}
              onClick={() => onImageChange("")}
            >
              {t("common.removeImage")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}