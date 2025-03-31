// Vehicle Types
export interface Vehicle {
  id: number;
  vehicleId: string;
  name: string;
  model: string;
  year: number;
  status: 'ONLINE' | 'OFFLINE';
}

// Vehicle Event Types
export type EventType = 'IGNITION_ON' | 'IGNITION_OFF' | 'TIME_INTERVAL';

export interface VehicleEvent {
  id: number;
  vehicleId: string;
  timestamp: string;
  eventType: EventType;
  location: string;
  speed: number;
  batteryLevel: number;
  odometer: number;
  efficiency: number;
  temperature: number;
  data: {
    motorHealth: string;
    brakeHealth: string;
    tiresPressure: string;
    estimatedRange: number;
    alerts: string[];
  };
}

// Trip Types
export interface Trip {
  id: number;
  vehicleId: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  avgSpeed: number;
  energyUsed: number;
}

// Vehicle Stats Types
export interface VehicleStats {
  id: number;
  vehicleId: string;
  date: string;
  totalDistance: number;
  avgSpeed: number;
  avgEfficiency: number;
  tripCount: number;
}

// Dashboard Data Type
export interface DashboardData {
  vehicle: Vehicle;
  currentStatus: {
    batteryLevel: number;
    speed: number;
    odometer: number;
    location: string;
    ignitionStatus: string;
    timestamp: string;
    temperature: number;
    efficiency: number;
    data: {
      motorHealth: string;
      brakeHealth: string;
      tiresPressure: string;
      estimatedRange: number;
      alerts: string[];
    };
  };
  recentTrips: Trip[];
  weeklyStats: VehicleStats[];
  recentEvents: VehicleEvent[];
}

// Time Period Options for filtering
export type TimePeriod = '24h' | '7d' | '30d' | 'custom';

// Filter Options for events
export interface EventFilterOptions {
  vehicleId?: string;
  eventType?: EventType | 'ALL';
  startTime?: string;
  endTime?: string;
  searchQuery?: string;
}
