import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Plus, Edit2, Loader2 } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';
import { PrintDownloadTable } from '@/components/ui/PrintDownloadTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ExtraFunds = () => {
  const parkTours = [
    { id: 1, name: 'Akanda National Park', tours: ['Wildlife Safari', 'Forest Hike', 'Bird Watching'] },
    { id: 2, name: 'Moukalaba-Doudou National Park', tours: ['Kayaking Adventure', 'Fishing Tour', 'Lake Cruise'] },
    { id: 3, name: 'Ivindo National Park', tours: ['Rock Climbing', 'Mountain Trail', 'Scenic Drive'] },
    { id: 4, name: 'Loango National Park', tours: ['Whale Watching', 'Beach Safari', 'Rainforest Walk'] },
    { id: 5, name: 'Lopé National Park', tours: ['Cultural Tour', 'Gorilla Trek', 'Ancient Rock Art Walk'] },
    { id: 6, name: 'Mayumba National Park', tours: ['Turtle Nesting Tour', 'Coastal Walk', 'Marine Life Excursion'] },
    { id: 7, name: 'Pongara National Park', tours: ['Mangrove Exploration', 'Sunset Boat Ride', 'Eco-Lodge Retreat'] },
    { id: 8, name: 'Waka National Park', tours: ['Canopy Walk', 'Jungle Hike', 'Bird Photography Tour'] },
    { id: 9, name: 'Birougou National Park', tours: ['Forest Trekking', 'Waterfall Visit', 'Cultural Immersion'] },
    { id: 10, name: 'Bateke Plateau National Park', tours: ['Grassland Safari', 'Volcano Crater Walk', 'Camping Experience'] },
    { id: 11, name: 'Crystal Mountains National Park', tours: ['Mountain Climbing', 'River Rafting', 'Nature Observation'] },
    { id: 12, name: 'Minkébé National Park', tours: ['Elephant Tracking', 'Deep Forest Camping', 'Research Station Visit'] },
    { id: 13, name: 'Mwagne National Park', tours: ['River Safari', 'Botanical Tour', 'Silent Meditation Trail'] },
  ];

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [parkFilter, setParkFilter] = useState('all');
  const [dateRange, setDateRange] = useState<any>(undefined);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    description: '',
    amount: '',
    parkName: '',
    category: '',
    justification: '',
    expectedDuration: ''
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/extra-funds', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch extra funds requests');
        }

        const data = await response.json();
        setRequests(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load extra funds requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDateRangeSelect = (range: any | undefined) => {
    setDateRange(range);
  };

  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.parkName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    const matchesPark = parkFilter === 'all' || request.parkName === parkFilter;

    let matchesDate = true;
    if (dateRange && dateRange.from && dateRange.to) {
      const requestDate = new Date(request.dateSubmitted);
      matchesDate = requestDate >= dateRange.from && requestDate <= dateRange.to;
    }

    return matchesSearch && matchesStatus && matchesPark && matchesDate;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleCreateNew = () => {
    navigate('/finance/extra-funds/new');
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleUpdateClick = (request: any) => {
    setSelectedRequest(request);
    setUpdateFormData({
      title: request.title,
      description: request.description,
      amount: request.amount.toString(),
      parkName: request.parkName,
      category: request.category,
      justification: request.justification,
      expectedDuration: request.expectedDuration
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } } | string,
    field?: string
  ) => {
    if (typeof e === 'string' && field) {
      // Handle Select component changes
      setUpdateFormData(prev => ({
        ...prev,
        [field]: e
      }));
    } else if (typeof e === 'object' && e !== null && 'target' in e) {
      // Handle regular input changes
      const { name, value } = e.target;
      setUpdateFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Extract only the numeric part and convert to number
      const requestId = parseInt(selectedRequest.id.replace(/\D/g, ''), 10);
      
      const response = await fetch(
        `http://localhost:5000/api/finance/extra-funds/${requestId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(updateFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update request');
      }

      const data = await response.json();
      
      // Update the requests list
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === selectedRequest.id ? data.request : req
        )
      );

      setIsUpdateDialogOpen(false);
      toast.success('Extra funds request updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
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
                        {parkTours.map((park) => (
                          <SelectItem key={park.id} value={park.name}>
                            {park.name}
                          </SelectItem>
                        ))}
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Extra Funds Requests</CardTitle>
                    <CardDescription>Showing {filteredRequests.length} requests</CardDescription>
                  </div>
                  <PrintDownloadTable
                    tableId="extra-funds-table"
                    title="Extra Funds Requests Report"
                    filename="extra_funds_requests_report"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : filteredRequests.length > 0 ? (
                  <div id="extra-funds-table">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Park</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted Date</TableHead>
                          {/* <TableHead>Submitted By</TableHead> */}
                          <TableHead className="no-print">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.id}</TableCell>
                            <TableCell>{request.title}</TableCell>
                            <TableCell>{request.parkName}</TableCell>
                            <TableCell>${request.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(request.status)}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(request.dateSubmitted).toLocaleDateString()}</TableCell>
                            {/* <TableCell>{request.submittedBy}</TableCell> */}
                            <TableCell className="no-print">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleViewDetails(request)}
                                >
                                  <FileText className="h-4 w-4" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleUpdateClick(request)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Update
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                <div className="text-sm text-gray-500">Showing {filteredRequests.length} requests</div>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Extra Funds Request</DialogTitle>
            <DialogDescription>
              Make changes to your extra funds request here
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={updateFormData.title}
                  onChange={handleUpdateFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={updateFormData.amount}
                  onChange={handleUpdateFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={updateFormData.category}
                  onValueChange={(value) => handleUpdateFormChange(value, 'category')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="staffing">Staffing</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="conservation">Conservation</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDuration">Expected Duration</Label>
                <Select
                  value={updateFormData.expectedDuration}
                  onValueChange={(value) => handleUpdateFormChange(value, 'expectedDuration')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="2+ years">2+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={updateFormData.description}
                  onChange={handleUpdateFormChange}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  name="justification"
                  value={updateFormData.justification}
                  onChange={handleUpdateFormChange}
                  required
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Request'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ExtraFunds;