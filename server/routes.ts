import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCharacterSchema, insertCampaignSchema, insertNpcSchema, insertCreatureSchema, insertEncounterSchema, insertCampaignLocationSchema, insertSessionNoteSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Configurar o armazenamento do Multer
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `character-${uniqueSuffix}${ext}`);
  },
});

// Configurar filtro de arquivo para permitir apenas imagens
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Criar instância do Multer
const upload = multer({ 
  storage: storage_config,
  limits: { fileSize: 5 * 1024 * 1024 }, // limite de 5MB
  fileFilter
});

// Função para salvar imagem de base64 para arquivo
function saveBase64Image(base64Data: string, entityType: string = 'npc'): string | null {
  try {
    // Verificar se a string base64 é válida
    if (!base64Data || !base64Data.includes('base64')) {
      console.log('Dados base64 inválidos');
      return null;
    }

    // Criar diretório assets se não existir
    const assetsDir = 'public/assets';
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    console.log(`Diretório de assets: ${path.resolve(assetsDir)}`);

    // Extrair os dados da string base64
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.log('Formato base64 inválido');
      return null;
    }

    // Determinar o tipo de arquivo e extensão
    const mimeType = matches[1];
    const base64 = matches[2];
    let extension = '.jpg'; // default
    
    if (mimeType.includes('jpeg')) {
      extension = '.jpg';
    } else if (mimeType.includes('png')) {
      extension = '.png';
    } else if (mimeType.includes('gif')) {
      extension = '.gif';
    } else if (mimeType.includes('webp')) {
      extension = '.webp';
    }

    // Gerar um nome de arquivo único
    const hash = crypto.createHash('md5').update(base64.substring(0, 100) + Date.now()).digest('hex');
    const filename = `${entityType}-${hash}${extension}`;
    const filepath = `${assetsDir}/${filename}`;
    
    console.log(`Criando arquivo em: ${filepath}`);

    // Salvar o arquivo
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filepath, buffer);
    
    // Confirmar caminho após gravação
    console.log(`Arquivo salvo com sucesso: ${fs.existsSync(filepath)}`);

    // Retornar o caminho público para o arquivo
    const publicPath = `/assets/${filename}`;
    console.log(`Caminho público retornado: ${publicPath}`);
    return publicPath;
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Certifique-se de que os diretórios necessários existem
  if (!fs.existsSync("public/uploads")) {
    fs.mkdirSync("public/uploads", { recursive: true });
  }
  
  if (!fs.existsSync("public/assets")) {
    fs.mkdirSync("public/assets", { recursive: true });
  }
  
  // Servir arquivos estáticos da pasta public
  app.use(express.static("public"));

  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Character routes
  app.get("/api/characters", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const characters = await storage.getCharactersByUserId(userId);
    res.json(characters);
  });

  app.get("/api/characters/:id", requireAuth, async (req, res) => {
    const characterId = parseInt(req.params.id);
    const character = await storage.getCharacter(characterId);
    
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    
    if (character.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to character" });
    }
    
    res.json(character);
  });

  app.post("/api/characters", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const now = new Date().toISOString();
      
      const characterData = insertCharacterSchema.parse({
        ...req.body,
        userId,
        created: now,
        updated: now
      });
      
      const character = await storage.createCharacter(characterData);
      res.status(201).json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create character" });
    }
  });

  app.put("/api/characters/:id", requireAuth, async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      if (character.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to character" });
      }
      
      const updatedCharacter = await storage.updateCharacter(characterId, {
        ...req.body,
        updated: new Date().toISOString()
      });
      
      res.json(updatedCharacter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update character" });
    }
  });
  
  // Adicionando rota PATCH para compatibilidade com o cliente
  app.patch("/api/characters/:id", requireAuth, async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      if (character.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to character" });
      }
      
      const updatedCharacter = await storage.updateCharacter(characterId, {
        ...req.body,
        updated: new Date().toISOString()
      });
      
      res.json(updatedCharacter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update character" });
    }
  });

  app.delete("/api/characters/:id", requireAuth, async (req, res) => {
    const characterId = parseInt(req.params.id);
    const character = await storage.getCharacter(characterId);
    
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }
    
    if (character.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to character" });
    }
    
    const deleted = await storage.deleteCharacter(characterId);
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to delete character" });
    }
  });
  
  // Rota para upload de imagem de personagem
  app.post("/api/upload/character-image", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Construir o caminho da imagem relativo à pasta public
      const imagePath = `/uploads/${req.file.filename}`;
      
      // Retornar o caminho da imagem para o cliente
      res.status(200).json({ 
        message: "Image uploaded successfully", 
        imagePath 
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const campaigns = await storage.getCampaignsByUserId(userId);
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", requireAuth, async (req, res) => {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to campaign" });
    }
    
    res.json(campaign);
  });

  app.post("/api/campaigns", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const now = new Date().toISOString();
      
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        userId,
        created: now,
        updated: now
      });
      
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.put("/api/campaigns/:id", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const updatedCampaign = await storage.updateCampaign(campaignId, {
        ...req.body,
        updated: new Date().toISOString()
      });
      
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", requireAuth, async (req, res) => {
    const campaignId = parseInt(req.params.id);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to campaign" });
    }
    
    const deleted = await storage.deleteCampaign(campaignId);
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // NPC routes
  app.get("/api/campaigns/:campaignId/npcs", requireAuth, async (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to campaign" });
    }
    
    const npcs = await storage.getNpcsByCampaignId(campaignId);
    res.json(npcs);
  });

  app.post("/api/campaigns/:campaignId/npcs", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const now = new Date().toISOString();
      const npcData = insertNpcSchema.parse({
        ...req.body,
        campaignId,
        created: now,
        updated: now
      });
      
      const npc = await storage.createNpc(npcData);
      res.status(201).json(npc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid NPC data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create NPC" });
    }
  });

  // Endpoint alternativo para criação de NPCs
  app.post("/api/npcs", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.body.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const now = new Date().toISOString();
      
      // Processar imagem base64 se existir
      let modifiedReqBody = { ...req.body };
      
      // Remover campos que não existem na tabela para evitar erros
      if (modifiedReqBody.relationships) {
        // Se houver relationships, adicionar às notas
        modifiedReqBody.notes = modifiedReqBody.notes 
          ? `${modifiedReqBody.notes}\nRelações: ${modifiedReqBody.relationships}`
          : `Relações: ${modifiedReqBody.relationships}`;
        
        // Remover o campo relationships
        delete modifiedReqBody.relationships;
      }
      
      // Garantir que entityType está definido
      if (!modifiedReqBody.entityType) {
        modifiedReqBody.entityType = 'npc'; // Default para 'npc' se não estiver definido
        console.log(`Definindo entityType para: ${modifiedReqBody.entityType}`);
      }
      
      if (req.body.imageUrl && req.body.imageUrl.startsWith('data:')) {
        // Salvar imagem base64 como arquivo
        const imagePath = saveBase64Image(req.body.imageUrl, modifiedReqBody.entityType);
        if (imagePath) {
          console.log(`Imagem salva em: ${imagePath}`);
          
          // Atualizar diretamente o campo image_url para garantir compatibilidade com o banco
          modifiedReqBody.imageUrl = imagePath;
          
          // Adicione log para confirmar o caminho da imagem após processamento
          console.log(`Caminho da imagem após processamento: ${modifiedReqBody.imageUrl}`);
          console.log("Objeto NPC após processamento de imagem:", JSON.stringify(modifiedReqBody, null, 2));
        } else {
          // Se não conseguir salvar, remover o campo para evitar salvar a string base64 no banco
          console.log('Falha ao processar imagem base64, removendo imageUrl');
          delete modifiedReqBody.imageUrl;
        }
      }
      console.log(`entityType para criação: ${modifiedReqBody.entityType}`);
      
      // Processar atributos e estatísticas da criatura/NPC extraindo de memorableTrait ou notes
      if (modifiedReqBody.memorableTrait && modifiedReqBody.memorableTrait.includes('FOR:')) {
        // Extrai valores de atributos do memorableTrait (exemplo: "FOR:10 DES:14 CON:12 INT:18 SAB:15 CAR:13")
        const attrStr = modifiedReqBody.memorableTrait;
        const strMatch = attrStr.match(/FOR:(\d+)/);
        const dexMatch = attrStr.match(/DES:(\d+)/);
        const conMatch = attrStr.match(/CON:(\d+)/);
        const intMatch = attrStr.match(/INT:(\d+)/);
        const wisMatch = attrStr.match(/SAB:(\d+)/);
        const chaMatch = attrStr.match(/CAR:(\d+)/);
        
        if (strMatch) modifiedReqBody.strength = strMatch[1];
        if (dexMatch) modifiedReqBody.dexterity = dexMatch[1];
        if (conMatch) modifiedReqBody.constitution = conMatch[1];
        if (intMatch) modifiedReqBody.intelligence = intMatch[1];
        if (wisMatch) modifiedReqBody.wisdom = wisMatch[1];
        if (chaMatch) modifiedReqBody.charisma = chaMatch[1];
      }
      
      // Extrair pontos de vida das notas se disponível
      if (modifiedReqBody.notes && modifiedReqBody.notes.includes('Vida/Resistência:')) {
        const hpMatch = modifiedReqBody.notes.match(/Vida\/Resistência:\s*(\d+)/);
        if (hpMatch) {
          modifiedReqBody.healthPoints = hpMatch[1];
        }
      }
      
      // Definir ameaça com base na entidade
      if (modifiedReqBody.entityType === 'creature' && !modifiedReqBody.threatLevel) {
        modifiedReqBody.threatLevel = 'Desafiador';
      } else if (!modifiedReqBody.threatLevel) {
        modifiedReqBody.threatLevel = modifiedReqBody.role === 'Vilão' ? 'Perigoso' : 'Inofensivo';
      }
      
      // Extrair habilidades especiais do campo appearance se disponível
      if (modifiedReqBody.appearance && !modifiedReqBody.specialAbilities) {
        modifiedReqBody.specialAbilities = modifiedReqBody.appearance;
      }
      
      console.log('Objeto para validação Zod:', {
        ...modifiedReqBody,
        created: now,
        updated: now
      });
      
      // Garantir que entityType está definido
      if (!modifiedReqBody.entityType) {
        modifiedReqBody.entityType = 'npc'; // Default para 'npc' se não estiver definido
      }
      
      console.log('entityType antes da validação:', modifiedReqBody.entityType);
      
      const npcData = insertNpcSchema.parse({
        ...modifiedReqBody,
        created: now,
        updated: now
      });
      
      console.log('Objeto após validação Zod:', npcData);
      console.log('entityType após validação:', npcData.entityType);
      
      const npc = await storage.createNpc(npcData);
      res.status(201).json(npc);
    } catch (error) {
      console.error("Erro ao criar NPC:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid NPC data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create NPC" });
    }
  });
  

  app.put("/api/npcs/:id", requireAuth, async (req, res) => {
    try {
      const npcId = parseInt(req.params.id);
      const npc = await storage.getNpc(npcId);
      
      if (!npc) {
        return res.status(404).json({ message: "NPC not found" });
      }
      
      const campaign = await storage.getCampaign(npc.campaignId);
      
      if (campaign?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to NPC" });
      }
      
      const updatedNpc = await storage.updateNpc(npcId, {
        ...req.body,
        updated: new Date().toISOString()
      });
      
      res.json(updatedNpc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid NPC data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update NPC" });
    }
  });
  
  // Adicionando rota PATCH para compatibilidade com o cliente
  app.patch("/api/npcs/:id", requireAuth, async (req, res) => {
    try {
      const npcId = parseInt(req.params.id);
      const npc = await storage.getNpc(npcId);
      
      if (!npc) {
        return res.status(404).json({ message: "NPC not found" });
      }
      
      const campaign = await storage.getCampaign(npc.campaignId);
      
      if (campaign?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to NPC" });
      }
      
      // Processar imagem base64 se existir
      let modifiedReqBody = { ...req.body };
      
      // Remover campos que não existem na tabela para evitar erros
      if (modifiedReqBody.relationships) {
        // Se houver relationships, adicionar às notas
        modifiedReqBody.notes = modifiedReqBody.notes 
          ? `${modifiedReqBody.notes}\nRelações: ${modifiedReqBody.relationships}`
          : `Relações: ${modifiedReqBody.relationships}`;
        
        // Remover o campo relationships
        delete modifiedReqBody.relationships;
      }
      
      // Garantir que entityType está definido
      if (!modifiedReqBody.entityType) {
        // Manter o tipo existente ou definir como 'npc' se não houver
        modifiedReqBody.entityType = npc.entityType || 'npc';
        console.log(`Definindo entityType para: ${modifiedReqBody.entityType}`);
      }
      
      if (req.body.imageUrl && req.body.imageUrl.startsWith('data:')) {
        // Salvar imagem base64 como arquivo
        const imagePath = saveBase64Image(req.body.imageUrl, modifiedReqBody.entityType);
        if (imagePath) {
          console.log(`Imagem atualizada e salva em: ${imagePath}`);
          // Atualizar a URL da imagem para o caminho do arquivo salvo
          modifiedReqBody.imageUrl = imagePath;
          console.log(`Caminho da imagem após processamento (PATCH): ${modifiedReqBody.imageUrl}`);
        } else {
          // Se não conseguir salvar, remover o campo para evitar salvar a string base64 no banco
          console.log('Falha ao processar imagem base64, removendo imageUrl');
          delete modifiedReqBody.imageUrl;
        }
      }
      
      console.log("Dados que serão enviados para updateNpc:", JSON.stringify({
        ...modifiedReqBody,
        updated: new Date().toISOString()
      }, null, 2));
      console.log(`entityType para atualização: ${modifiedReqBody.entityType}`);
      
      // Processar atributos e estatísticas da criatura/NPC extraindo de memorableTrait ou notes
      if (modifiedReqBody.memorableTrait && modifiedReqBody.memorableTrait.includes('FOR:')) {
        // Extrai valores de atributos do memorableTrait (exemplo: "FOR:10 DES:14 CON:12 INT:18 SAB:15 CAR:13")
        const attrStr = modifiedReqBody.memorableTrait;
        const strMatch = attrStr.match(/FOR:(\d+)/);
        const dexMatch = attrStr.match(/DES:(\d+)/);
        const conMatch = attrStr.match(/CON:(\d+)/);
        const intMatch = attrStr.match(/INT:(\d+)/);
        const wisMatch = attrStr.match(/SAB:(\d+)/);
        const chaMatch = attrStr.match(/CAR:(\d+)/);
        
        if (strMatch) modifiedReqBody.strength = strMatch[1];
        if (dexMatch) modifiedReqBody.dexterity = dexMatch[1];
        if (conMatch) modifiedReqBody.constitution = conMatch[1];
        if (intMatch) modifiedReqBody.intelligence = intMatch[1];
        if (wisMatch) modifiedReqBody.wisdom = wisMatch[1];
        if (chaMatch) modifiedReqBody.charisma = chaMatch[1];
      }
      
      // Extrair pontos de vida das notas se disponível
      if (modifiedReqBody.notes && modifiedReqBody.notes.includes('Vida/Resistência:')) {
        const hpMatch = modifiedReqBody.notes.match(/Vida\/Resistência:\s*(\d+)/);
        if (hpMatch) {
          modifiedReqBody.healthPoints = hpMatch[1];
        }
      }
      
      // Definir ameaça com base na entidade
      if (modifiedReqBody.entityType === 'creature' && !modifiedReqBody.threatLevel) {
        modifiedReqBody.threatLevel = 'Desafiador';
      } else if (!modifiedReqBody.threatLevel && modifiedReqBody.role) {
        modifiedReqBody.threatLevel = modifiedReqBody.role === 'Vilão' ? 'Perigoso' : 'Inofensivo';
      }
      
      // Extrair habilidades especiais do campo appearance se disponível
      if (modifiedReqBody.appearance && !modifiedReqBody.specialAbilities) {
        modifiedReqBody.specialAbilities = modifiedReqBody.appearance;
      }
      
      const updatedNpc = await storage.updateNpc(npcId, {
        ...modifiedReqBody,
        updated: new Date().toISOString()
      });
      
      res.json(updatedNpc);
    } catch (error) {
      console.error("Erro ao atualizar NPC:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid NPC data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update NPC" });
    }
  });

  app.delete("/api/npcs/:id", requireAuth, async (req, res) => {
    const npcId = parseInt(req.params.id);
    const npc = await storage.getNpc(npcId);
    
    if (!npc) {
      return res.status(404).json({ message: "NPC not found" });
    }
    
    const campaign = await storage.getCampaign(npc.campaignId);
    
    if (campaign?.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to NPC" });
    }
    
    const deleted = await storage.deleteNpc(npcId);
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to delete NPC" });
    }
  });

  // Creature routes
  app.get("/api/campaigns/:campaignId/creatures", requireAuth, async (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to campaign" });
    }
    
    const creatures = await storage.getCreaturesByCampaignId(campaignId);
    res.json(creatures);
  });

  app.post("/api/campaigns/:campaignId/creatures", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const now = new Date().toISOString();
      const creatureData = insertCreatureSchema.parse({
        ...req.body,
        campaignId,
        created: now,
        updated: now
      });
      
      // Garantir que entityType está definido como 'creature'
      creatureData.entityType = 'creature';
      
      const creature = await storage.createCreature(creatureData);
      res.status(201).json(creature);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid creature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create creature" });
    }
  });

  // Endpoint alternativo para criação de criaturas
  app.post("/api/creatures", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.body.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const now = new Date().toISOString();
      
      // Processar imagem base64 se existir
      let modifiedReqBody = { ...req.body };
      
      // Garantir que entityType está definido como 'creature'
      modifiedReqBody.entityType = 'creature';
      console.log(`Definindo entityType para: ${modifiedReqBody.entityType}`);
      
      if (req.body.imageUrl && req.body.imageUrl.startsWith('data:')) {
        // Salvar imagem base64 como arquivo
        const imagePath = saveBase64Image(req.body.imageUrl, 'creature');
        if (imagePath) {
          console.log(`Imagem salva em: ${imagePath}`);
          
          // Atualizar caminho da imagem
          modifiedReqBody.imageUrl = imagePath;
          
          console.log(`Caminho da imagem após processamento: ${modifiedReqBody.imageUrl}`);
        } else {
          // Se não conseguir salvar, remover o campo para evitar salvar a string base64 no banco
          console.log('Falha ao processar imagem base64, removendo imageUrl');
          delete modifiedReqBody.imageUrl;
        }
      }
      
      // Processar atributos da criatura extraindo de memorableTrait ou notes
      if (modifiedReqBody.memorableTrait && modifiedReqBody.memorableTrait.includes('FOR:')) {
        // Extrai valores de atributos do memorableTrait (exemplo: "FOR:10 DES:14 CON:12 INT:18 SAB:15 CAR:13")
        const attrStr = modifiedReqBody.memorableTrait;
        const strMatch = attrStr.match(/FOR:(\d+)/);
        const dexMatch = attrStr.match(/DES:(\d+)/);
        const conMatch = attrStr.match(/CON:(\d+)/);
        const intMatch = attrStr.match(/INT:(\d+)/);
        const wisMatch = attrStr.match(/SAB:(\d+)/);
        const chaMatch = attrStr.match(/CAR:(\d+)/);
        
        if (strMatch) modifiedReqBody.strength = strMatch[1];
        if (dexMatch) modifiedReqBody.dexterity = dexMatch[1];
        if (conMatch) modifiedReqBody.constitution = conMatch[1];
        if (intMatch) modifiedReqBody.intelligence = intMatch[1];
        if (wisMatch) modifiedReqBody.wisdom = wisMatch[1];
        if (chaMatch) modifiedReqBody.charisma = chaMatch[1];
      }
      
      const data = insertCreatureSchema.parse({
        ...modifiedReqBody,
        created: now,
        updated: now
      });
      
      const creature = await storage.createCreature(data);
      res.status(201).json(creature);
    } catch (error) {
      console.error("Erro ao criar criatura:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid creature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create creature" });
    }
  });

  app.get("/api/creatures/:id", requireAuth, async (req, res) => {
    try {
      const creatureId = parseInt(req.params.id);
      const creature = await storage.getCreature(creatureId);
      
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      
      // Garantir que o usuário tem acesso à criatura via campanha
      const campaign = await storage.getCampaign(creature.campaignId);
      if (!campaign || campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to creature" });
      }
      
      res.json(creature);
    } catch (error) {
      console.error("Error fetching creature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/creatures/:id", requireAuth, async (req, res) => {
    try {
      const creatureId = parseInt(req.params.id);
      const creature = await storage.getCreature(creatureId);
      
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      
      // Garantir que o usuário tem acesso à criatura via campanha
      const campaign = await storage.getCampaign(creature.campaignId);
      if (!campaign || campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to creature" });
      }
      
      // Processar imagem base64 se existir
      let modifiedReqBody = { ...req.body };
      
      if (req.body.imageUrl && req.body.imageUrl.startsWith('data:')) {
        const imagePath = saveBase64Image(req.body.imageUrl, 'creature');
        if (imagePath) {
          modifiedReqBody.imageUrl = imagePath;
        } else {
          delete modifiedReqBody.imageUrl;
        }
      }
      
      const updatedCreature = await storage.updateCreature(creatureId, {
        ...modifiedReqBody,
        entityType: 'creature', // Garantir que entityType é mantido
        updated: new Date().toISOString()
      });
      
      res.json(updatedCreature);
    } catch (error) {
      console.error("Error updating creature:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid creature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update creature" });
    }
  });

  app.patch("/api/creatures/:id", requireAuth, async (req, res) => {
    try {
      const creatureId = parseInt(req.params.id);
      const creature = await storage.getCreature(creatureId);
      
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      
      // Garantir que o usuário tem acesso à criatura via campanha
      const campaign = await storage.getCampaign(creature.campaignId);
      if (!campaign || campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to creature" });
      }
      
      // Processar imagem base64 se existir
      let modifiedReqBody = { ...req.body };
      
      if (req.body.imageUrl && req.body.imageUrl.startsWith('data:')) {
        const imagePath = saveBase64Image(req.body.imageUrl, 'creature');
        if (imagePath) {
          modifiedReqBody.imageUrl = imagePath;
        } else {
          delete modifiedReqBody.imageUrl;
        }
      }
      
      const updatedCreature = await storage.updateCreature(creatureId, {
        ...modifiedReqBody,
        entityType: 'creature', // Garantir que entityType é mantido
        updated: new Date().toISOString()
      });
      
      res.json(updatedCreature);
    } catch (error) {
      console.error("Error updating creature:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid creature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update creature" });
    }
  });

  app.delete("/api/creatures/:id", requireAuth, async (req, res) => {
    const creatureId = parseInt(req.params.id);
    
    try {
      // Garantir que a criatura existe
      const creature = await storage.getCreature(creatureId);
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      
      // Garantir que o usuário tem acesso à criatura via campanha
      const campaign = await storage.getCampaign(creature.campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to creature" });
      }
      
      // Deletar a criatura
      const deleted = await storage.deleteCreature(creatureId);
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete creature" });
      }
    } catch (error) {
      console.error("Error deleting creature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Encounter routes
  app.get("/api/campaigns/:campaignId/encounters", requireAuth, async (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to campaign" });
    }
    
    const encounters = await storage.getEncountersByCampaignId(campaignId);
    res.json(encounters);
  });

  app.post("/api/campaigns/:campaignId/encounters", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const now = new Date().toISOString();
      const encounterData = insertEncounterSchema.parse({
        ...req.body,
        campaignId,
        created: now,
        updated: now
      });
      
      const encounter = await storage.createEncounter(encounterData);
      res.status(201).json(encounter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid encounter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create encounter" });
    }
  });

  app.put("/api/encounters/:id", requireAuth, async (req, res) => {
    try {
      const encounterId = parseInt(req.params.id);
      const encounter = await storage.getEncounter(encounterId);
      
      if (!encounter) {
        return res.status(404).json({ message: "Encounter not found" });
      }
      
      const campaign = await storage.getCampaign(encounter.campaignId);
      
      if (campaign?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to encounter" });
      }
      
      const updatedEncounter = await storage.updateEncounter(encounterId, {
        ...req.body,
        updated: new Date().toISOString()
      });
      
      res.json(updatedEncounter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid encounter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update encounter" });
    }
  });

  app.delete("/api/encounters/:id", requireAuth, async (req, res) => {
    const encounterId = parseInt(req.params.id);
    const encounter = await storage.getEncounter(encounterId);
    
    if (!encounter) {
      return res.status(404).json({ message: "Encounter not found" });
    }
    
    const campaign = await storage.getCampaign(encounter.campaignId);
    
    if (campaign?.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to encounter" });
    }
    
    const deleted = await storage.deleteEncounter(encounterId);
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to delete encounter" });
    }
  });

  // Location routes
  app.get("/api/campaigns/:campaignId/locations", requireAuth, async (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to campaign" });
    }
    
    const locations = await storage.getLocationsByCampaignId(campaignId);
    res.json(locations);
  });

  app.post("/api/campaigns/:campaignId/locations", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const now = new Date().toISOString();
      const locationData = insertCampaignLocationSchema.parse({
        ...req.body,
        campaignId,
        created: now,
        updated: now
      });
      
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.put("/api/locations/:id", requireAuth, async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      const campaign = await storage.getCampaign(location.campaignId);
      
      if (campaign?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to location" });
      }
      
      const updatedLocation = await storage.updateLocation(locationId, {
        ...req.body,
        updated: new Date().toISOString()
      });
      
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid location data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", requireAuth, async (req, res) => {
    const locationId = parseInt(req.params.id);
    const location = await storage.getLocation(locationId);
    
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    
    const campaign = await storage.getCampaign(location.campaignId);
    
    if (campaign?.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to location" });
    }
    
    const deleted = await storage.deleteLocation(locationId);
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Session notes routes
  app.get("/api/campaigns/:campaignId/session-notes", requireAuth, async (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to campaign" });
    }
    
    const notes = await storage.getSessionNotesByCampaignId(campaignId);
    res.json(notes);
  });
  
  // Rota para gerar automaticamente um NPC ou criatura com a OpenAI
  // Rota para gerar o mapa do mundo baseado nos dados da campanha
  app.post("/api/generate-world-map", requireAuth, async (req, res) => {
    try {
      const { campaignId, style } = req.body;
      
      if (!campaignId) {
        return res.status(400).json({ message: "Campaign ID is required" });
      }
      
      // Verificar se a campanha existe e se pertence ao usuário
      const campaign = await storage.getCampaign(parseInt(String(campaignId)));
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      // Importar dinamicamente para evitar erros se a API_KEY não existir
      const { generateWorldMap } = await import('./openai');
      
      // Coletar dados dos locais da campanha para enriquecer o mapa
      const locations = await storage.getLocationsByCampaignId(parseInt(String(campaignId)));
      
      // Preparar as opções para geração do mapa
      const mapOptions = {
        campaignName: campaign.name,
        centralConcept: campaign.centralConcept || undefined,
        geography: campaign.geography || undefined,
        factions: campaign.factions || undefined,
        history: campaign.history || undefined,
        magicTech: campaign.magicTech || undefined,
        style: style || undefined,
        locations: locations.map(location => ({
          name: location.name,
          description: location.description || ""
        }))
      };
      
      // Gerar o mapa
      const mapImageUrl = await generateWorldMap(mapOptions);
      
      // Atualizar a URL do mapa na campanha
      await storage.updateCampaign(campaign.id, {
        ...campaign,
        mapImageUrl
      });
      
      // Retornar a URL da imagem gerada
      res.json({ mapImageUrl });
      
    } catch (error) {
      console.error("Erro ao gerar mapa do mundo:", error);
      res.status(500).json({ 
        message: "Erro ao gerar mapa do mundo", 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      });
    }
  });

  app.post("/api/generate-npc", requireAuth, async (req, res) => {
    try {
      const { tipo = 'npc', campanha, nivel, terreno, estilo, campaignId } = req.body;
      
      // Importar dinamicamente para evitar erros se a API_KEY não existir
      const { generateNPC } = await import('./openai');
      
      // Se tiver um campaignId, buscar informações da campanha para contextualizar a geração
      let campaignInfo = '';
      if (campaignId) {
        try {
          const campaign = await storage.getCampaign(parseInt(String(campaignId)));
          if (campaign) {
            campaignInfo = `
              Nome da Campanha: ${campaign.name}
              Descrição: ${campaign.description || 'Não disponível'}
              Ambiente: ${campaign.setting || 'Não especificado'}
              Estilo: ${campaign.gameSystem || 'D&D 5e'}
            `;
            
            // Buscar NPCs existentes para contexto adicional
            const npcs = await storage.getNpcsByCampaignId(parseInt(String(campaignId)));
            if (npcs && npcs.length > 0) {
              campaignInfo += '\nPersonagens importantes na campanha:\n';
              
              // Limitar a 3 NPCs para evitar contexto muito grande
              const limitedNpcs = npcs.slice(0, 3);
              for (const npc of limitedNpcs) {
                campaignInfo += `- ${npc.name}: ${npc.role || 'Papel desconhecido'}\n`;
              }
            }
            
            // Buscar localizações para contexto adicional
            const locations = await storage.getLocationsByCampaignId(parseInt(String(campaignId)));
            if (locations && locations.length > 0) {
              campaignInfo += '\nLocais importantes na campanha:\n';
              
              // Limitar a 3 locais para evitar contexto muito grande
              const limitedLocations = locations.slice(0, 3);
              for (const location of limitedLocations) {
                campaignInfo += `- ${location.name}: ${location.description ? location.description.substring(0, 100) + '...' : 'Sem descrição'}\n`;
              }
            }
          }
        } catch (err) {
          console.warn('Erro ao buscar informações da campanha para contexto:', err);
          // Continue mesmo se não conseguir buscar informações da campanha
        }
      }
      
      console.log('Informações da campanha para contexto:', campaignInfo || 'Nenhuma');
      
      // Gerar o NPC com as opções fornecidas e contexto da campanha
      const generatedNPC = await generateNPC({ 
        tipo: tipo as 'npc' | 'creature',
        campanha: campanha || '',
        nivel,
        terreno,
        estilo,
        // Adicionar informações da campanha como contexto para a geração
        campaignContext: campaignInfo || undefined
      });
      
      res.json(generatedNPC);
    } catch (error) {
      console.error("Erro ao gerar NPC:", error);
      res.status(500).json({ 
        message: "Falha ao gerar NPC", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/campaigns/:campaignId/session-notes", requireAuth, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      const now = new Date().toISOString();
      const noteData = insertSessionNoteSchema.parse({
        ...req.body,
        campaignId,
        created: now,
        updated: now
      });
      
      const note = await storage.createSessionNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create session note" });
    }
  });

  app.put("/api/session-notes/:id", requireAuth, async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const note = await storage.getSessionNote(noteId);
      
      if (!note) {
        return res.status(404).json({ message: "Session note not found" });
      }
      
      const campaign = await storage.getCampaign(note.campaignId);
      
      if (campaign?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to session note" });
      }
      
      const updatedNote = await storage.updateSessionNote(noteId, {
        ...req.body,
        updated: new Date().toISOString()
      });
      
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update session note" });
    }
  });

  app.delete("/api/session-notes/:id", requireAuth, async (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = await storage.getSessionNote(noteId);
    
    if (!note) {
      return res.status(404).json({ message: "Session note not found" });
    }
    
    const campaign = await storage.getCampaign(note.campaignId);
    
    if (campaign?.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to session note" });
    }
    
    const deleted = await storage.deleteSessionNote(noteId);
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(500).json({ message: "Failed to delete session note" });
    }
  });

  // Upload de imagem para personagem
  app.post("/api/upload/character-image", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
      }
      
      // Retorna o caminho relativo da imagem salva
      const imagePath = `/uploads/${req.file.filename}`;
      res.status(200).json({ imagePath });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      res.status(500).json({ message: "Falha ao fazer upload da imagem" });
    }
  });

  // Rota para servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static('public/uploads'));
  
  const httpServer = createServer(app);
  return httpServer;
}
