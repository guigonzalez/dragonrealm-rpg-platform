import { users, type User, type InsertUser, characters, type Character, type InsertCharacter, campaigns, type Campaign, type InsertCampaign, npcs, type Npc, type InsertNpc, encounters, type Encounter, type InsertEncounter, campaignLocations, type CampaignLocation, type InsertCampaignLocation, sessionNotes, type SessionNote, type InsertSessionNote } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Character operations
  getCharacter(id: number): Promise<Character | undefined>;
  getCharactersByUserId(userId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;

  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // NPC operations
  getNpc(id: number): Promise<Npc | undefined>;
  getNpcsByCampaignId(campaignId: number): Promise<Npc[]>;
  createNpc(npc: InsertNpc): Promise<Npc>;
  updateNpc(id: number, npc: Partial<Npc>): Promise<Npc | undefined>;
  deleteNpc(id: number): Promise<boolean>;
  
  // Creature operations
  getCreature(id: number): Promise<Creature | undefined>;
  getCreaturesByCampaignId(campaignId: number): Promise<Creature[]>;
  createCreature(creature: InsertCreature): Promise<Creature>;
  updateCreature(id: number, creature: Partial<Creature>): Promise<Creature | undefined>;
  deleteCreature(id: number): Promise<boolean>;

  // Encounter operations
  getEncounter(id: number): Promise<Encounter | undefined>;
  getEncountersByCampaignId(campaignId: number): Promise<Encounter[]>;
  createEncounter(encounter: InsertEncounter): Promise<Encounter>;
  updateEncounter(id: number, encounter: Partial<Encounter>): Promise<Encounter | undefined>;
  deleteEncounter(id: number): Promise<boolean>;

  // Location operations
  getLocation(id: number): Promise<CampaignLocation | undefined>;
  getLocationsByCampaignId(campaignId: number): Promise<CampaignLocation[]>;
  createLocation(location: InsertCampaignLocation): Promise<CampaignLocation>;
  updateLocation(id: number, location: Partial<CampaignLocation>): Promise<CampaignLocation | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Session notes operations
  getSessionNote(id: number): Promise<SessionNote | undefined>;
  getSessionNotesByCampaignId(campaignId: number): Promise<SessionNote[]>;
  createSessionNote(note: InsertSessionNote): Promise<SessionNote>;
  updateSessionNote(id: number, note: Partial<SessionNote>): Promise<SessionNote | undefined>;
  deleteSessionNote(id: number): Promise<boolean>;

  sessionStore: any; // Using any type for session store
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private campaigns: Map<number, Campaign>;
  private npcs: Map<number, Npc>;
  private creatures: Map<number, Creature>;
  private encounters: Map<number, Encounter>;
  private locations: Map<number, CampaignLocation>;
  private sessionNotes: Map<number, SessionNote>;
  sessionStore: any;
  
  private userIdCounter: number;
  private characterIdCounter: number;
  private campaignIdCounter: number;
  private npcIdCounter: number;
  private creatureIdCounter: number;
  private encounterIdCounter: number;
  private locationIdCounter: number;
  private sessionNoteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.campaigns = new Map();
    this.npcs = new Map();
    this.encounters = new Map();
    this.locations = new Map();
    this.sessionNotes = new Map();
    
    this.userIdCounter = 1;
    this.characterIdCounter = 1;
    this.campaignIdCounter = 1;
    this.npcIdCounter = 1;
    this.encounterIdCounter = 1;
    this.locationIdCounter = 1;
    this.sessionNoteIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 1 day in ms
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (character) => character.userId === userId,
    );
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.characterIdCounter++;
    const character: Character = { ...insertCharacter, id };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, characterData: Partial<Character>): Promise<Character | undefined> {
    const character = await this.getCharacter(id);
    if (!character) return undefined;
    
    const updatedCharacter = { ...character, ...characterData };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId,
    );
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const campaign: Campaign = { ...insertCampaign, id };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, campaignData: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = await this.getCampaign(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...campaignData };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // NPC methods
  async getNpc(id: number): Promise<Npc | undefined> {
    return this.npcs.get(id);
  }

  async getNpcsByCampaignId(campaignId: number): Promise<Npc[]> {
    return Array.from(this.npcs.values()).filter(
      (npc) => npc.campaignId === campaignId,
    );
  }

  async createNpc(insertNpc: InsertNpc): Promise<Npc> {
    const id = this.npcIdCounter++;
    const npc: Npc = { ...insertNpc, id };
    this.npcs.set(id, npc);
    return npc;
  }

  async updateNpc(id: number, npcData: Partial<Npc>): Promise<Npc | undefined> {
    const npc = await this.getNpc(id);
    if (!npc) return undefined;
    
    const updatedNpc = { ...npc, ...npcData };
    this.npcs.set(id, updatedNpc);
    return updatedNpc;
  }

  async deleteNpc(id: number): Promise<boolean> {
    return this.npcs.delete(id);
  }

  // Encounter methods
  async getEncounter(id: number): Promise<Encounter | undefined> {
    return this.encounters.get(id);
  }

  async getEncountersByCampaignId(campaignId: number): Promise<Encounter[]> {
    return Array.from(this.encounters.values()).filter(
      (encounter) => encounter.campaignId === campaignId,
    );
  }

  async createEncounter(insertEncounter: InsertEncounter): Promise<Encounter> {
    const id = this.encounterIdCounter++;
    const encounter: Encounter = { ...insertEncounter, id };
    this.encounters.set(id, encounter);
    return encounter;
  }

  async updateEncounter(id: number, encounterData: Partial<Encounter>): Promise<Encounter | undefined> {
    const encounter = await this.getEncounter(id);
    if (!encounter) return undefined;
    
    const updatedEncounter = { ...encounter, ...encounterData };
    this.encounters.set(id, updatedEncounter);
    return updatedEncounter;
  }

  async deleteEncounter(id: number): Promise<boolean> {
    return this.encounters.delete(id);
  }

  // Location methods
  async getLocation(id: number): Promise<CampaignLocation | undefined> {
    return this.locations.get(id);
  }

  async getLocationsByCampaignId(campaignId: number): Promise<CampaignLocation[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.campaignId === campaignId,
    );
  }

  async createLocation(insertLocation: InsertCampaignLocation): Promise<CampaignLocation> {
    const id = this.locationIdCounter++;
    const location: CampaignLocation = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, locationData: Partial<CampaignLocation>): Promise<CampaignLocation | undefined> {
    const location = await this.getLocation(id);
    if (!location) return undefined;
    
    const updatedLocation = { ...location, ...locationData };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Session notes methods
  async getSessionNote(id: number): Promise<SessionNote | undefined> {
    return this.sessionNotes.get(id);
  }

  async getSessionNotesByCampaignId(campaignId: number): Promise<SessionNote[]> {
    return Array.from(this.sessionNotes.values()).filter(
      (note) => note.campaignId === campaignId,
    );
  }

  async createSessionNote(insertNote: InsertSessionNote): Promise<SessionNote> {
    const id = this.sessionNoteIdCounter++;
    const note: SessionNote = { ...insertNote, id };
    this.sessionNotes.set(id, note);
    return note;
  }

  async updateSessionNote(id: number, noteData: Partial<SessionNote>): Promise<SessionNote | undefined> {
    const note = await this.getSessionNote(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...noteData };
    this.sessionNotes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteSessionNote(id: number): Promise<boolean> {
    return this.sessionNotes.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.userId, userId));
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db.insert(characters).values(insertCharacter).returning();
    return character;
  }

  async updateCharacter(id: number, characterData: Partial<Character>): Promise<Character | undefined> {
    const [character] = await db.update(characters).set(characterData).where(eq(characters.id, id)).returning();
    return character;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }

  async updateCampaign(id: number, campaignData: Partial<Campaign>): Promise<Campaign | undefined> {
    const [campaign] = await db.update(campaigns).set(campaignData).where(eq(campaigns.id, id)).returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    // Usando a pool diretamente para criar uma transação
    const { pool } = await import('./db');
    const client = await pool.connect();
    
    try {
      // Iniciar transação
      await client.query('BEGIN');
      
      // 1. Deletar todas as localizações da campanha
      await client.query('DELETE FROM campaign_locations WHERE campaign_id = $1', [id]);
      
      // 2. Deletar todos os NPCs da campanha
      await client.query('DELETE FROM npcs WHERE campaign_id = $1', [id]);
      
      // 3. Deletar todos os encontros da campanha
      await client.query('DELETE FROM encounters WHERE campaign_id = $1', [id]);
      
      // 4. Deletar todas as notas de sessão da campanha
      await client.query('DELETE FROM session_notes WHERE campaign_id = $1', [id]);
      
      // 5. Finalmente deletar a campanha
      const result = await client.query('DELETE FROM campaigns WHERE id = $1', [id]);
      
      // Commit da transação
      await client.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      console.error('Erro ao deletar campanha:', error);
      return false;
    } finally {
      // Sempre liberar o cliente
      client.release();
    }
  }

  // NPC methods
  async getNpc(id: number): Promise<Npc | undefined> {
    try {
      const [npcResult] = await db.select().from(npcs).where(eq(npcs.id, id));
      if (!npcResult) return undefined;
      
      // Convertendo snake_case para camelCase para os novos campos
      const npc = {
        ...npcResult,
        // Ajustando para campos do schema
        imageUrl: npcResult.image_url,
        memorableTrait: npcResult.memorable_trait,
        entityType: npcResult.entity_type || 'npc',
        role: npcResult.role || null,
        motivation: npcResult.motivation || null,
        // Novos campos para atributos de criatura
        strength: npcResult.strength || null,
        dexterity: npcResult.dexterity || null, 
        constitution: npcResult.constitution || null,
        intelligence: npcResult.intelligence || null,
        wisdom: npcResult.wisdom || null,
        charisma: npcResult.charisma || null,
        healthPoints: npcResult.health_points || null,
        threatLevel: npcResult.threat_level || null,
        specialAbilities: npcResult.special_abilities || null
      };
      
      return npc;
    } catch (error) {
      console.error("Erro ao buscar NPC:", error);
      return undefined;
    }
  }

  async getNpcsByCampaignId(campaignId: number): Promise<Npc[]> {
    try {
      // Vamos usar SQL nativo para garantir que todos os campos snake_case são acessados corretamente
      const result = await pool.query(
        `SELECT * FROM npcs WHERE campaign_id = $1 ORDER BY name`, 
        [campaignId]
      );
      
      // Adicionar log para depuração
      console.log(`Recuperados ${result.rows.length} NPCs do banco de dados para campanha ${campaignId}`);
      if (result.rows.length > 0) {
        console.log("Primeiro NPC recuperado:", JSON.stringify(result.rows[0], null, 2));
      }
      
      // Mapear os resultados da SQL diretamente para o formato que o frontend espera
      return result.rows.map(row => {
        console.log(`Processando NPC ${row.id} - ${row.name}`);
        console.log(`Campo image_url do banco: "${row.image_url}"`);
        console.log(`Campo entity_type do banco: "${row.entity_type}"`);
        
        // Mapeamento explícito de snake_case para camelCase
        const npc: Npc = {
          id: row.id,
          campaignId: row.campaign_id,
          name: row.name,
          race: row.race,
          occupation: row.occupation,
          location: row.location,
          appearance: row.appearance,
          personality: row.personality,
          abilities: row.abilities,
          notes: row.notes,
          // Campos que estavam apresentando problemas 
          imageUrl: row.image_url, 
          memorableTrait: row.memorable_trait,
          entityType: row.entity_type || 'npc',
          role: row.role,
          motivation: row.motivation,
          strength: row.strength,
          dexterity: row.dexterity, 
          constitution: row.constitution,
          intelligence: row.intelligence,
          wisdom: row.wisdom,
          charisma: row.charisma,
          healthPoints: row.health_points,
          threatLevel: row.threat_level,
          specialAbilities: row.special_abilities,
          created: row.created,
          updated: row.updated
        };
        
        console.log(`Campo imageUrl após mapeamento: "${npc.imageUrl}"`);
        console.log(`Campo entityType após mapeamento: "${npc.entityType}"`);
        
        return npc;
      });
    } catch (error) {
      console.error("Erro ao buscar NPCs:", error);
      return [];
    }
  }

  async createNpc(insertNpc: InsertNpc): Promise<Npc> {
    try {
      // Adicione log completo para depuração
      console.log("Inserindo NPC na DatabaseStorage:", JSON.stringify(insertNpc, null, 2));
      console.log("EntityType recebido:", insertNpc.entityType);
      
      // Simplificando a inserção usando Drizzle ORM
      const data = {
        campaignId: insertNpc.campaignId,
        name: insertNpc.name,
        race: insertNpc.race || null,
        occupation: insertNpc.occupation || null,
        location: insertNpc.location || null,
        appearance: insertNpc.appearance || null,
        personality: insertNpc.personality || null,
        abilities: insertNpc.abilities || null,
        notes: insertNpc.notes || null,
        // Novos campos adicionados ao schema - mantenha imageUrl como snake_case no banco de dados
        image_url: insertNpc.imageUrl || null, // Mapeia de imageUrl (camelCase) para image_url (snake_case)
        memorable_trait: insertNpc.memorableTrait || null,
        entity_type: insertNpc.entityType === 'creature' ? 'creature' : 'npc', // Garantir que o valor seja preservado
        role: insertNpc.role || null,
        motivation: insertNpc.motivation || null,
        // Novos campos para atributos de criatura
        strength: insertNpc.strength || null,
        dexterity: insertNpc.dexterity || null,
        constitution: insertNpc.constitution || null,
        intelligence: insertNpc.intelligence || null,
        wisdom: insertNpc.wisdom || null,
        charisma: insertNpc.charisma || null,
        health_points: insertNpc.healthPoints || null,
        threat_level: insertNpc.threatLevel || null,
        special_abilities: insertNpc.specialAbilities || null,
        created: insertNpc.created,
        updated: insertNpc.updated
      };
      
      console.log("Inserindo NPC:", data);
      
      // Usando Drizzle ORM em vez de SQL bruta
      const result = await db.insert(npcs).values(data).returning();
      
      if (!result || result.length === 0) {
        throw new Error("Falha ao inserir NPC");
      }
      
      const npcResult = result[0];
      
      // Converter snake_case para camelCase e registrar para depuração
      console.log("NPC retornado do banco:", JSON.stringify(npcResult, null, 2));
      console.log("Campo entity_type no resultado:", npcResult.entity_type);
      
      const npc: Npc = {
        id: npcResult.id,
        campaignId: npcResult.campaignId,
        name: npcResult.name,
        race: npcResult.race,
        imageUrl: npcResult.image_url, // Mapeamento explícito de snake_case para camelCase
        memorableTrait: npcResult.memorable_trait,
        entityType: npcResult.entity_type === 'creature' ? 'creature' : 'npc', // Garantir o valor correto
        role: npcResult.role || null,
        motivation: npcResult.motivation || null,
        occupation: npcResult.occupation || null,
        location: npcResult.location || null,
        appearance: npcResult.appearance || null,
        personality: npcResult.personality || null,
        abilities: npcResult.abilities || null,
        notes: npcResult.notes || null,
        strength: npcResult.strength || null,
        dexterity: npcResult.dexterity || null, 
        constitution: npcResult.constitution || null,
        intelligence: npcResult.intelligence || null,
        wisdom: npcResult.wisdom || null,
        charisma: npcResult.charisma || null,
        healthPoints: npcResult.health_points || null,
        threatLevel: npcResult.threat_level || null,
        specialAbilities: npcResult.special_abilities || null,
        created: npcResult.created,
        updated: npcResult.updated
      };
      
      // Verificando o objeto convertido
      console.log("Campo imageUrl após conversão:", npc.imageUrl);
      console.log("Campo entityType após conversão:", npc.entityType);
      
      // Verificando o objeto completo convertido
      console.log("NPC convertido:", JSON.stringify({
        id: npc.id,
        name: npc.name,
        entityType: npc.entityType
      }, null, 2));
      
      return npc;
    } catch (error) {
      console.error("Erro ao criar NPC:", error);
      throw error;
    }
  }

  async updateNpc(id: number, npcData: Partial<Npc>): Promise<Npc | undefined> {
    try {
      // Usando Drizzle ORM para verificar se o NPC existe
      const existingNpc = await db.select().from(npcs).where(eq(npcs.id, id)).limit(1);
      
      if (!existingNpc || existingNpc.length === 0) {
        return undefined;
      }
      
      // Filtrando apenas campos válidos que existem na tabela
      const updateData: any = {};
      
      if (npcData.name !== undefined) updateData.name = npcData.name;
      if (npcData.race !== undefined) updateData.race = npcData.race;
      if (npcData.occupation !== undefined) updateData.occupation = npcData.occupation;
      if (npcData.location !== undefined) updateData.location = npcData.location;
      if (npcData.appearance !== undefined) updateData.appearance = npcData.appearance;
      if (npcData.personality !== undefined) updateData.personality = npcData.personality;
      if (npcData.abilities !== undefined) updateData.abilities = npcData.abilities;
      if (npcData.notes !== undefined) updateData.notes = npcData.notes;
      if (npcData.updated !== undefined) updateData.updated = npcData.updated;
      
      // Novos campos adicionados ao schema
      if (npcData.imageUrl !== undefined) updateData.image_url = npcData.imageUrl;
      if (npcData.memorableTrait !== undefined) updateData.memorable_trait = npcData.memorableTrait;
      if (npcData.entityType !== undefined) updateData.entity_type = npcData.entityType;
      if (npcData.role !== undefined) updateData.role = npcData.role;
      if (npcData.motivation !== undefined) updateData.motivation = npcData.motivation;
      
      // Novos campos para atributos de criatura
      if (npcData.strength !== undefined) updateData.strength = npcData.strength;
      if (npcData.dexterity !== undefined) updateData.dexterity = npcData.dexterity;
      if (npcData.constitution !== undefined) updateData.constitution = npcData.constitution;
      if (npcData.intelligence !== undefined) updateData.intelligence = npcData.intelligence;
      if (npcData.wisdom !== undefined) updateData.wisdom = npcData.wisdom;
      if (npcData.charisma !== undefined) updateData.charisma = npcData.charisma;
      if (npcData.healthPoints !== undefined) updateData.health_points = npcData.healthPoints;
      if (npcData.threatLevel !== undefined) updateData.threat_level = npcData.threatLevel;
      if (npcData.specialAbilities !== undefined) updateData.special_abilities = npcData.specialAbilities;
      
      // Se não há campos para atualizar, retornar o NPC existente
      if (Object.keys(updateData).length === 0) {
        return existingNpc[0];
      }
      
      // Usar Drizzle ORM para atualizar
      const result = await db.update(npcs)
        .set(updateData)
        .where(eq(npcs.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        throw new Error("Falha ao atualizar NPC");
      }
      
      const npcResult = result[0];
      
      // Converter snake_case para camelCase
      const npc: Npc = {
        id: npcResult.id,
        campaignId: npcResult.campaignId,
        name: npcResult.name,
        race: npcResult.race,
        imageUrl: npcResult.image_url, // Mapeamento explícito de snake_case para camelCase
        memorableTrait: npcResult.memorable_trait,
        entityType: npcResult.entity_type === 'creature' ? 'creature' : 'npc',
        role: npcResult.role || null,
        motivation: npcResult.motivation || null,
        occupation: npcResult.occupation || null,
        location: npcResult.location || null,
        appearance: npcResult.appearance || null,
        personality: npcResult.personality || null,
        abilities: npcResult.abilities || null,
        notes: npcResult.notes || null,
        strength: npcResult.strength || null,
        dexterity: npcResult.dexterity || null, 
        constitution: npcResult.constitution || null,
        intelligence: npcResult.intelligence || null,
        wisdom: npcResult.wisdom || null,
        charisma: npcResult.charisma || null,
        healthPoints: npcResult.health_points || null,
        threatLevel: npcResult.threat_level || null,
        specialAbilities: npcResult.special_abilities || null,
        created: npcResult.created,
        updated: npcResult.updated
      };
      
      console.log("Campo imageUrl no updateNpc:", npc.imageUrl);
      return npc;
    } catch (error) {
      console.error("Erro ao atualizar NPC:", error);
      return undefined;
    }
  }

  async deleteNpc(id: number): Promise<boolean> {
    const result = await db.delete(npcs).where(eq(npcs.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Encounter methods
  async getEncounter(id: number): Promise<Encounter | undefined> {
    const [encounter] = await db.select().from(encounters).where(eq(encounters.id, id));
    return encounter;
  }

  async getEncountersByCampaignId(campaignId: number): Promise<Encounter[]> {
    return await db.select().from(encounters).where(eq(encounters.campaignId, campaignId));
  }

  async createEncounter(insertEncounter: InsertEncounter): Promise<Encounter> {
    const [encounter] = await db.insert(encounters).values(insertEncounter).returning();
    return encounter;
  }

  async updateEncounter(id: number, encounterData: Partial<Encounter>): Promise<Encounter | undefined> {
    const [encounter] = await db.update(encounters).set(encounterData).where(eq(encounters.id, id)).returning();
    return encounter;
  }

  async deleteEncounter(id: number): Promise<boolean> {
    const result = await db.delete(encounters).where(eq(encounters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Location methods
  async getLocation(id: number): Promise<CampaignLocation | undefined> {
    const [location] = await db.select().from(campaignLocations).where(eq(campaignLocations.id, id));
    return location;
  }

  async getLocationsByCampaignId(campaignId: number): Promise<CampaignLocation[]> {
    return await db.select().from(campaignLocations).where(eq(campaignLocations.campaignId, campaignId));
  }

  async createLocation(insertLocation: InsertCampaignLocation): Promise<CampaignLocation> {
    const [location] = await db.insert(campaignLocations).values(insertLocation).returning();
    return location;
  }

  async updateLocation(id: number, locationData: Partial<CampaignLocation>): Promise<CampaignLocation | undefined> {
    const [location] = await db.update(campaignLocations).set(locationData).where(eq(campaignLocations.id, id)).returning();
    return location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(campaignLocations).where(eq(campaignLocations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Session notes methods
  async getSessionNote(id: number): Promise<SessionNote | undefined> {
    const [note] = await db.select().from(sessionNotes).where(eq(sessionNotes.id, id));
    return note;
  }

  async getSessionNotesByCampaignId(campaignId: number): Promise<SessionNote[]> {
    return await db.select().from(sessionNotes).where(eq(sessionNotes.campaignId, campaignId));
  }

  async createSessionNote(insertNote: InsertSessionNote): Promise<SessionNote> {
    const [note] = await db.insert(sessionNotes).values(insertNote).returning();
    return note;
  }

  async updateSessionNote(id: number, noteData: Partial<SessionNote>): Promise<SessionNote | undefined> {
    const [note] = await db.update(sessionNotes).set(noteData).where(eq(sessionNotes.id, id)).returning();
    return note;
  }

  async deleteSessionNote(id: number): Promise<boolean> {
    const result = await db.delete(sessionNotes).where(eq(sessionNotes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
