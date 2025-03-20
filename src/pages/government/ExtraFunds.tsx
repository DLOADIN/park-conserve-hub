
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { Clock, Check, FileText, Search, X, PiggyBank, Calendar, Landmark } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Progress } from '@/components/ui/progress';

// Sample extra funds data
const extraFundsData = [
  {
    id: 1,
    parkName: 'Yellowstone',
    title: 'Summer Conservation Program',
    description: 'Additional funding needed for expanded summer conservation program focusing on grizzly bear habitat',
    amount: 125000,
    date: '2023-10-12',
    status: 'pending',
    requestedBy: 'Finance Officer',
  },
  {
    id: 2,
    parkName: 'Yosemite',
    title: 'Trail Renovation Project',
    description: 'Additional funds for comprehensive renovation of highest-traffic visitor trails',
    amount: 180000,
    date: '2023-10-08',
    status: 'approved',
    requestedBy: 'Finance Officer',
    reviewedBy: 'Government Agent',
    reviewedDate: '2023-10-10',
    reason: 'Approved due to safety concerns and high visitor impact',
  },
  {
    id: 3,
    parkName: 'Grand Canyon',
    title: 'Educational Center Expansion',
    description: 'Funds to expand the visitor educational center with new interactive exhibits',
    amount: 210000,
    date: '2023-10-05',
    status: 'declined',
    requestedBy: 'Finance Officer',
    reviewedBy: 'Government Agent',
    reviewedDate: '2023-10-07',
    reason: 'Budget constraints, suggest reapplying in next fiscal year',
  },
  {
    id: 4,
    parkName: 'Zion',
    title: 'Research Initiative',
    description: 'Funding for new research initiative on desert ecosystem adaptation to climate change',
    amount: 95000,
    date: '2023-10-15',
    status: 'pending',
    requestedBy: 'Finance Officer',
  },
  {
    id: 5,
    parkName: 'Acadia',
    title: 'Visitor Management System',
    description: 'Implementation of improved visitor management system to reduce environmental impact',
    amount: 150000,
    date: '2023-10-14',
    status: 'pending',
    requestedBy: 'Finance Officer',
  },
];

// Parks data with budget information
const parksData = [
  { name: 'Yellowstone', totalBudget: 1250000, extraFunds: 305000, percentUsed: 68 },
  { name: 'Yosemite', totalBudget: 980000, extraFunds: 180000, percentUsed: 74 },
  { name: 'Grand Canyon', totalBudget: 1100000, extraFunds: 0, percentUsed: 62 },
  { name: 'Zion', totalBudget: 760000, extraFunds: 0, percentUsed: 59 },
  { name: 'Acadia', totalBudget: 690000, extraFunds: 0, percentUsed: 71 },
  { name: 'Rocky Mountain', totalBudget: 850000, extraFunds: 0, percentUsed: 65 },
];

// Form schema for review dialog
const reviewSchema = z.object({
  decision: z.enum(['approved', 'declined']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

const ExtraFunds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewRequest, setViewRequest] = useState<typeof extraFundsData[0] | null>(null);
  const [reviewRequest, setReviewRequest] = useState<typeof extraFundsData[0] | null>(null);
  const [activeTab, setActiveTab] = useState('requests');
  
  // Initialize form
  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      decision: 'approved',
      reason: '',
    },
  });
  
  // Filter requests based on search term, date range, and status
  const filteredRequests = extraFundsData.filter(request => {
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
    toast.success(`Extra funds request ${data.decision === 'approved' ? 'approved' : 'declined'} successfully`);
    setReviewRequest(null);
    form.reset();
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Extra Funds Management"
            subtitle="Review and approve additional funding requests for parks"
          />
          
          <main className="p-6">
            <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="requests">Fund Requests</TabsTrigger>
                <TabsTrigger value="allocations">Park Allocations</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <TabsContent value="requests" className="mt-0 space-y-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Filter Requests</CardTitle>
                  <CardDescription>Search and filter extra fund requests</CardDescription>
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
                  <CardTitle>Extra Fund Requests</CardTitle>
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
                                    <Clock className="h-3 w-3" />
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
                            No extra fund requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="allocations" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Park Fund Allocations</CardTitle>
                  <CardDescription>Overview of budget and extra funds allocated to parks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <PiggyBank className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">Total Extra Funds</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold">
                          ${extraFundsData.reduce((acc, item) => 
                            item.status === 'approved' ? acc + item.amount : acc, 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Approved additional funding</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">Active Requests</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold">
                          {extraFundsData.filter(item => item.status === 'pending').length}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Pending review</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Landmark className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">Parks Supported</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold">
                          {new Set(extraFundsData.filter(item => 
                            item.status === 'approved').map(item => item.parkName)).size}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">With extra funding</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-primary/5 border-none">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-green-100">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="font-medium">Approval Rate</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold">
                          {extraFundsData.filter(item => item.status !== 'pending').length > 0 
                            ? Math.round((extraFundsData.filter(item => item.status === 'approved').length / 
                                extraFundsData.filter(item => item.status !== 'pending').length) * 100)
                            : 0}%
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Of reviewed requests</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-6">
                    {parksData.map((park) => (
                      <div key={park.name} className="border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg">{park.name} National Park</h3>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500 text-sm">
                              Budget Usage: {park.percentUsed}%
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className={park.extraFunds > 0 ? "text-green-600 border-green-200" : ""}
                            >
                              {park.extraFunds > 0 
                                ? `+$${park.extraFunds.toLocaleString()} Extra Funds` 
                                : "No Extra Funds"}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Base Budget: ${park.totalBudget.toLocaleString()}</span>
                              <span>{park.percentUsed}% Used</span>
                            </div>
                            <Progress value={park.percentUsed} className="h-2" />
                          </div>
                          
                          {park.extraFunds > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Extra Funds: ${park.extraFunds.toLocaleString()}</span>
                              <span>+{Math.round((park.extraFunds / park.totalBudget) * 100)}% of Base Budget</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <Button size="sm" variant="outline" className="mr-2">
                            View Details
                          </Button>
                          {!park.extraFunds && (
                            <Button size="sm">
                              Allocate Extra Funds
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button className="w-full">Generate Comprehensive Report</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </main>
        </div>
      </div>
      
      {/* View Request Details Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Extra Funds Request Details</DialogTitle>
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
                        <Clock className="h-3 w-3" />
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
            <DialogTitle>Review Extra Funds Request</DialogTitle>
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

export default ExtraFunds;