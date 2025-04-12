import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TourBooking {
  id: string;
  park_name: string;
  tour_name: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  special_requests: string;
  created_at: string;
}

const BookedTours = () => {
  const { toast } = useToast();
  const [tours, setTours] = useState<TourBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTours, setFilteredTours] = useState<TourBooking[]>([]);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finance/tours', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTours(data);
        setFilteredTours(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch booked tours" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred" });
    }
  };

  useEffect(() => {
    const filtered = tours.filter(tour =>
      tour.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${tour.first_name} ${tour.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.tour_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.park_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTours(filtered);
  }, [searchQuery, tours]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader
            title="Booked Tours"
            subtitle="Overview of all booked tours"
          />
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>All Booked Tours</CardTitle>
                <div className="relative w-full md:w-1/3 mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tours..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Park Name</TableHead>
                      <TableHead>Tour Name</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tour Date</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Booking Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTours.length > 0 ? (
                      filteredTours.map((tour) => (
                        <TableRow key={tour.id}>
                          <TableCell>{tour.id}</TableCell>
                          <TableCell>{tour.park_name}</TableCell>
                          <TableCell>{tour.tour_name || 'N/A'}</TableCell>
                          
                          <TableCell>{`${tour.first_name} ${tour.last_name}`}</TableCell>
                          <TableCell>{tour.email}</TableCell>
                          <TableCell>{tour.date}</TableCell>
                          <TableCell>{tour.guests}</TableCell>
                          <TableCell>${tour.amount}.00</TableCell>
                          <TableCell>{tour.created_at}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No tours found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredTours.length} of {tours.length} tours
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BookedTours;