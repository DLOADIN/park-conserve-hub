import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, Search, Filter, Clock, CheckCircle, XCircle, AlertCircleIcon, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';

// Sample emergency requests data
const emergencyRequestsData = [
  {
    id: 'ER001',
    title: 'Flood Damage Repair',
    parkName: 'Yellowstone',
    amount: 75000,
    emergencyType: 'Natural Disaster',
    timeframe: 'urgent',
    status: 'pending',
    submittedDate: '2023-10-15',
    description: 'Recent flooding has damaged a critical access bridge in the northeast section of the park. Immediate repairs are needed to ensure visitor safety and prevent further damage.',
    justification: 'Without this repair, the entire northeast section of the park will be inaccessible to visitors and emergency vehicles. This poses significant safety risks and will result in revenue losses if not addressed promptly.',
  },
  {
    id: 'ER002',
    title: 'Wildlife Disease Containment',
    parkName: 'Grand Canyon',
    amount: 45000,
    emergencyType: 'Wildlife Crisis',
    timeframe: 'immediate',
    status: 'submitted',
    submittedDate: '2023-10-18',
    description: 'A potentially contagious disease has been detected in the local deer population. Funds are needed for testing, monitoring, and containment efforts.',
    justification: 'If left unchecked, this disease could decimate the deer population and potentially spread to other wildlife species. Immediate action is necessary to prevent an ecological crisis.',
  },
  {
    id: 'ER003',
    title: 'Trail Collapse Repair',
    parkName: 'Zion',
    amount: 32000,
    emergencyType: 'Infrastructure Failure',
    timeframe: 'urgent',
    status: 'submitted',
    submittedDate: '2023-10-12',
    description: 'A section of the Angel\'s Landing trail has collapsed due to erosion, creating a dangerous situation for hikers.',
    justification: 'This is one of our most popular trails and the collapse creates a severe safety hazard. Immediate repair is needed before someone is injured.',
  },
  {
    id: 'ER004',
    title: 'Contaminated Water Source',
    parkName: 'Acadia',
    amount: 28500,
    emergencyType: 'Safety Hazard',
    timeframe: 'immediate',
    status: 'draft',
    submittedDate: null,
    description: 'A water source used by campers and hikers has tested positive for harmful bacteria. Emergency purification systems and alternative water sources are needed.',
    justification: 'This is a critical public health issue that could result in illness among park visitors if not addressed immediately.',
  },
];

const EmergencyRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState(emergencyRequestsData);
  const [filteredRequests, setFilteredRequests] = useState(emergencyRequestsData);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [parkFilter, setParkFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  // Handle filter changes
  const handleFilterChange = (status: string) => {
    setActiveTab(status);
    applyFilters(status, parkFilter, searchTerm, dateRange);
  };
  
  // Handle park filter change
  const handleParkFilterChange = (park: string) => {
    setParkFilter(park);
    applyFilters(activeTab, park, searchTerm, dateRange);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(activeTab, parkFilter, term, dateRange);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange({ from: range.from ?? undefined, to: range.to ?? undefined });
    applyFilters(activeTab, parkFilter, searchTerm, range);
  };
  
  // Apply all filters
  const applyFilters = (
    status: string, 
    park: string, 
    term: string, 
    dates: { from?: Date; to?: Date }
  ) => {
    let filtered = requests;
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(request => request.status === status);
    }
    
    // Apply park filter
    if (park !== 'all') {
      filtered = filtered.filter(request => request.parkName === park);
    }
    
    // Apply search filter
    if (term) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(term.toLowerCase()) ||
        request.emergencyType.toLowerCase().includes(term.toLowerCase()) ||
        (request.description && request.description.toLowerCase().includes(term.toLowerCase()))
      );
    }
    
    // Apply date filter
    if (dates.from && dates.to) {
      filtered = filtered.filter(request => {
        if (!request.submittedDate) return false;
        const requestDate = new Date(request.submittedDate);
        return requestDate >= dates.from! && requestDate <= dates.to!;
      });
    }
    
    setFilteredRequests(filtered);
  };
  
  // Open view dialog
  const openViewDialog = (request: any) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };
  
  // Submit draft request
  const submitDraftRequest = (requestId: string) => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: 'submitted',
          submittedDate: format(new Date(), 'yyyy-MM-dd'),
        };
      }
      return request;
    });
    
    setRequests(updatedRequests);
    applyFilters(activeTab, parkFilter, searchTerm, dateRange);
    
    // Close dialog if open
    if (isViewDialogOpen && selectedRequest?.id === requestId) {
      setIsViewDialogOpen(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Submitted</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending Approval</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 hover:bg-red-600">Denied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get timeframe badge
  const getTimeframeBadge = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate':
        return <Badge className="bg-red-500 hover:bg-red-600">Immediate</Badge>;
      case 'urgent':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High Priority</Badge>;
      case 'standard':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Standard</Badge>;
      default:
        return <Badge>{timeframe}</Badge>;
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Emergency Fund Requests"
            subtitle="Create and manage emergency funding requests"
          />
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Emergency Requests</CardTitle>
                    <CardDescription>
                      Manage and track emergency funding requests for parks
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/finance/emergency-requests/new')} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Emergency Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 w-full md:w-1/3">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <DateRangePicker
                      onSelect={handleDateRangeChange}
                    />
                    
                    <Select
                      onValueChange={handleParkFilterChange}
                      defaultValue="all"
                    >
                      <SelectTrigger className="w-[160px]">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Filter by Park" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Parks</SelectItem>
                        <SelectItem value="Yellowstone">Yellowstone</SelectItem>
                        <SelectItem value="Yosemite">Yosemite</SelectItem>
                        <SelectItem value="Grand Canyon">Grand Canyon</SelectItem>
                        <SelectItem value="Zion">Zion</SelectItem>
                        <SelectItem value="Acadia">Acadia</SelectItem>
                        <SelectItem value="Rocky Mountain">Rocky Mountain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Tabs defaultValue="all" className="w-full" onValueChange={handleFilterChange}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="draft">Drafts</TabsTrigger>
                    <TabsTrigger value="submitted">Submitted</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Emergency Type</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                No emergency requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.emergencyType}</TableCell>
                                <TableCell>{getTimeframeBadge(request.timeframe)}</TableCell>
                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                <TableCell>{request.submittedDate || '-'}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openViewDialog(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    
                                    {request.status === 'draft' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                        onClick={() => submitDraftRequest(request.id)}
                                      >
                                        Submit
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="draft" className="mt-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Emergency Type</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                No draft requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.emergencyType}</TableCell>
                                <TableCell>{getTimeframeBadge(request.timeframe)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openViewDialog(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                      onClick={() => submitDraftRequest(request.id)}
                                    >
                                      Submit
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="submitted" className="mt-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Emergency Type</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Submitted Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No submitted requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.emergencyType}</TableCell>
                                <TableCell>{getTimeframeBadge(request.timeframe)}</TableCell>
                                <TableCell>{request.submittedDate}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openViewDialog(request)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pending" className="mt-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Emergency Type</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Submitted Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No pending requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.emergencyType}</TableCell>
                                <TableCell>{getTimeframeBadge(request.timeframe)}</TableCell>
                                <TableCell>{request.submittedDate}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openViewDialog(request)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3 text-amber-500 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Emergency Request</span>
            </div>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Request ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Park</h4>
                <p>{selectedRequest?.parkName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                <p>${selectedRequest?.amount?.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Emergency Type</h4>
                <p>{selectedRequest?.emergencyType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Timeframe</h4>
                <p>{selectedRequest?.timeframe && getTimeframeBadge(selectedRequest.timeframe)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p>{selectedRequest?.status && getStatusBadge(selectedRequest.status)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Submitted Date</h4>
                <p>{selectedRequest?.submittedDate || 'Not submitted yet'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
              <p className="text-sm">{selectedRequest?.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Justification</h4>
              <p className="text-sm">{selectedRequest?.justification}</p>
            </div>
          </div>
          
          <DialogFooter>
            {selectedRequest?.status === 'draft' && (
              <Button 
                className="bg-blue-600"
                onClick={() => {
                  submitDraftRequest(selectedRequest.id);
                  setIsViewDialogOpen(false);
                }}
              >
                Submit Request
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default EmergencyRequests;