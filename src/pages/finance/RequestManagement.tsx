import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, X, Search, Filter, ArrowUpDown, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays, format } from 'date-fns';

// Sample fund request data
const fundRequestsData = [
  {
    id: '001',
    title: 'Trail Maintenance Equipment',
    description: 'Funds needed to purchase new trail maintenance equipment for the eastern section of the park.',
    amount: 12500,
    category: 'Maintenance',
    urgency: 'medium',
    status: 'pending',
    parkName: 'Yellowstone',
    staffName: 'John Doe',
    submittedDate: '2023-10-12',
    notes: '',
  },
  {
    id: '002',
    title: 'Wildlife Monitoring System',
    description: 'Advanced tracking system for monitoring endangered species in the north region.',
    amount: 35000,
    category: 'Conservation',
    urgency: 'high',
    status: 'approved',
    parkName: 'Yellowstone',
    staffName: 'Emma Wilson',
    submittedDate: '2023-10-05',
    approvedDate: '2023-10-08',
    notes: 'Approved - Essential for conservation efforts',
  },
  {
    id: '003',
    title: 'Visitor Center Renovation',
    description: 'Updating information displays and interactive exhibits in the main visitor center.',
    amount: 28000,
    category: 'Infrastructure',
    urgency: 'low',
    status: 'denied',
    parkName: 'Yosemite',
    staffName: 'Michael Brown',
    submittedDate: '2023-09-28',
    deniedDate: '2023-10-02',
    notes: 'Denied - Can be included in next year\'s budget',
  },
  {
    id: '004',
    title: 'Emergency Response Equipment',
    description: 'New emergency response gear for ranger team.',
    amount: 8500,
    category: 'Safety',
    urgency: 'high',
    status: 'approved',
    parkName: 'Grand Canyon',
    staffName: 'Sarah Johnson',
    submittedDate: '2023-10-10',
    approvedDate: '2023-10-11',
    notes: 'Approved - Safety priority',
  },
  {
    id: '005',
    title: 'Educational Program Materials',
    description: 'Materials for new school outreach program.',
    amount: 5000,
    category: 'Education',
    urgency: 'medium',
    status: 'pending',
    parkName: 'Acadia',
    staffName: 'David Lee',
    submittedDate: '2023-10-14',
    notes: '',
  },
];

// Type for review dialog form
interface ReviewFormData {
  decision: 'approved' | 'denied';
  notes: string;
}

const RequestManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fundRequests, setFundRequests] = useState(fundRequestsData);
  const [filteredRequests, setFilteredRequests] = useState(fundRequestsData);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    decision: 'approved',
    notes: '',
  });
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  
  // Handle filter changes
  const handleFilterChange = (status: string) => {
    setActiveTab(status);
    
    let filtered = fundRequests;
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(request => request.status === status);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.parkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.submittedDate);
        return requestDate >= dateRange.from! && requestDate <= dateRange.to!;
      });
    }
    
    setFilteredRequests(filtered);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    let filtered = fundRequests;
    
    // Apply status filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => request.status === activeTab);
    }
    
    // Apply search filter
    if (term) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(term.toLowerCase()) ||
        request.parkName.toLowerCase().includes(term.toLowerCase()) ||
        request.staffName.toLowerCase().includes(term.toLowerCase()) ||
        request.category.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.submittedDate);
        return requestDate >= dateRange.from! && requestDate <= dateRange.to!;
      });
    }
    
    setFilteredRequests(filtered);
  };
  
  // Open review dialog
  const openReviewDialog = (request: any) => {
    setSelectedRequest(request);
    setReviewFormData({
      decision: 'approved',
      notes: '',
    });
    setIsReviewDialogOpen(true);
  };
  
  // Handle review submission
  const handleReviewSubmit = () => {
    const updatedRequests = fundRequests.map(request => {
      if (request.id === selectedRequest.id) {
        return {
          ...request,
          status: reviewFormData.decision,
          notes: reviewFormData.notes,
          ...(reviewFormData.decision === 'approved' ? { approvedDate: format(new Date(), 'yyyy-MM-dd') } : {}),
          ...(reviewFormData.decision === 'denied' ? { deniedDate: format(new Date(), 'yyyy-MM-dd') } : {}),
        };
      }
      return request;
    });
    
    setFundRequests(updatedRequests as typeof fundRequests);
    handleFilterChange(activeTab);
    setIsReviewDialogOpen(false);
    
    toast.success(`Request ${reviewFormData.decision === 'approved' ? 'approved' : 'denied'} successfully`);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange({ from: range.from ?? undefined, to: range.to ?? undefined });
    
    
    let filtered = fundRequests;
    
    // Apply status filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => request.status === activeTab);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.parkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (range.from && range.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.submittedDate);
        return requestDate >= range.from! && requestDate <= range.to!;
      });
    }
    
    setFilteredRequests(filtered);
  };
  
  // Generate badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 hover:bg-red-600">Denied</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Generate urgency badge
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Low</Badge>;
      default:
        return <Badge>{urgency}</Badge>;
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Fund Request Management"
            subtitle="Review and manage park staff fund requests"
          />
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fund Requests</CardTitle>
                <CardDescription>
                  Manage and respond to funding requests from park staff
                </CardDescription>
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
                      onValueChange={(value) => handleFilterChange(value)}
                      defaultValue="all"
                    >
                      <SelectTrigger className="w-[160px]">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Filter by Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Tabs defaultValue="all" className="w-full" onValueChange={handleFilterChange}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Requests</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="denied">Denied</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Staff</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                No fund requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>{request.staffName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.category}</TableCell>
                                <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                <TableCell>{request.submittedDate}</TableCell>
                                <TableCell>
                                  {request.status === 'pending' ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => openReviewDialog(request)}
                                    >
                                      Review
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => openReviewDialog(request)}
                                    >
                                      Details
                                    </Button>
                                  )}
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
                            <TableHead>Staff</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                No pending requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>{request.staffName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.category}</TableCell>
                                <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                                <TableCell>{request.submittedDate}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openReviewDialog(request)}
                                  >
                                    Review
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="approved" className="mt-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Staff</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Approved Date</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No approved requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>{request.staffName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.approvedDate}</TableCell>
                                <TableCell className="max-w-xs truncate">{request.notes}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openReviewDialog(request)}
                                  >
                                    Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="denied" className="mt-6">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Park</TableHead>
                            <TableHead>Staff</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Denied Date</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                No denied requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell>{request.id}</TableCell>
                                <TableCell className="font-medium">{request.title}</TableCell>
                                <TableCell>{request.parkName}</TableCell>
                                <TableCell>{request.staffName}</TableCell>
                                <TableCell>${request.amount.toLocaleString()}</TableCell>
                                <TableCell>{request.deniedDate}</TableCell>
                                <TableCell className="max-w-xs truncate">{request.notes}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openReviewDialog(request)}
                                  >
                                    Details
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
      
      {/* Request Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'pending' ? 'Review Fund Request' : 'Fund Request Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.status === 'pending' 
                ? 'Approve or deny this funding request from park staff.'
                : 'View details of this fund request.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Request ID</h4>
                <p>{selectedRequest?.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p>{selectedRequest?.status && getStatusBadge(selectedRequest.status)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Park</h4>
                <p>{selectedRequest?.parkName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Staff</h4>
                <p>{selectedRequest?.staffName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Submitted Date</h4>
                <p>{selectedRequest?.submittedDate}</p>
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
                <h4 className="text-sm font-medium text-gray-500">Urgency</h4>
                <p>{selectedRequest?.urgency && getUrgencyBadge(selectedRequest.urgency)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
              <p className="text-sm">{selectedRequest?.description}</p>
            </div>
            
            {selectedRequest?.status !== 'pending' && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                <p className="text-sm">{selectedRequest?.notes}</p>
              </div>
            )}
            
            {selectedRequest?.status === 'pending' && (
              <>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Decision</h4>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setReviewFormData({ ...reviewFormData, decision: 'approved' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                          reviewFormData.decision === 'approved'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <CheckCircle className={`h-4 w-4 ${reviewFormData.decision === 'approved' ? 'text-green-600' : 'text-gray-400'}`} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFormData({ ...reviewFormData, decision: 'denied' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                          reviewFormData.decision === 'denied'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <XCircle className={`h-4 w-4 ${reviewFormData.decision === 'denied' ? 'text-red-600' : 'text-gray-400'}`} />
                        Deny
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <Textarea
                      placeholder="Add your notes for this decision..."
                      value={reviewFormData.notes}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, notes: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Close
            </Button>
            {selectedRequest?.status === 'pending' && (
              <Button onClick={handleReviewSubmit} className={reviewFormData.decision === 'approved' ? 'bg-green-600' : 'bg-red-600'}>
                {reviewFormData.decision === 'approved' ? 'Approve Request' : 'Deny Request'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default RequestManagement;