import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  race: text("race").notNull(),
  class: text("class").notNull(),
  level: integer("level").notNull().default(1),
  background: text("background"),
  alignment: text("alignment"),
  experience: integer("experience").notNull().default(0),
  imageUrl: text("image_url"),
  strength: integer("strength").notNull(),
  dexterity: integer("dexterity").notNull(),
  constitution: integer("constitution").notNull(),
  intelligence: integer("intelligence").notNull(),
  wisdom: integer("wisdom").notNull(),
  charisma: integer("charisma").notNull(),
  maxHitPoints: integer("max_hit_points").notNull(),
  currentHitPoints: integer("current_hit_points").notNull(),
  armorClass: integer("armor_class").notNull(),
  speed: integer("speed").notNull(),
  proficiencyBonus: integer("proficiency_bonus").notNull(),
  savingThrows: text("saving_throws").array(),
  skills: text("skills").array(),
  equipment: text("equipment").array(),
  spells: text("spells").array(),
  features: text("features").array(),
  traits: text("traits"),
  ideals: text("ideals"),
  bonds: text("bonds"),
  flaws: text("flaws"),
  notes: text("notes"),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  // World building fields
  centralConcept: text("central_concept"),
  geography: text("geography"),
  mapImageUrl: text("map_image_url"),
  factions: text("factions"),
  history: text("history"),
  magicTech: text("magic_tech"),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

export const npcs = pgTable("npcs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  entityType: text("entity_type").default('npc'), // 'npc' ou 'creature'
  name: text("name").notNull(),
  role: text("role"), // Aliado, Vilão, Obstáculo, Curiosidade
  motivation: text("motivation"), // Motivação ou objetivo principal
  memorableTrait: text("memorable_trait"), // Traço memorável
  relationships: text("relationships"), // Relacionamentos e contexto
  abilities: text("abilities"), // Habilidades únicas
  threatOrUtility: text("threat_or_utility"), // Ameaça ou utilidade (pode ser inimigo, pode ser aliado, etc.)
  plotHooks: text("plot_hooks"), // Ganchos de história
  
  // Campos originais mantidos para compatibilidade
  race: text("race"),
  occupation: text("occupation"),
  location: text("location"),
  appearance: text("appearance"),
  personality: text("personality"),
  notes: text("notes"),
  
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

export const encounters = pgTable("encounters", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  name: text("name").notNull(),
  location: text("location"),
  difficulty: text("difficulty"),
  description: text("description"),
  creatures: jsonb("creatures").notNull(),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

export const campaignLocations = pgTable("campaign_locations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  notes: text("notes"),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

export const sessionNotes = pgTable("session_notes", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: text("date").notNull(),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatarUrl: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
});

export const insertNpcSchema = createInsertSchema(npcs).omit({
  id: true,
});

export const insertEncounterSchema = createInsertSchema(encounters).omit({
  id: true,
});

export const insertCampaignLocationSchema = createInsertSchema(campaignLocations).omit({
  id: true,
});

export const insertSessionNoteSchema = createInsertSchema(sessionNotes).omit({
  id: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertNpc = z.infer<typeof insertNpcSchema>;
export type Npc = typeof npcs.$inferSelect;

export type InsertEncounter = z.infer<typeof insertEncounterSchema>;
export type Encounter = typeof encounters.$inferSelect;

export type InsertCampaignLocation = z.infer<typeof insertCampaignLocationSchema>;
export type CampaignLocation = typeof campaignLocations.$inferSelect;

export type InsertSessionNote = z.infer<typeof insertSessionNoteSchema>;
export type SessionNote = typeof sessionNotes.$inferSelect;
