import { useState, useCallback } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useVehicles } from "@/hooks/useVehicleData";
import { useFilteredVehicleEvents } from "@/hooks/useVehicleEvents";
import { EventsTable } from "@/components/dashboard/EventsTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { EventFilterOptions } from "@/types";

export default function VehicleEvents() {
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Date range state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Filter state
  const [filters, setFilters] = useState<EventFilterOptions>({
    eventType: 'ALL',
  });
  
  // Get filtered events
  const { 
    data: events = [], 
    isLoading, 
    refetch 
  } = useFilteredVehicleEvents(filters);
  
  // Update filters
  const updateFilters = useCallback((newFilters: Partial<EventFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Handle vehicle selection
  const handleVehicleChange = (vehicleId: string) => {
    updateFilters({ vehicleId: vehicleId === 'ALL' ? undefined : vehicleId });
  };
  
  // Handle event type selection
  const handleEventTypeChange = (eventType: string) => {
    updateFilters({ eventType: eventType === 'ALL' ? 'ALL' : eventType as any });
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update filters based on tab
    switch (value) {
      case "ignitionOn":
        updateFilters({ eventType: 'IGNITION_ON' });
        break;
      case "ignitionOff":
        updateFilters({ eventType: 'IGNITION_OFF' });
        break;
      case "timeInterval":
        updateFilters({ eventType: 'TIME_INTERVAL' });
        break;
      default:
        updateFilters({ eventType: 'ALL' });
    }
  };
  
  // Handle date range selection
  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      updateFilters({
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      });
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };
  
  // Format date for display
  const formatDate = (date?: Date) => {
    return date ? format(date, 'PP') : 'Select date';
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Vehicle Events</h2>
        <p className="text-sm text-neutral-500">
          View and filter all vehicle events by type, vehicle, and date range
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Event Filters</CardTitle>
          <CardDescription>Customize your view of vehicle events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">
                Select Vehicle
              </label>
              <Select 
                value={filters.vehicleId || 'ALL'} 
                onValueChange={handleVehicleChange}
                disabled={isLoadingVehicles}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Vehicles</SelectItem>
                  {vehicles?.map(vehicle => (
                    <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">
                Event Type
              </label>
              <Select value={filters.eventType || 'ALL'} onValueChange={handleEventTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Event Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Event Types</SelectItem>
                  <SelectItem value="IGNITION_ON">Ignition On</SelectItem>
                  <SelectItem value="IGNITION_OFF">Ignition Off</SelectItem>
                  <SelectItem value="TIME_INTERVAL">Time Interval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">
                Date Range
              </label>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal flex-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-neutral-500">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal flex-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleDateRangeApply} disabled={!startDate || !endDate}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search events..."
              className="max-w-sm"
              value={filters.searchQuery || ''}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            />
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="ignitionOn">Ignition On</TabsTrigger>
          <TabsTrigger value="ignitionOff">Ignition Off</TabsTrigger>
          <TabsTrigger value="timeInterval">Time Interval</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <EventsTable 
            events={events} 
            isLoading={isLoading}
            filterOptions={filters}
            onFilterChange={updateFilters}
          />
        </TabsContent>
        
        <TabsContent value="ignitionOn" className="mt-4">
          <EventsTable 
            events={events} 
            isLoading={isLoading}
            filterOptions={{ ...filters, eventType: 'IGNITION_ON' }}
            onFilterChange={updateFilters}
          />
        </TabsContent>
        
        <TabsContent value="ignitionOff" className="mt-4">
          <EventsTable 
            events={events} 
            isLoading={isLoading}
            filterOptions={{ ...filters, eventType: 'IGNITION_OFF' }}
            onFilterChange={updateFilters}
          />
        </TabsContent>
        
        <TabsContent value="timeInterval" className="mt-4">
          <EventsTable 
            events={events} 
            isLoading={isLoading}
            filterOptions={{ ...filters, eventType: 'TIME_INTERVAL' }}
            onFilterChange={updateFilters}
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
