import { useQuery } from "@tanstack/react-query";
import { EventFilterOptions, VehicleEvent } from "@/types";
import { useMemo } from "react";

/**
 * Hook to fetch all vehicle events
 */
export function useAllVehicleEvents() {
  return useQuery({
    queryKey: ['/api/events'],
    select: (data) => data.events as VehicleEvent[],
  });
}

/**
 * Hook to fetch vehicle events by vehicle ID
 */
export function useVehicleEventsByVehicleId(vehicleId: string) {
  return useQuery({
    queryKey: [`/api/events/vehicle/${vehicleId}`],
    select: (data) => data.events as VehicleEvent[],
    enabled: !!vehicleId,
  });
}

/**
 * Hook to fetch vehicle events by event type
 */
export function useVehicleEventsByType(eventType: string) {
  return useQuery({
    queryKey: [`/api/events/type/${eventType}`],
    select: (data) => data.events as VehicleEvent[],
    enabled: !!eventType && eventType !== 'ALL',
  });
}

/**
 * Hook to fetch filtered vehicle events
 */
export function useFilteredVehicleEvents(filterOptions: EventFilterOptions) {
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (filterOptions.vehicleId) {
      params.append('vehicleId', filterOptions.vehicleId);
    }
    
    if (filterOptions.eventType && filterOptions.eventType !== 'ALL') {
      params.append('eventType', filterOptions.eventType);
    }
    
    if (filterOptions.startTime) {
      params.append('startTime', filterOptions.startTime);
    }
    
    if (filterOptions.endTime) {
      params.append('endTime', filterOptions.endTime);
    }
    
    return params.toString();
  }, [filterOptions]);

  const query = useQuery({
    queryKey: [`/api/events/filter?${queryParams}`],
    select: (data) => data.events as VehicleEvent[],
    enabled: queryParams.length > 0,
  });

  const filteredEvents = useMemo(() => {
    if (!query.data) return [];
    
    // Apply client-side search filtering if searchQuery is provided
    if (filterOptions.searchQuery) {
      const search = filterOptions.searchQuery.toLowerCase();
      return query.data.filter(event => 
        event.location.toLowerCase().includes(search) ||
        event.data.motorHealth.toLowerCase().includes(search) ||
        event.data.brakeHealth.toLowerCase().includes(search) ||
        event.data.tiresPressure.toLowerCase().includes(search) ||
        JSON.stringify(event).toLowerCase().includes(search)
      );
    }
    
    return query.data;
  }, [query.data, filterOptions.searchQuery]);

  return {
    ...query,
    data: filteredEvents,
  };
}
