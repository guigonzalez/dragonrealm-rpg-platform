import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCharacterSchema, insertCampaignSchema, insertNpcSchema, insertEncounterSchema, insertCampaignLocationSchema, insertSessionNoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
