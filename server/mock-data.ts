import { 
  InsertVehicle, 
  InsertVehicleEvent, 
  InsertTrip, 
  InsertVehicleStats 
} from "ConnectedVehicleTracker/shared/schema";
import { storage } from "./storage";

// Helper function to generate random number between min and max (inclusive)
const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Helper function to generate random decimal between min and max with precision
const randomDecimal = (min: number, max: number, precision: number = 1) => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(precision));
};

// Helper to get a random item from an array
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a random date within the last 30 days
const randomDate = (daysAgo: number = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date;
};

// Locations for random selection
const locations = [
  'San Francisco, CA',
  'Oakland, CA',
  'Berkeley, CA',
  'Palo Alto, CA',
  'San Jose, CA',
  'Mountain View, CA',
  'Sunnyvale, CA',
  'Redwood City, CA',
  'Santa Clara, CA',
  'Fremont, CA',
];

// Vehicle models for random selection
const vehicleModels = [
  { name: 'TATA', model: 'Nexon', year: 2022 },
  { name: 'BMW', model: 'i4', year: 2023 },
  { name: 'Audi', model: 'Q1', year: 2022 },
  { name: 'Ford', model: 'Mustang', year: 2022 },
  { name: 'Chevrolet', model: 'Bolt', year: 2023 },
  { name: 'Nissan', model: 'Leaf', year: 2023 },
  { name: 'Hyundai', model: 'Ioniq 5', year: 2022 },
  { name: 'Kia', model: 'EV6', year: 2023 },
  { name: 'Volkswagen', model: 'ID.4', year: 2022 },
];

// Initialize mock data
export async function initializeMockData() {
  console.log('Initializing mock data...');
  
  // Create vehicles
  const vehicles: InsertVehicle[] = [
    {
      vehicleId: 'V001',
      name: 'TATA Nexon',
      model: 'Nexon',
      year: 2022,
      status: 'ONLINE'
    },
    {
      vehicleId: 'V002',
      name: 'BMW i4',
      model: 'i4',
      year: 2023,
      status: 'OFFLINE'
    },
    {
      vehicleId: 'V003',
      name: 'Audi Q1',
      model: 'Q1',
      year: 2022,
      status: 'ONLINE'
    },
    {
      vehicleId: 'V004',
      name: 'Ford Mustang',
      model: 'Mustang',
      year: 2023,
      status: 'OFFLINE'
    },
    {
      vehicleId: 'V005',
      name: 'Chevrolet Bolt',
      model: 'Bolt',
      year: 2022,
      status: 'ONLINE'
    }
  ];

  for (const vehicle of vehicles) {
    await storage.createVehicle(vehicle);
  }

  // Generate events for each vehicle
  for (const vehicle of vehicles) {
    const vehicleId = vehicle.vehicleId;
    const totalEvents = randomInt(30, 50); // Generate 30-50 events per vehicle
    let batteryLevel = randomInt(60, 95);
    let odometer = randomInt(10000, 50000);
    let isIgnitionOn = false;
    let currentLocation = randomItem(locations);
    let tripStartTime: Date | null = null;
    let tripStartLocation: string | null = null;
    let tripStartOdometer: number | null = null;

    // Generate events in chronological order
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14); // Start 14 days ago
    
    for (let i = 0; i < totalEvents; i++) {
      // Advance time by 1-4 hours
      const eventDate = new Date(startDate);
      eventDate.setHours(startDate.getHours() + randomInt(1, 4));
      startDate.setTime(eventDate.getTime());
      
      // Determine event type based on current state
      let eventType: string;
      
      if (!isIgnitionOn && Math.random() > 0.3) {
        // Generate ignition on event
        eventType = 'IGNITION_ON';
        isIgnitionOn = true;
        tripStartTime = new Date(eventDate);
        tripStartLocation = currentLocation;
        tripStartOdometer = odometer;
      } else if (isIgnitionOn && Math.random() > 0.6) {
        // Generate ignition off event
        eventType = 'IGNITION_OFF';
        isIgnitionOn = false;
        
        // Create a trip record
        if (tripStartTime && tripStartLocation && tripStartOdometer !== null) {
          const distance = randomInt(5, 30);
          odometer += distance;
          const duration = randomInt(10, 60);
          const energyUsed = randomInt(5, 15);
          batteryLevel = Math.max(30, batteryLevel - randomInt(1, 10));
          
          const tripData: InsertTrip = {
            vehicleId,
            startTime: tripStartTime,
            endTime: eventDate,
            startLocation: tripStartLocation,
            endLocation: currentLocation,
            distance,
            duration,
            avgSpeed: Math.round(distance / (duration / 60)),
            energyUsed
          };
          
          await storage.createTrip(tripData);
          
          // Update current location for next events
          currentLocation = randomItem(locations);
        }
      } else {
        // Generate time interval event
        eventType = 'TIME_INTERVAL';
        
        // If ignition is on, update odometer and reduce battery
        if (isIgnitionOn) {
          odometer += randomInt(1, 5);
          batteryLevel = Math.max(30, batteryLevel - randomInt(0, 2));
        } else if (Math.random() > 0.7) {
          // Sometimes increase battery when parked (charging)
          batteryLevel = Math.min(100, batteryLevel + randomInt(1, 5));
        }
      }
      
      // Create event data
      const speed = isIgnitionOn ? randomInt(0, 120) : 0;
      const temperature = randomInt(18, 28);
      const efficiency = randomInt(75, 95);
      
      const eventData: InsertVehicleEvent = {
        vehicleId,
        timestamp: eventDate,
        eventType,
        location: currentLocation,
        speed,
        batteryLevel,
        odometer,
        efficiency,
        temperature,
        data: {
          motorHealth: randomItem(['Excellent', 'Good', 'Normal']),
          brakeHealth: randomItem(['Excellent', 'Good', 'Normal']),
          tiresPressure: randomItem(['Optimal', 'Normal', 'Low']),
          estimatedRange: Math.round(batteryLevel * 3.8),
          alerts: []
        }
      };
      
      await storage.createVehicleEvent(eventData);
    }
    
    // Create vehicle stats for dashboard
    for (let day = 0; day < 7; day++) {
      const statsDate = new Date();
      statsDate.setDate(statsDate.getDate() - day);
      
      const statsData: InsertVehicleStats = {
        vehicleId,
        date: statsDate,
        totalDistance: randomInt(20, 150),
        avgSpeed: randomInt(30, 70),
        avgEfficiency: randomInt(75, 95),
        tripCount: randomInt(1, 6)
      };
      
      await storage.createVehicleStats(statsData);
    }
  }
  
  console.log('Mock data initialized successfully');
}
