import { useQuery } from "@tanstack/react-query";
import { Vehicle, DashboardData } from "@/types";

/**
 * Hook to fetch all vehicles
 */
export function useVehicles() {
  return useQuery({
    queryKey: ['/api/vehicles'],
    select: (data) => data.vehicles as Vehicle[],
  });
}

/**
 * Hook to fetch a specific vehicle by ID
 */
export function useVehicle(vehicleId: string) {
  return useQuery({
    queryKey: [`/api/vehicles/${vehicleId}`],
    select: (data) => data.vehicle as Vehicle,
    enabled: !!vehicleId,
  });
}

/**
 * Hook to fetch dashboard data for a specific vehicle
 */
export function useDashboardData(vehicleId: string) {
  return useQuery({
    queryKey: [`/api/dashboard/${vehicleId}`],
    select: (data) => data as DashboardData,
    enabled: !!vehicleId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch trips for a specific vehicle
 */
export function useVehicleTrips(vehicleId: string, limit: number = 10) {
  return useQuery({
    queryKey: [`/api/trips/${vehicleId}`, { limit }],
    select: (data) => data.trips,
    enabled: !!vehicleId,
  });
}

/**
 * Hook to fetch current status for a specific vehicle
 */
export function useVehicleStatus(vehicleId: string) {
  return useQuery({
    queryKey: [`/api/status/${vehicleId}`],
    select: (data) => data.status,
    enabled: !!vehicleId,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

/**
 * Hook to fetch vehicle stats for a specific vehicle
 */
export function useVehicleStats(vehicleId: string) {
  return useQuery({
    queryKey: [`/api/stats/${vehicleId}`],
    select: (data) => data.stats,
    enabled: !!vehicleId,
  });
}
