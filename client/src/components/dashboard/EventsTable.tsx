import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useMemo } from "react";
import { VehicleEvent, EventFilterOptions } from "@/types";
import { Clock, Map, Search } from "lucide-react";

interface EventsTableProps {
  events: VehicleEvent[];
  isLoading: boolean;
  filterOptions: EventFilterOptions;
  onFilterChange: (options: Partial<EventFilterOptions>) => void;
}

export function EventsTable({ 
  events, 
  isLoading, 
  filterOptions, 
  onFilterChange 
}: EventsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Calculate pagination
  const totalPages = Math.ceil(events.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEvents = events.slice(startIndex, startIndex + pageSize);
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  // Get badge color based on event type
  const getEventTypeBadge = (eventType: string) => {
    switch(eventType) {
      case 'IGNITION_ON':
        return <Badge variant="success">Ignition On</Badge>;
      case 'IGNITION_OFF':
        return <Badge variant="destructive">Ignition Off</Badge>;
      case 'TIME_INTERVAL':
        return <Badge variant="outline">Time Interval</Badge>;
      default:
        return <Badge variant="secondary">{eventType}</Badge>;
    }
  };
  
  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchQuery: e.target.value });
  };
  
  // Handle event type filter change
  const handleEventTypeChange = (value: string) => {
    onFilterChange({ 
      eventType: value === 'ALL' ? 'ALL' : value as any
    });
  };
  
  // Generate pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} 
        />
      </PaginationItem>
    );
    
    // Calculate visible page range
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Ellipsis if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink 
            isActive={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} 
        />
      </PaginationItem>
    );
    
    return items;
  }, [currentPage, totalPages]);
  
  return (
    <Card className="border border-neutral-100 shadow-sm mb-6">
      <CardHeader className="px-6 py-5 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-medium text-neutral-900">
              Recent Vehicle Events
            </CardTitle>
            <CardDescription className="text-sm text-neutral-500">
              View and filter vehicle event history
            </CardDescription>
          </div>
          <div className="mt-3 sm:mt-0 flex flex-wrap items-center space-x-0 sm:space-x-2 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10"
                  value={filterOptions.searchQuery || ''}
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Select 
                value={filterOptions.eventType || 'ALL'} 
                onValueChange={handleEventTypeChange}
              >
                <SelectTrigger className="w-full">
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Timestamp
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Event Type
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Location
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Data
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading events...
                  </TableCell>
                </TableRow>
              ) : paginatedEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-neutral-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-neutral-400 mr-2" />
                        <span>{formatDate(event.timestamp)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {getEventTypeBadge(event.eventType)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex items-center">
                        <Map className="h-4 w-4 text-neutral-400 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <span className="text-xs font-mono bg-neutral-100 px-2 py-1 rounded">
                        Battery: {event.batteryLevel}%, Temp: {event.temperature}°C
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">Processed</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-neutral-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + pageSize, events.length)}
                  </span>{" "}
                  of <span className="font-medium">{events.length}</span> events
                </p>
              </div>
              <Pagination>
                <PaginationContent>
                  {paginationItems}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
