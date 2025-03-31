import { StatusCard } from "./StatusCard";
import { CheckCircle, Clock, MapPin, Activity } from "lucide-react";
import { DashboardData } from "@/types";

interface StatusCardsProps {
  data: DashboardData;
}

export function StatusCards({ data }: StatusCardsProps) {
  const { currentStatus } = data;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Battery Level Card */}
      <StatusCard
        title="Battery Level"
        value={`${currentStatus.batteryLevel}%`}
        trend={{ 
          label: "Stable", 
          direction: "stable" 
        }}
        progress={currentStatus.batteryLevel}
        progressColor="bg-success-500"
        progressLabel={`Estimated range: ${currentStatus.data.estimatedRange} km`}
      />
      
      {/* Current Speed Card */}
      <StatusCard
        title="Current Speed"
        value={`${currentStatus.speed} km/h`}
        trend={{ 
          label: currentStatus.speed === 0 ? "Parked" : "Moving", 
          direction: "stable",
          variant: currentStatus.speed === 0 ? "default" : "info"
        }}
        footer={
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-neutral-400" />
            <span className="ml-1 text-xs text-neutral-500">
              {currentStatus.ignitionStatus === "ON" 
                ? "Ignition is on" 
                : "Last moving: 2 hours ago"}
            </span>
          </div>
        }
      />
      
      {/* Odometer Card */}
      <StatusCard
        title="Odometer"
        value={`${currentStatus.odometer.toLocaleString()} km`}
        trend={{ 
          label: "+142 km", 
          direction: "up",
          variant: "success"
        }}
        footer={
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="ml-1 text-xs text-neutral-500">
              Current location: <span className="font-medium text-neutral-700">{currentStatus.location}</span>
            </span>
          </div>
        }
      />
      
      {/* Vehicle Health Card */}
      <StatusCard
        title="Vehicle Health"
        value=""
        icon={<CheckCircle className="h-8 w-8 text-success-500" />}
        trend={{ 
          label: "Good", 
          direction: "stable",
          variant: "success"
        }}
        footer={
          <div className="text-xs text-neutral-500 space-y-1">
            <div className="flex justify-between">
              <span>Battery Health:</span>
              <span className="font-medium text-success-500">{currentStatus.data.motorHealth}</span>
            </div>
            <div className="flex justify-between">
              <span>Motor:</span>
              <span className="font-medium text-success-500">{currentStatus.data.motorHealth}</span>
            </div>
            <div className="flex justify-between">
              <span>Braking System:</span>
              <span className="font-medium text-success-500">{currentStatus.data.brakeHealth}</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
