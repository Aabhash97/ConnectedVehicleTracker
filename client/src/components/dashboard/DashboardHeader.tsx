import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicleData";
import { useLocation } from "wouter";

interface DashboardHeaderProps {
  title: string;
  description: string;
  selectedVehicleId: string;
  timePeriod: string;
  onTimePeriodChange: (period: string) => void;
  onRefresh: () => void;
}

export function DashboardHeader({
  title,
  description,
  selectedVehicleId,
  timePeriod,
  onTimePeriodChange,
  onRefresh
}: DashboardHeaderProps) {
  const { data: vehicles } = useVehicles();
  const [, setLocation] = useLocation();
  
  // Handle vehicle change
  const handleVehicleChange = (vehicleId: string) => {
    if (vehicleId !== selectedVehicleId) {
      setLocation(`/dashboard/${vehicleId}`);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">{title}</h2>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Select value={selectedVehicleId} onValueChange={handleVehicleChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles?.map(vehicle => (
                <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timePeriod} onValueChange={onTimePeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={onRefresh}
            className="inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
