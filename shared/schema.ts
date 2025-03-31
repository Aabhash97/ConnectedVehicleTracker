import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table (kept for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vehicle Events Schema
export const vehicleEvents = pgTable("vehicle_events", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  eventType: text("event_type").notNull(), // 'IGNITION_ON', 'IGNITION_OFF', 'TIME_INTERVAL'
  location: text("location"),
  speed: integer("speed"),
  batteryLevel: integer("battery_level"),
  odometer: integer("odometer"),
  efficiency: integer("efficiency"),
  temperature: integer("temperature"),
  data: json("data"), // Additional data in JSON format
});

export const insertVehicleEventSchema = createInsertSchema(vehicleEvents).omit({
  id: true,
});

export type InsertVehicleEvent = z.infer<typeof insertVehicleEventSchema>;
export type VehicleEvent = typeof vehicleEvents.$inferSelect;

// Vehicle Schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull().unique(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  status: text("status").notNull(), // 'ONLINE', 'OFFLINE'
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Vehicle Stats Schema (for dashboard data aggregation)
export const vehicleStats = pgTable("vehicle_stats", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull(),
  date: timestamp("date").notNull(),
  totalDistance: integer("total_distance"),
  avgSpeed: integer("avg_speed"),
  avgEfficiency: integer("avg_efficiency"),
  tripCount: integer("trip_count"),
});

export const insertVehicleStatsSchema = createInsertSchema(vehicleStats).omit({
  id: true,
});

export type InsertVehicleStats = z.infer<typeof insertVehicleStatsSchema>;
export type VehicleStats = typeof vehicleStats.$inferSelect;

// Trip Schema
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  startLocation: text("start_location"),
  endLocation: text("end_location"),
  distance: integer("distance"),
  duration: integer("duration"),
  avgSpeed: integer("avg_speed"),
  energyUsed: integer("energy_used"),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
