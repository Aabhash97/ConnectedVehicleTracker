import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initializeMockData } from "./mock-data";
import { z } from "zod";

// Initialize mock data on first load
let dataInitialized = false;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize mock data if not already done
  if (!dataInitialized) {
    await initializeMockData();
    dataInitialized = true;
  }

  // API routes prefix
  const apiRouter = "/api";
  
  // Get all vehicles
  app.get(`${apiRouter}/vehicles`, async (_req: Request, res: Response) => {
    const vehicles = await storage.getAllVehicles();
    res.json({ vehicles });
  });
  
  // Get vehicle by ID
  app.get(`${apiRouter}/vehicles/:vehicleId`, async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const vehicle = await storage.getVehicleById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    res.json({ vehicle });
  });
  
  // Get all vehicle events
  app.get(`${apiRouter}/events`, async (_req: Request, res: Response) => {
    const events = await storage.getAllVehicleEvents();
    res.json({ events });
  });
  
  // Get events by vehicle ID
  app.get(`${apiRouter}/events/vehicle/:vehicleId`, async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const events = await storage.getVehicleEventsByVehicleId(vehicleId);
    res.json({ events });
  });
  
  // Get events by event type
  app.get(`${apiRouter}/events/type/:eventType`, async (req: Request, res: Response) => {
    const { eventType } = req.params;
    const events = await storage.getVehicleEventsByType(eventType);
    res.json({ events });
  });
  
  // Get events by timeframe
  app.get(`${apiRouter}/events/timeframe`, async (req: Request, res: Response) => {
    const querySchema = z.object({
      startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "startTime must be a valid date string"
      }),
      endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "endTime must be a valid date string"
      })
    });
    
    try {
      const { startTime, endTime } = querySchema.parse(req.query);
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      const events = await storage.getVehicleEventsByTimeframe(startDate, endDate);
      res.json({ events });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid query parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get filtered events (combine vehicle ID and timeframe)
  app.get(`${apiRouter}/events/filter`, async (req: Request, res: Response) => {
    const querySchema = z.object({
      vehicleId: z.string().optional(),
      eventType: z.string().optional(),
      startTime: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
        message: "startTime must be a valid date string"
      }),
      endTime: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
        message: "endTime must be a valid date string"
      })
    });
    
    try {
      const query = querySchema.parse(req.query);
      let events = await storage.getAllVehicleEvents();
      
      // Apply filters if provided
      if (query.vehicleId) {
        events = events.filter(event => event.vehicleId === query.vehicleId);
      }
      
      if (query.eventType) {
        events = events.filter(event => event.eventType === query.eventType);
      }
      
      if (query.startTime && query.endTime) {
        const startDate = new Date(query.startTime);
        const endDate = new Date(query.endTime);
        
        events = events.filter(event => {
          const eventTime = new Date(event.timestamp);
          return eventTime >= startDate && eventTime <= endDate;
        });
      }
      
      res.json({ events });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid query parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get vehicle stats for dashboard
  app.get(`${apiRouter}/stats/:vehicleId`, async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const stats = await storage.getVehicleStatsByVehicleId(vehicleId);
    res.json({ stats });
  });
  
  // Get recent trips for a vehicle
  app.get(`${apiRouter}/trips/:vehicleId`, async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const trips = await storage.getRecentTripsByVehicleId(vehicleId, limit);
    res.json({ trips });
  });
  
  // Get current vehicle status (latest event data)
  app.get(`${apiRouter}/status/:vehicleId`, async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const events = await storage.getVehicleEventsByVehicleId(vehicleId);
    
    if (!events || events.length === 0) {
      return res.status(404).json({ message: "No events found for this vehicle" });
    }
    
    // Sort events by timestamp (descending) and take the latest one
    const latestEvent = events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    // Get vehicle info
    const vehicle = await storage.getVehicleById(vehicleId);
    
    // Get latest trip
    const trips = await storage.getRecentTripsByVehicleId(vehicleId, 1);
    const latestTrip = trips.length > 0 ? trips[0] : null;
    
    res.json({
      status: {
        vehicle,
        latestEvent,
        latestTrip,
        ignitionStatus: latestEvent.eventType === 'IGNITION_ON' ? 'ON' : 'OFF',
        timestamp: latestEvent.timestamp,
      }
    });
  });
  
  // Get dashboard data for a vehicle
  app.get(`${apiRouter}/dashboard/:vehicleId`, async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    
    // Get vehicle info
    const vehicle = await storage.getVehicleById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    // Get latest vehicle status
    const events = await storage.getVehicleEventsByVehicleId(vehicleId);
    if (!events || events.length === 0) {
      return res.status(404).json({ message: "No events found for this vehicle" });
    }
    
    // Sort events by timestamp (descending) and take the latest one
    const latestEvent = events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    // Get most recent trip data
    const trips = await storage.getRecentTripsByVehicleId(vehicleId, 5);
    
    // Get last 7 days of vehicle stats
    const stats = await storage.getVehicleStatsByVehicleId(vehicleId);
    const sortedStats = stats.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 7);
    
    // Get current ignition status based on last event
    const ignitionStatus = latestEvent.eventType === 'IGNITION_ON' ? 'ON' : 'OFF';
    
    // Get events for timeline (last 10 events)
    const recentEvents = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    res.json({
      vehicle,
      currentStatus: {
        batteryLevel: latestEvent.batteryLevel,
        speed: latestEvent.speed,
        odometer: latestEvent.odometer,
        location: latestEvent.location,
        ignitionStatus,
        timestamp: latestEvent.timestamp,
        temperature: latestEvent.temperature,
        efficiency: latestEvent.efficiency,
        data: latestEvent.data
      },
      recentTrips: trips,
      weeklyStats: sortedStats,
      recentEvents
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
