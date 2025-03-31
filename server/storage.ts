import { 
  users, type User, type InsertUser,
  vehicleEvents, type VehicleEvent, type InsertVehicleEvent,
  vehicles, type Vehicle, type InsertVehicle,
  vehicleStats, type VehicleStats, type InsertVehicleStats,
  trips, type Trip, type InsertTrip 
} from "ConnectedVehicleTracker/shared/schema";

export interface IStorage {
  // User operations (kept for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle operations
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicleById(vehicleId: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicleStatus(vehicleId: string, status: string): Promise<Vehicle | undefined>;
  
  // Vehicle events operations
  getAllVehicleEvents(): Promise<VehicleEvent[]>;
  getVehicleEventsByVehicleId(vehicleId: string): Promise<VehicleEvent[]>;
  getVehicleEventsByType(eventType: string): Promise<VehicleEvent[]>;
  getVehicleEventsByTimeframe(startTime: Date, endTime: Date): Promise<VehicleEvent[]>;
  getVehicleEventsByVehicleAndTimeframe(vehicleId: string, startTime: Date, endTime: Date): Promise<VehicleEvent[]>;
  createVehicleEvent(event: InsertVehicleEvent): Promise<VehicleEvent>;
  
  // Vehicle stats operations
  getVehicleStatsByVehicleId(vehicleId: string): Promise<VehicleStats[]>;
  createVehicleStats(stats: InsertVehicleStats): Promise<VehicleStats>;
  
  // Trip operations
  getTripsByVehicleId(vehicleId: string): Promise<Trip[]>;
  getRecentTripsByVehicleId(vehicleId: string, limit: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<string, Vehicle>;
  private vehicleEvents: VehicleEvent[];
  private vehicleStats: VehicleStats[];
  private trips: Trip[];
  
  private currentUserId: number;
  private currentVehicleEventId: number;
  private currentVehicleStatsId: number;
  private currentTripId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.vehicleEvents = [];
    this.vehicleStats = [];
    this.trips = [];
    
    this.currentUserId = 1;
    this.currentVehicleEventId = 1;
    this.currentVehicleStatsId = 1;
    this.currentTripId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vehicle operations
  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicleById(vehicleId: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(vehicleId);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicles.size + 1;
    const newVehicle: Vehicle = { ...vehicle, id };
    this.vehicles.set(vehicle.vehicleId, newVehicle);
    return newVehicle;
  }

  async updateVehicleStatus(vehicleId: string, status: string): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, status };
    this.vehicles.set(vehicleId, updatedVehicle);
    return updatedVehicle;
  }

  // Vehicle events operations
  async getAllVehicleEvents(): Promise<VehicleEvent[]> {
    return this.vehicleEvents;
  }

  async getVehicleEventsByVehicleId(vehicleId: string): Promise<VehicleEvent[]> {
    return this.vehicleEvents.filter(event => event.vehicleId === vehicleId);
  }

  async getVehicleEventsByType(eventType: string): Promise<VehicleEvent[]> {
    return this.vehicleEvents.filter(event => event.eventType === eventType);
  }

  async getVehicleEventsByTimeframe(startTime: Date, endTime: Date): Promise<VehicleEvent[]> {
    return this.vehicleEvents.filter(event => {
      const eventTime = new Date(event.timestamp);
      return eventTime >= startTime && eventTime <= endTime;
    });
  }

  async getVehicleEventsByVehicleAndTimeframe(
    vehicleId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<VehicleEvent[]> {
    return this.vehicleEvents.filter(event => {
      const eventTime = new Date(event.timestamp);
      return event.vehicleId === vehicleId && eventTime >= startTime && eventTime <= endTime;
    });
  }

  async createVehicleEvent(event: InsertVehicleEvent): Promise<VehicleEvent> {
    const id = this.currentVehicleEventId++;
    const newEvent = { ...event, id };
    this.vehicleEvents.push(newEvent);
    return newEvent;
  }

  // Vehicle stats operations
  async getVehicleStatsByVehicleId(vehicleId: string): Promise<VehicleStats[]> {
    return this.vehicleStats.filter(stats => stats.vehicleId === vehicleId);
  }

  async createVehicleStats(stats: InsertVehicleStats): Promise<VehicleStats> {
    const id = this.currentVehicleStatsId++;
    const newStats = { ...stats, id };
    this.vehicleStats.push(newStats);
    return newStats;
  }

  // Trip operations
  async getTripsByVehicleId(vehicleId: string): Promise<Trip[]> {
    return this.trips.filter(trip => trip.vehicleId === vehicleId);
  }

  async getRecentTripsByVehicleId(vehicleId: string, limit: number): Promise<Trip[]> {
    return this.trips
      .filter(trip => trip.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const id = this.currentTripId++;
    const newTrip = { ...trip, id };
    this.trips.push(newTrip);
    return newTrip;
  }

  async updateTrip(id: number, tripUpdate: Partial<InsertTrip>): Promise<Trip | undefined> {
    const index = this.trips.findIndex(trip => trip.id === id);
    if (index === -1) return undefined;
    
    const updatedTrip = { ...this.trips[index], ...tripUpdate };
    this.trips[index] = updatedTrip;
    return updatedTrip;
  }
}

export const storage = new MemStorage();
