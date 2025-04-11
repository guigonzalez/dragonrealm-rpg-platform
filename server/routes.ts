import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCharacterSchema, insertCampaignSchema, insertNpcSchema, insertEncounterSchema, insertCampaignLocationSchema, insertSessionNoteSchema } from "@shared/schema";
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
      if (req.body.imageUrl && req.body.imageUrl.startsWith('data:')) {
        // Salvar imagem base64 como arquivo
        const imagePath = saveBase64Image(req.body.imageUrl, req.body.entityType || 'npc');
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
      
      const npcData = insertNpcSchema.parse({
        ...modifiedReqBody,
        created: now,
        updated: now
      });
      
      console.log('Objeto após validação Zod:', npcData);
      
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
  
  // Rota para gerar automaticamente um NPC ou criatura com a OpenAI
  app.post("/api/generate-npc", requireAuth, async (req, res) => {
    try {
      const { tipo = 'npc', campanha, nivel, terreno, estilo } = req.body;
      
      // Importar dinamicamente para evitar erros se a API_KEY não existir
      const { generateNPC } = await import('./openai');
      
      // Gerar o NPC com as opções fornecidas
      const generatedNPC = await generateNPC({ 
        tipo: tipo as 'npc' | 'creature',
        campanha,
        nivel,
        terreno,
        estilo 
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
      if (req.body.imageUrl && req.body.imageUrl.startsWith('data:')) {
        // Salvar imagem base64 como arquivo
        const imagePath = saveBase64Image(req.body.imageUrl, req.body.entityType || 'npc');
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
  app.post("/api/generate-npc", requireAuth, async (req, res) => {
    try {
      const { tipo = 'npc', campanha, nivel, terreno, estilo } = req.body;
      
      // Importar dinamicamente para evitar erros se a API_KEY não existir
      const { generateNPC } = await import('./openai');
      
      // Gerar o NPC com as opções fornecidas
      const generatedNPC = await generateNPC({ 
        tipo: tipo as 'npc' | 'creature',
        campanha,
        nivel,
        terreno,
        estilo 
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
