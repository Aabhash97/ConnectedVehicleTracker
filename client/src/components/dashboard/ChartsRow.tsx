import { Card, CardContent } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { DashboardData } from "@/types";
import { useState, useMemo } from "react";

interface ChartsRowProps {
  data: DashboardData;
}

export function ChartsRow({ data }: ChartsRowProps) {
  const [chartView, setChartView] = useState<'energy' | 'trips'>('energy');
  
  // Prepare energy consumption data from weekly stats
  const energyConsumptionData = useMemo(() => {
    if (!data.weeklyStats) return [];
    
    return data.weeklyStats.map(stat => {
      const date = new Date(stat.date);
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        consumption: (stat.totalDistance / stat.avgEfficiency) * 100, // Calculate kWh/100km
        efficiency: stat.avgEfficiency,
      };
    }).reverse();
  }, [data.weeklyStats]);
  
  // Prepare trips data
  const tripsData = useMemo(() => {
    if (!data.recentTrips) return [];
    
    return data.recentTrips.map((trip, index) => {
      return {
        name: `Trip ${index + 1}`,
        distance: trip.distance,
        duration: trip.duration,
      };
    });
  }, [data.recentTrips]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Energy Consumption Chart */}
      <Card className="border border-neutral-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-neutral-900">Energy Consumption</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <span className="h-3 w-3 bg-primary rounded-full"></span>
                <span className="ml-1 text-xs text-neutral-500">kWh/100km</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 bg-secondary-500 rounded-full"></span>
                <span className="ml-1 text-xs text-neutral-500">Efficiency %</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={energyConsumptionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" domain={[0, 30]} />
                <YAxis yAxisId="right" orientation="right" domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="consumption"
                  name="Energy (kWh/100km)"
                  stroke="hsl(var(--primary))"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  name="Efficiency (%)"
                  stroke="hsl(var(--secondary))"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trips Chart */}
      <Card className="border border-neutral-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-neutral-900">Recent Trips</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <span className="h-3 w-3 bg-primary rounded-full"></span>
                <span className="ml-1 text-xs text-neutral-500">Distance (km)</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 bg-amber-500 rounded-full"></span>
                <span className="ml-1 text-xs text-neutral-500">Duration (min)</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tripsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="distance" name="Distance (km)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="duration" name="Duration (min)" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
