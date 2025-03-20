
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { AlertTriangle, Check, FileText, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Sample emergency request data
const emergencyRequestsData = [
  {
    id: 1,
    parkName: 'Yellowstone',
    title: 'Flood Damage Repair',
    description: 'Urgent repairs needed for visitor walkways damaged in recent flooding',
    amount: 75000,
    date: '2023-10-15',
    status: 'pending',
    requestedBy: 'John Smith',
  },
  {
    id: 2,
    parkName: 'Yosemite',
    title: 'Wildlife Rescue Equipment',
    description: 'Equipment needed for rescue operations due to wildfire affecting wildlife habitats',
    amount: 35000,
    date: '2023-10-10',
    status: 'approved',
    requestedBy: 'Emma Johnson',
    reviewedBy: 'Government Agent',
    reviewedDate: '2023-10-12',
    reason: 'Critical for wildlife protection efforts',
  },
  {
    id: 3,
    parkName: 'Grand Canyon',
    title: 'Trail Safety Measures',
    description: 'Emergency safety barriers needed after landslide on popular hiking trail',
    amount: 48000,
    date: '2023-10-05',
    status: 'declined',
    requestedBy: 'Michael Brown',
    reviewedBy: 'Government Agent',
    reviewedDate: '2023-10-08',
    reason: 'Alternate routes available, can be addressed in regular budget cycle',
  },
  {
    id: 4,
    parkName: 'Zion',
    title: 'Water Purification System',
    description: 'Replacement water purification system needed after contamination event',
    amount: 62000,
    date: '2023-10-20',
    status: 'pending',
    requestedBy: 'Sarah Miller',
  },
  {
    id: 5,
    parkName: 'Acadia',
    title: 'Emergency Vehicle Replacement',
    description: 'Replacement of park ranger vehicle damaged during storm response',
    amount: 55000,
    date: '2023-10-18',
    status: 'pending',
    requestedBy: 'David Wilson',
  },
];

// Form schema for review dialog
const reviewSchema = z.object({
  decision: z.enum(['approved', 'declined']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

const EmergencyRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewRequest, setViewRequest] = useState<typeof emergencyRequestsData[0] | null>(null);
  const [reviewRequest, setReviewRequest] = useState<typeof emergencyRequestsData[0] | null>(null);
  
  // Initialize form
  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      decision: 'approved',
      reason: '',
    },
  });
  
  // Filter requests based on search term, date range, and status
  const filteredRequests = emergencyRequestsData.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.parkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = 
      !date?.from || 
      (new Date(request.date) >= date.from && 
       (!date.to || new Date(request.date) <= date.to));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      request.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });
  
  // Handle review submission
  const onSubmitReview = (data: ReviewForm) => {
    if (!reviewRequest) return;
    
    // In a real app, this would update the database
    toast.success(`Request ${data.decision === 'approved' ? 'approved' : 'declined'} successfully`);
    setReviewRequest(null);
    form.reset();
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Emergency Fund Requests"
            subtitle="Review and approve emergency funding requests from parks"
          />
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Requests</CardTitle>
                <CardDescription>Search and filter emergency fund requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by park or request details..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DateRangePicker date={date} onSelect={setDate} />
                </div>
                
                <div className="mt-4">
                  <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList className="grid grid-cols-4 w-full max-w-md">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="approved">Approved</TabsTrigger>
                      <TabsTrigger value="declined">Declined</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Fund Requests</CardTitle>
                <CardDescription>
                  {filteredRequests.length} requests found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Park</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map(request => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">#{request.id}</TableCell>
                          <TableCell>{request.parkName}</TableCell>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>${request.amount.toLocaleString()}</TableCell>
                          <TableCell>{request.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {request.status === 'pending' && (
                                <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs">
                                  <AlertTriangle className="h-3 w-3" />
                                  Pending
                                </span>
                              )}
                              {request.status === 'approved' && (
                                <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                                  <Check className="h-3 w-3" />
                                  Approved
                                </span>
                              )}
                              {request.status === 'declined' && (
                                <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                                  <X className="h-3 w-3" />
                                  Declined
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setViewRequest(request)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {request.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => setReviewRequest(request)}
                                >
                                  Review
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No emergency requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* View Request Details Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emergency Request Details</DialogTitle>
            <DialogDescription>
              Request #{viewRequest?.id} - {viewRequest?.parkName} National Park
            </DialogDescription>
          </DialogHeader>
          
          {viewRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Title</h4>
                  <p>{viewRequest.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Requested Amount</h4>
                  <p className="font-semibold">${viewRequest.amount.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Requested By</h4>
                  <p>{viewRequest.requestedBy}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date Requested</h4>
                  <p>{viewRequest.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div className="mt-1">
                    {viewRequest.status === 'pending' && (
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {viewRequest.status === 'approved' && (
                      <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                        <Check className="h-3 w-3" />
                        Approved
                      </span>
                    )}
                    {viewRequest.status === 'declined' && (
                      <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                        <X className="h-3 w-3" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>
                
                {'reviewedBy' in viewRequest && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Reviewed By</h4>
                    <p>{viewRequest.reviewedBy}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-gray-700">{viewRequest.description}</p>
              </div>
              
              {'reason' in viewRequest && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Review Reason</h4>
                  <p className="mt-1 text-gray-700">{viewRequest.reason}</p>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewRequest(null)}>
                  Close
                </Button>
                {viewRequest.status === 'pending' && (
                  <Button onClick={() => {
                    setViewRequest(null);
                    setReviewRequest(viewRequest);
                  }}>
                    Review Request
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Review Request Dialog */}
      <Dialog open={!!reviewRequest} onOpenChange={(open) => !open && setReviewRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Emergency Request</DialogTitle>
            <DialogDescription>
              {reviewRequest?.parkName} - {reviewRequest?.title}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
              <FormField
                control={form.control}
                name="decision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decision</FormLabel>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={field.value === 'approved' ? 'default' : 'outline'}
                        className={field.value === 'approved' ? 'bg-green-600' : ''}
                        onClick={() => field.onChange('approved')}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === 'declined' ? 'default' : 'outline'}
                        className={field.value === 'declined' ? 'bg-red-600' : ''}
                        onClick={() => field.onChange('declined')}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Decision</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed reason for your decision..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setReviewRequest(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Review
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default EmergencyRequests;