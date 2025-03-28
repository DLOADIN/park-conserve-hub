import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Plus, CalendarIcon, FilterIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ExtraFundsRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  park: string;
  parkId: string;
  submittedBy: string;
  submittedById: string;
  dateSubmitted: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approvedBy?: string;
  dateResolved?: string;
}

const mockExtraFundsRequests: ExtraFundsRequest[] = [
  {
    id: 'ef-001',
    title: 'Extended Trail Maintenance',
    description: 'Additional funds needed for expanding trail maintenance to newly acquired park areas.',
    amount: 75000,
    park: 'Yellowstone National Park',
    parkId: 'park-001',
    submittedBy: 'Jane Smith',
    submittedById: 'user-002',
    dateSubmitted: '2023-10-15',
    status: 'pending',
  },
  {
    id: 'ef-002',
    title: 'Visitor Center Expansion',
    description: 'Expanding visitor center to accommodate increasing tourism.',
    amount: 150000,
    park: 'Grand Canyon National Park',
    parkId: 'park-002',
    submittedBy: 'Jane Smith',
    submittedById: 'user-002',
    dateSubmitted: '2023-10-10',
    status: 'approved',
    reason: 'Expansion necessary to improve visitor experience',
    approvedBy: 'Michael Johnson',
    dateResolved: '2023-10-12',
  },
  {
    id: 'ef-003',
    title: 'Wildlife Conservation Program',
    description: 'Additional funding for expanded wildlife conservation efforts.',
    amount: 95000,
    park: 'Zion National Park',
    parkId: 'park-003',
    submittedBy: 'Jane Smith',
    submittedById: 'user-002',
    dateSubmitted: '2023-10-05',
    status: 'rejected',
    reason: 'Current conservation budget is sufficient. Please reapply next fiscal year.',
    approvedBy: 'Michael Johnson',
    dateResolved: '2023-10-07',
  },
  {
    id: 'ef-004',
    title: 'Educational Programs',
    description: 'Funds for developing new educational programs about park ecology.',
    amount: 45000,
    park: 'Yosemite National Park',
    parkId: 'park-004',
    submittedBy: 'Jane Smith',
    submittedById: 'user-002',
    dateSubmitted: '2023-09-28',
    status: 'pending',
  },
  {
    id: 'ef-005',
    title: 'Campground Improvements',
    description: 'Upgrading facilities at three major campgrounds.',
    amount: 85000,
    park: 'Acadia National Park',
    parkId: 'park-005',
    submittedBy: 'Jane Smith',
    submittedById: 'user-002',
    dateSubmitted: '2023-09-22',
    status: 'approved',
    reason: 'Necessary improvements for visitor safety and comfort',
    approvedBy: 'Michael Johnson',
    dateResolved: '2023-09-25',
  },
];

const ExtraFunds = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const filteredRequests = mockExtraFundsRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.park.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    const matchesPark = parkFilter === 'all' || request.parkId === parkFilter;
    
    let matchesDate = true;
    if (dateRange && dateRange.from && dateRange.to) {
      const requestDate = new Date(request.dateSubmitted);
      matchesDate = requestDate >= dateRange.from && requestDate <= dateRange.to;
    }
    
    return matchesSearch && matchesStatus && matchesPark && matchesDate;
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleCreateNew = () => {
    navigate('/finance/extra-funds/new');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Extra Funds Requests"
            subtitle="Manage additional funding requests"
          />
          
          <main className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="default" onClick={handleCreateNew} className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Request
                </Button>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter extra funds requests by status, park, and date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Park</label>
                    <Select value={parkFilter} onValueChange={setParkFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select park" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Parks</SelectItem>
                        <SelectItem value="park-001">Yellowstone National Park</SelectItem>
                        <SelectItem value="park-002">Grand Canyon National Park</SelectItem>
                        <SelectItem value="park-003">Zion National Park</SelectItem>
                        <SelectItem value="park-004">Yosemite National Park</SelectItem>
                        <SelectItem value="park-005">Acadia National Park</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <div className="mb-6">
                      <DateRangePicker 
                        date={dateRange} 
                        onSelect={handleDateRangeSelect} 
                        className="w-full sm:w-auto"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Extra Funds Requests</CardTitle>
                <CardDescription>
                  Showing {filteredRequests.length} of {mockExtraFundsRequests.length} requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRequests.map(request => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{request.title}</CardTitle>
                              <CardDescription className="text-sm mt-1">{request.park}</CardDescription>
                            </div>
                            <Badge className={getStatusBadgeColor(request.status)}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Amount:</span>
                              <span className="font-medium">${request.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Submitted:</span>
                              <span>{request.dateSubmitted}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">By:</span>
                              <span>{request.submittedBy}</span>
                            </div>
                            {request.status !== 'pending' && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Resolved:</span>
                                <span>{request.dateResolved}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-0">
                          <Button variant="outline" size="sm" className="gap-2">
                            <FileText className="h-4 w-4" />
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
                    <p className="text-gray-500">Try adjusting your filters or create a new request</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-sm text-gray-500">
                  Showing {filteredRequests.length} of {mockExtraFundsRequests.length} requests
                </div>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ExtraFunds;