import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

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

const BookTour = () => {
  const [searchParams] = useSearchParams();
  const initialParkId = searchParams.get('park') || '';
  
  const [selectedPark, setSelectedPark] = useState(initialParkId);
  const [selectedTour, setSelectedTour] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('1');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const guestsNum = parseInt(guests);
    const amount = 75 * guestsNum;

    try {
      const response = await fetch('http://localhost:5000/api/book-tour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          parkName: parkTours.find(p => p.id.toString() === selectedPark)?.name,
          tourName: selectedTour,
          date,
          time,
          guests: guestsNum,
          amount,
          firstName,
          lastName,
          email,
          phone,
          specialRequests,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Tour booking submitted!",
          description: "You'll receive an email confirmation shortly.",
        });
        navigate('/payment', { 
          state: { 
            type: 'tour',
            amount,
            details: {
              park: parkTours.find(p => p.id.toString() === selectedPark)?.name,
              tour: selectedTour,
              date,
              time,
              guests: guestsNum,
              name: `${firstName} ${lastName}`,
              email,
            },
          },
        });
      } else {
        throw new Error(result.error || 'Failed to submit tour booking');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit tour booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-conservation-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-conservation-900">Book Your Park Tour</h1>
            <p className="mt-3 text-conservation-700">Experience the beauty of nature with our guided tours</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Tour Booking</CardTitle>
              <CardDescription>Fill in the details below to book your tour</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="park">Select Park</Label>
                    <Select 
                      value={selectedPark} 
                      onValueChange={setSelectedPark}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a park" />
                      </SelectTrigger>
                      <SelectContent>
                        {parkTours.map(park => (
                          <SelectItem key={park.id} value={park.id.toString()}>
                            {park.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="sm:col-span-2">
                    <Label htmlFor="tour">Select Tour</Label>
                    <Select 
                      value={selectedTour} 
                      onValueChange={setSelectedTour}
                      disabled={!selectedPark}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tour" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPark &&
                          parkTours
                            .find(p => p.id.toString() === selectedPark)
                            ?.tours.map(tour => (
                              <SelectItem key={tour} value={tour}>
                                {tour}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                  
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="pl-10"
                        required
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-conservation-500" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="guests">Number of Guests</Label>
                    <div className="relative">
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max="20"
                        value={guests}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 20)) {
                            setGuests(value);
                          }
                        }}
                        className="pl-10"
                        required
                      />
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-conservation-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:col-span-1">
                    <div className="text-xl font-semibold text-conservation-800">
                      $75 <span className="text-sm font-normal text-conservation-600">per person</span>
                    </div>
                    {guests && parseInt(guests) > 0 && (
                      <div className="text-conservation-700">
                        Total: ${75 * parseInt(guests)}
                      </div>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2 pt-4 border-t">
                    <h3 className="text-lg font-medium text-conservation-900">Personal Information</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="specialRequests">Special Requests (optional)</Label>
                    <Textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      placeholder="Tell us about any special needs or requests"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit}
                type="submit"
                className="w-full bg-conservation-600 hover:bg-conservation-700"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookTour;