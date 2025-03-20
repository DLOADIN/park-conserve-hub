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
import { PiggyBank, Plus, Search, Filter, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';

// Sample extra funds requests data
const extraFundsData = [
  {
    id: 'EF001',
    title: 'Wildlife Conservation Program',
    parkName: 'Yellowstone',
    amount: 120000,
    category: 'Conservation',
    expectedDuration: 'Annual',
    status: 'pending',
    submittedDate: '2023-10-10',
    description: 'Additional funding needed for expanded wildlife conservation efforts, including tracking endangered species and habitat restoration.',
    justification: 'Recent wildlife population surveys indicate declining numbers for several key species. This additional funding will allow us to implement more comprehensive conservation measures beyond our regular maintenance operations.',
  },
  {
    id: 'EF002',
    title: 'Visitor Center Renovation',
    parkName: 'Yosemite',
    amount: 250000,
    category: 'Infrastructure',
    expectedDuration: 'One-time',
    status: 'submitted',
    submittedDate: '2023-10-05',
    description: 'Complete renovation of the main visitor center to improve facilities, accessibility, and educational displays.',
    justification: 'The current visitor center is over 25 years old and no longer adequately serves the increasing number of visitors. Renovations will improve visitor experience and educational outcomes.',
  },
  {
    id: 'EF003',
    title: 'Trail System Expansion',
    parkName: 'Zion',
    amount: 85000,
    category: 'Visitor Services',
    expectedDuration: 'Half-year',
    status: 'submitted',
    submittedDate: '2023-09-28',
    description: 'Development of new hiking trails in the eastern section of the park to reduce congestion on existing trails.',
    justification: 'Visitor numbers have increased by 30% in the last two years, creating overcrowding on popular trails. This expansion will distribute visitors more evenly throughout the park.',
  },
  {
    id: 'EF004',
    title: 'Research Initiative: Climate Impact',
    parkName: 'Grand Canyon',
    amount: 95000,
    category: 'Research',
    expectedDuration: 'Annual',
    status: 'draft',
    submittedDate: null,
    description: 'Multi-disciplinary research project to study climate change impacts on the park ecosystem.',
    justification: 'Understanding climate impacts is crucial for long-term conservation planning. This research will provide essential data for future park management decisions.',
  },
];

const ExtraFunds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState(extraFundsData);
  const [filteredRequests, setFilteredRequests] = useState(extraFundsData);
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
    setDateRange(range);
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
        request.category.toLowerCase().includes(term.toLowerCase()) ||
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
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Extra Funds Requests"
            subtitle="Create and manage requests for additional funding"
          />
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Extra Funds Requests</CardTitle>
                    <CardDescription>
                      Manage and track additional funding requests for parks
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/finance/extra-funds/new')} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Extra Funds Request
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
                      value={dateRange}
                      onValueChange={handleDateRangeChange}
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
                            <TableHead>Category</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                No extra funds requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.category}</TableCell>
                                <TableCell>{request.expectedDuration}</TableCell>
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
                            <TableHead>Category</TableHead>
                            <TableHead>Duration</TableHead>
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
                                <TableCell>{request.category}</TableCell>
                                <TableCell>{request.expectedDuration}</TableCell>
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
                            <TableHead>Category</TableHead>
                            <TableHead>Duration</TableHead>
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
                                <TableCell>{request.category}</TableCell>
                                <TableCell>{request.expectedDuration}</TableCell>
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
                            <TableHead>Category</TableHead>
                            <TableHead>Duration</TableHead>
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
                                <TableCell>{request.category}</TableCell>
                                <TableCell>{request.expectedDuration}</TableCell>
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
            <div className="flex items-center gap-3 text-green-500 mb-1">
              <PiggyBank className="h-5 w-5" />
              <span className="text-sm font-medium">Extra Funds Request</span>
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
                <h4 className="text-sm font-medium text-gray-500">Category</h4>
                <p>{selectedRequest?.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                <p>{selectedRequest?.expectedDuration}</p>
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

export default ExtraFunds;