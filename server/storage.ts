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
  private encounters: Map<number, Encounter>;
  private locations: Map<number, CampaignLocation>;
  private sessionNotes: Map<number, SessionNote>;
  sessionStore: any;
  
  private userIdCounter: number;
  private characterIdCounter: number;
  private campaignIdCounter: number;
  private npcIdCounter: number;
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
    // Adicionar imageUrl com um valor nulo temporário
    const [character] = await db.select({
      id: characters.id,
      userId: characters.userId,
      name: characters.name,
      race: characters.race,
      class: characters.class,
      level: characters.level,
      background: characters.background,
      alignment: characters.alignment,
      experience: characters.experience,
      imageUrl: sql`null::text`, // Valor nulo para a coluna imageUrl até a migração
      strength: characters.strength,
      dexterity: characters.dexterity,
      constitution: characters.constitution,
      intelligence: characters.intelligence,
      wisdom: characters.wisdom,
      charisma: characters.charisma,
      maxHitPoints: characters.maxHitPoints,
      currentHitPoints: characters.currentHitPoints,
      armorClass: characters.armorClass,
      speed: characters.speed,
      proficiencyBonus: characters.proficiencyBonus,
      savingThrows: characters.savingThrows,
      skills: characters.skills,
      equipment: characters.equipment,
      spells: characters.spells,
      features: characters.features,
      traits: characters.traits,
      ideals: characters.ideals,
      bonds: characters.bonds,
      flaws: characters.flaws,
      notes: characters.notes,
      created: characters.created,
      updated: characters.updated
    }).from(characters).where(eq(characters.id, id));
    return character;
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    // Adicionar imageUrl com um valor nulo temporário
    return await db.select({
      id: characters.id,
      userId: characters.userId,
      name: characters.name,
      race: characters.race,
      class: characters.class,
      level: characters.level,
      background: characters.background,
      alignment: characters.alignment,
      experience: characters.experience,
      imageUrl: sql`null::text`, // Valor nulo para a coluna imageUrl até a migração
      strength: characters.strength,
      dexterity: characters.dexterity,
      constitution: characters.constitution,
      intelligence: characters.intelligence,
      wisdom: characters.wisdom,
      charisma: characters.charisma,
      maxHitPoints: characters.maxHitPoints,
      currentHitPoints: characters.currentHitPoints,
      armorClass: characters.armorClass,
      speed: characters.speed,
      proficiencyBonus: characters.proficiencyBonus,
      savingThrows: characters.savingThrows,
      skills: characters.skills,
      equipment: characters.equipment,
      spells: characters.spells,
      features: characters.features,
      traits: characters.traits,
      ideals: characters.ideals,
      bonds: characters.bonds,
      flaws: characters.flaws,
      notes: characters.notes,
      created: characters.created,
      updated: characters.updated
    }).from(characters).where(eq(characters.userId, userId));
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
    const [npc] = await db.select().from(npcs).where(eq(npcs.id, id));
    return npc;
  }

  async getNpcsByCampaignId(campaignId: number): Promise<Npc[]> {
    return await db.select().from(npcs).where(eq(npcs.campaignId, campaignId));
  }

  async createNpc(insertNpc: InsertNpc): Promise<Npc> {
    const [npc] = await db.insert(npcs).values(insertNpc).returning();
    return npc;
  }

  async updateNpc(id: number, npcData: Partial<Npc>): Promise<Npc | undefined> {
    const [npc] = await db.update(npcs).set(npcData).where(eq(npcs.id, id)).returning();
    return npc;
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
