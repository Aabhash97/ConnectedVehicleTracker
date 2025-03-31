import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useVehicles } from "@/hooks/useVehicleData";
import { 
  LayoutDashboard, 
  FileBarChart2, 
  Settings, 
  BarChart3, 
  Menu, 
  X
} from "lucide-react";

const SidebarLink = ({ 
  to, 
  icon: Icon, 
  children, 
  isActive 
}: { 
  to: string; 
  icon: any; 
  children: React.ReactNode; 
  isActive: boolean;
}) => {
  return (
    <Link href={to}>
      <div 
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          isActive 
            ? "text-white bg-primary" 
            : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
        } cursor-pointer`}
      >
        <Icon className="h-5 w-5 mr-2" />
        {children}
      </div>
    </Link>
  );
};

const VehicleLink = ({ 
  vehicleId, 
  name, 
  status 
}: { 
  vehicleId: string; 
  name: string; 
  status: string;
}) => {
  const [, setLocation] = useLocation();
  const isOnline = status === 'ONLINE';
  
  return (
    <div 
      className="flex items-center px-3 py-2 mt-1 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-primary rounded-md cursor-pointer"
      onClick={() => setLocation(`/dashboard/${vehicleId}`)}
    >
      <span className={`w-2 h-2 mr-2 ${isOnline ? 'bg-success-500' : 'bg-neutral-300'} rounded-full`}></span>
      <span>{name}</span>
    </div>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: vehicles, isLoading } = useVehicles();
  
  // Determine active link
  const isDashboard = location.startsWith('/dashboard');
  const isVehicleEvents = location.startsWith('/vehicle-events');
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const sidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 border-b border-neutral-100">
        <h1 className="text-xl font-semibold text-primary">Connected Car Portal</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <SidebarLink to="/dashboard" icon={LayoutDashboard} isActive={isDashboard}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/vehicle-events" icon={FileBarChart2} isActive={isVehicleEvents}>
          Vehicle Events
        </SidebarLink>
        <SidebarLink to="/settings" icon={Settings} isActive={location === '/settings'}>
          Settings
        </SidebarLink>
        
        <div className="pt-4 mt-4 border-t border-neutral-100">
          <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Vehicles
          </h3>
          {isLoading ? (
            <div className="px-3 py-2 mt-1 text-sm text-neutral-500">Loading vehicles...</div>
          ) : (
            vehicles?.map((vehicle) => (
              <VehicleLink 
                key={vehicle.vehicleId} 
                vehicleId={vehicle.vehicleId} 
                name={vehicle.name} 
                status={vehicle.status} 
              />
            ))
          )}
        </div>
      </nav>
    </>
  );
  
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-neutral-100 shadow-sm">
        {sidebarContent}
      </aside>
      
      {/* Mobile navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-100 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-semibold text-primary">Connected Car Portal</h1>
          <button 
            className="p-2 text-neutral-600 rounded-md hover:bg-neutral-100 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} px-2 pt-2 pb-3 space-y-1 bg-white border-b border-neutral-100`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
