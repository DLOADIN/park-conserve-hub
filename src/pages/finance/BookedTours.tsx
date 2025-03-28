
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Calendar, CreditCard, Ticket, User, MapPin } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Define booking status types
type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

// Define tour booking interface
interface TourBooking {
  id: string;
  bookingDate: Date;
  tourDate: Date;
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  location: string;
  participants: number;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  bookingStatus: BookingStatus;
  notes?: string;
}

// Mock data for tour bookings
const mockTourBookings: TourBooking[] = [
  {
    id: 'BK-2023-001',
    bookingDate: new Date('2023-06-15'),
    tourDate: new Date('2023-07-20'),
    customerName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    tourName: 'Wildlife Safari Adventure',
    location: 'Yellowstone National Park',
    participants: 3,
    amount: 449.97,
    paymentStatus: 'paid',
    bookingStatus: 'confirmed'
  },
  {
    id: 'BK-2023-002',
    bookingDate: new Date('2023-06-18'),
    tourDate: new Date('2023-07-25'),
    customerName: 'Emma Johnson',
    email: 'emma.j@example.com',
    phone: '+1 (555) 987-6543',
    tourName: 'Grand Canyon Rim Trail',
    location: 'Grand Canyon National Park',
    participants: 2,
    amount: 179.98,
    paymentStatus: 'pending',
    bookingStatus: 'pending'
  },
  {
    id: 'BK-2023-003',
    bookingDate: new Date('2023-06-20'),
    tourDate: new Date('2023-07-15'),
    customerName: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '+1 (555) 456-7890',
    tourName: 'Cultural Heritage Tour',
    location: 'Mesa Verde National Park',
    participants: 4,
    amount: 519.96,
    paymentStatus: 'paid',
    bookingStatus: 'confirmed'
  },
  {
    id: 'BK-2023-004',
    bookingDate: new Date('2023-06-22'),
    tourDate: new Date('2023-08-05'),
    customerName: 'Sophia Garcia',
    email: 'sophia.g@example.com',
    phone: '+1 (555) 234-5678',
    tourName: 'Wildlife Photography Trek',
    location: 'Denali National Park',
    participants: 1,
    amount: 199.99,
    paymentStatus: 'paid',
    bookingStatus: 'confirmed'
  },
  {
    id: 'BK-2023-005',
    bookingDate: new Date('2023-06-25'),
    tourDate: new Date('2023-08-12'),
    customerName: 'William Taylor',
    email: 'william.t@example.com',
    phone: '+1 (555) 345-6789',
    tourName: 'Backcountry Hiking Adventure',
    location: 'Yosemite National Park',
    participants: 2,
    amount: 319.98,
    paymentStatus: 'pending',
    bookingStatus: 'pending'
  },
  {
    id: 'BK-2023-006',
    bookingDate: new Date('2023-06-28'),
    tourDate: new Date('2023-07-10'),
    customerName: 'Olivia Martinez',
    email: 'olivia.m@example.com',
    phone: '+1 (555) 567-8901',
    tourName: 'Native American Heritage Experience',
    location: 'Zion National Park',
    participants: 5,
    amount: 699.95,
    paymentStatus: 'refunded',
    bookingStatus: 'cancelled'
  },
  {
    id: 'BK-2023-007',
    bookingDate: new Date('2023-06-30'),
    tourDate: new Date('2023-08-18'),
    customerName: 'James Wilson',
    email: 'james.w@example.com',
    phone: '+1 (555) 678-9012',
    tourName: 'Wildlife Safari Adventure',
    location: 'Yellowstone National Park',
    participants: 2,
    amount: 299.98,
    paymentStatus: 'paid',
    bookingStatus: 'confirmed'
  },
  {
    id: 'BK-2023-008',
    bookingDate: new Date('2023-07-02'),
    tourDate: new Date('2023-07-08'),
    customerName: 'Isabella Moore',
    email: 'isabella.m@example.com',
    phone: '+1 (555) 789-0123',
    tourName: 'Grand Canyon Rim Trail',
    location: 'Grand Canyon National Park',
    participants: 3,
    amount: 269.97,
    paymentStatus: 'paid',
    bookingStatus: 'completed'
  }
];

const BookedTours = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<TourBooking[]>(mockTourBookings);
  const [filteredBookings, setFilteredBookings] = useState<TourBooking[]>(mockTourBookings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...bookings];

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(query) ||
        booking.customerName.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.tourName.toLowerCase().includes(query) ||
        booking.location.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.bookingStatus === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentFilter);
    }

    // Apply date range filter
    if (dateRange && dateRange.from) {
      filtered = filtered.filter(booking => {
        const tourDate = new Date(booking.tourDate);
        if (dateRange.from && dateRange.to) {
          return tourDate >= dateRange.from && tourDate <= dateRange.to;
        } else if (dateRange.from) {
          return tourDate >= dateRange.from;
        }
        return true;
      });
    }

    setFilteredBookings(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateRange(undefined);
    setFilteredBookings(bookings);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle filtering when filters change
  React.useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, paymentFilter, dateRange]);

  // View booking details
  const viewBookingDetails = (booking: TourBooking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  // Update booking status
  const updateBookingStatus = (id: string, status: BookingStatus) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, bookingStatus: status } : booking
    );
    setBookings(updatedBookings);
    applyFilters();
    
    toast({
      title: "Booking Status Updated",
      description: `Booking ${id} status changed to ${status}`,
    });
  };

  // Update payment status
  const updatePaymentStatus = (id: string, status: 'paid' | 'pending' | 'refunded') => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, paymentStatus: status } : booking
    );
    setBookings(updatedBookings);
    applyFilters();
    
    toast({
      title: "Payment Status Updated",
      description: `Booking ${id} payment status changed to ${status}`,
    });
  };

  // Generate booking status badge
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Generate payment status badge
  const getPaymentBadge = (status: 'paid' | 'pending' | 'refunded') => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Refunded</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Generate invoice PDF
  const generateInvoice = (booking: TourBooking) => {
    toast({
      title: "Invoice Generated",
      description: `Invoice for booking ${booking.id} has been generated and is ready for download.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <div className="flex-1">
          <DashboardHeader 
            title="Booked Tours"
            subtitle="Manage and track tour bookings"
          />
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tour Booking Management</CardTitle>
                <CardDescription>
                  View and manage all tour bookings across national parks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bookings..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Booking Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={paymentFilter}
                      onValueChange={setPaymentFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Payment Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <DateRangePicker
                      date={dateRange}
                      onSelect={setDateRange}
                      className="w-full sm:w-auto"
                    />
                    
                    <Button variant="outline" onClick={resetFilters} className="whitespace-nowrap">
                      Reset Filters
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Tour Name</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Tour Date</TableHead>
                        <TableHead className="text-center">Participants</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{booking.tourName}</TableCell>
                            <TableCell>{booking.customerName}</TableCell>
                            <TableCell>{format(booking.tourDate, 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="text-center">{booking.participants}</TableCell>
                            <TableCell className="text-right">${booking.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(booking.bookingStatus)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getPaymentBadge(booking.paymentStatus)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => viewBookingDetails(booking)}
                                >
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => generateInvoice(booking)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            No bookings found matching the filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredBookings.length} of {bookings.length} bookings
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Booking Details - {selectedBooking.id}</DialogTitle>
              <DialogDescription>
                View and manage booking information
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Customer Information
                  </h4>
                  <p className="text-sm">{selectedBooking.customerName}</p>
                  <p className="text-sm">{selectedBooking.email}</p>
                  <p className="text-sm">{selectedBooking.phone}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" /> Tour Details
                  </h4>
                  <p className="text-sm">{selectedBooking.tourName}</p>
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" /> 
                    {selectedBooking.location}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Booking Information
                  </h4>
                  <p className="text-sm">Booked on: {format(selectedBooking.bookingDate, 'MMM dd, yyyy')}</p>
                  <p className="text-sm">Tour date: {format(selectedBooking.tourDate, 'MMM dd, yyyy')}</p>
                  <p className="text-sm">Participants: {selectedBooking.participants}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" /> Payment Details
                  </h4>
                  <p className="text-sm">Amount: ${selectedBooking.amount.toFixed(2)}</p>
                  <p className="text-sm">Payment Status: {selectedBooking.paymentStatus}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Update Booking Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedBooking.bookingStatus === 'confirmed' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button 
                    variant={selectedBooking.bookingStatus === 'pending' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => updateBookingStatus(selectedBooking.id, 'pending')}
                  >
                    Pending
                  </Button>
                  <Button 
                    variant={selectedBooking.bookingStatus === 'completed' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                  >
                    Complete
                  </Button>
                  <Button 
                    variant={selectedBooking.bookingStatus === 'cancelled' ? 'default' : 'outline'} 
                    size="sm"
                    className={selectedBooking.bookingStatus === 'cancelled' ? 'bg-red-500 hover:bg-red-600' : ''}
                    onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Update Payment Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedBooking.paymentStatus === 'paid' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => updatePaymentStatus(selectedBooking.id, 'paid')}
                  >
                    Mark as Paid
                  </Button>
                  <Button 
                    variant={selectedBooking.paymentStatus === 'pending' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => updatePaymentStatus(selectedBooking.id, 'pending')}
                  >
                    Mark as Pending
                  </Button>
                  <Button 
                    variant={selectedBooking.paymentStatus === 'refunded' ? 'default' : 'outline'} 
                    size="sm"
                    className={selectedBooking.paymentStatus === 'refunded' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                    onClick={() => updatePaymentStatus(selectedBooking.id, 'refunded')}
                  >
                    Mark as Refunded
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => generateInvoice(selectedBooking)}
              >
                Generate Invoice
              </Button>
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </SidebarProvider>
  );
};

export default BookedTours;