import { useState, useCallback, useEffect } from "react";
import { useRoute } from "wouter";
import { useVehicles, useDashboardData } from "@/hooks/useVehicleData";
import { MainLayout } from "@/components/layouts/MainLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusCards } from "@/components/dashboard/StatusCards";
import { ChartsRow } from "@/components/dashboard/ChartsRow";
import { EventsTable } from "@/components/dashboard/EventsTable";
import { useFilteredVehicleEvents } from "@/hooks/useVehicleEvents";
import { queryClient } from "@/lib/queryClient";
import { EventFilterOptions } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  // Get vehicleId from route
  const [, params] = useRoute('/dashboard/:vehicleId');
  
  // Get vehicles data
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  
  // State for selected vehicle and time period
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    params?.vehicleId || ''
  );
  const [timePeriod, setTimePeriod] = useState<string>('24h');
  
  // Update selected vehicle when vehicles data is loaded or route param changes
  useEffect(() => {
    if (params?.vehicleId) {
      setSelectedVehicleId(params.vehicleId);
    } else if (vehicles && vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].vehicleId);
    }
  }, [vehicles, params?.vehicleId, selectedVehicleId]);
  
  // Setup event filters
  const [eventFilters, setEventFilters] = useState<EventFilterOptions>({
    vehicleId: selectedVehicleId,
    eventType: 'ALL',
  });
  
  // Update event filters when selected vehicle changes
  useEffect(() => {
    setEventFilters(prev => ({
      ...prev,
      vehicleId: selectedVehicleId
    }));
  }, [selectedVehicleId]);
  
  // Fetch dashboard data for selected vehicle
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard,
    error: dashboardError,
    refetch: refetchDashboard
  } = useDashboardData(selectedVehicleId);
  
  // Fetch filtered events
  const { 
    data: filteredEvents = [], 
    isLoading: isLoadingEvents,
    refetch: refetchEvents
  } = useFilteredVehicleEvents(eventFilters);
  
  // Update filter when vehicleId changes
  const updateFilters = useCallback((newFilters: Partial<EventFilterOptions>) => {
    setEventFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    refetchDashboard();
    refetchEvents();
  }, [refetchDashboard, refetchEvents]);
  
  // Handle time period change
  const handleTimePeriodChange = useCallback((period: string) => {
    setTimePeriod(period);
    // In a real app, you'd update the date range based on selected period
    // For now, we'll just set it in the state
  }, []);
  
  // If vehicles are loading, show loading UI
  if (isLoadingVehicles) {
    return (
      <MainLayout>
        <Skeleton className="h-12 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        
        <Skeleton className="h-96" />
      </MainLayout>
    );
  }
  
  // Effect already handles this, removing redundant code
  
  // Show error if dashboard data fetch failed
  if (dashboardError) {
    return (
      <MainLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <DashboardHeader 
        title="Vehicle Dashboard"
        description="Monitor and analyze your connected vehicles in real-time"
        selectedVehicleId={selectedVehicleId}
        timePeriod={timePeriod}
        onTimePeriodChange={handleTimePeriodChange}
        onRefresh={handleRefresh}
      />
      
      {isLoadingDashboard ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </>
      ) : dashboardData && (
        <>
          <StatusCards data={dashboardData} />
          <ChartsRow data={dashboardData} />
        </>
      )}
      
      <EventsTable
        events={filteredEvents}
        isLoading={isLoadingEvents}
        filterOptions={eventFilters}
        onFilterChange={updateFilters}
      />
    </MainLayout>
  );
}
